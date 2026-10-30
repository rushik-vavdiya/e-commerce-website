import { categoryRepository } from "./category.repository.js";
import { createUniqueSlug } from "../../utils/slugify.js";
import { deleteImage } from "../../services/cloudinary.service.js";
import { uploadToCloudinary } from "../../utils/cloudinary.js";
import Product from "../product/product.model.js";
import { AppError } from "../../utils/AppError.js";

const categoryFields = ["name", "description", "parentCategoryId", "level", "status"];

export const createCategory = async (categoryData) => {
  const safeCategoryData = Object.fromEntries(
    Object.entries(categoryData).filter(([key]) => categoryFields.includes(key)),
  );

  if (safeCategoryData.parentCategoryId) {
    const parent = await categoryRepository.getCategoryById(safeCategoryData.parentCategoryId);
    if (!parent) throw new AppError("Parent category not found", 404);
    safeCategoryData.level = parent.level + 1;
  } else {
    safeCategoryData.level = 0;
  }

  const existingCategory = await categoryRepository.findCategoryByName(categoryData.name);

  if (existingCategory) {
    throw new AppError("Category with this name already exists", 409);
  }

  const slug = await createUniqueSlug(categoryData.name, categoryRepository.findCategoryBySlug);

  return await categoryRepository.createCategory({
    ...safeCategoryData,
    slug,
  });
};

export const getCategories = async (search = "") => {
  return await categoryRepository.getAllCategories(search);
};

export const getCategory = async (categoryId) => {
  const category = await categoryRepository.getCategoryById(categoryId);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return category;
};

export const updateCategory = async (categoryId, updateData) => {
  updateData = Object.fromEntries(
    Object.entries(updateData).filter(([key]) => categoryFields.includes(key)),
  );

  const category = await categoryRepository.getCategoryById(categoryId);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  if (updateData.parentCategoryId) {
    if (updateData.parentCategoryId.toString() === categoryId.toString()) {
      throw new AppError("Category cannot be its own parent", 400);
    }
    const parent = await categoryRepository.getCategoryById(updateData.parentCategoryId);
    if (!parent) throw new AppError("Parent category not found", 404);
    updateData.level = parent.level + 1;
  } else if (updateData.parentCategoryId === null) {
    updateData.level = 0;
  }

  if (updateData.name) {
    const existingCategory = await categoryRepository.findCategoryByName(updateData.name);

    if (existingCategory && existingCategory._id.toString() !== categoryId.toString()) {
      throw new AppError("Category with this name already exists", 409);
    }

    updateData.slug = await createUniqueSlug(updateData.name, async (slug) => {
      const existing = await categoryRepository.findCategoryBySlug(slug);

      if (existing && existing._id.toString() === categoryId.toString()) {
        return null;
      }

      return existing;
    });
  }

  return await categoryRepository.updateCategory(categoryId, updateData);
};

export const deleteCategory = async (categoryId) => {
  const category = await categoryRepository.getCategoryById(categoryId);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  const [hasProducts, children] = await Promise.all([
    // A product can also be listed in this category through categoryIds, so
    // both have to be clear before the category can go.
    Product.exists({ $or: [{ categoryId }, { categoryIds: categoryId }] }),
    categoryRepository.findChildCategories(categoryId),
  ]);
  if (hasProducts || children.length) {
    throw new AppError("Category is still used by products or child categories", 409);
  }

  const deletedCategory = await categoryRepository.deleteCategory(categoryId);
  const publicIds = [category.imagePublicId, category.bannerImagePublicId].filter(Boolean);
  for (const publicId of publicIds) {
    try {
      await deleteImage(publicId);
    } catch (error) {
      console.error("Could not delete category image from Cloudinary", error);
    }
  }
  return deletedCategory;
};

// Replaces the set of products listed in a category. A product's own categoryId
// is its required main category, so those stay put and cannot be unchecked from
// another category's form; everything else is held in categoryIds, which the
// product filter treats as category membership too.
export const setCategoryProducts = async (categoryId, productIds = []) => {
  const category = await categoryRepository.getCategoryById(categoryId);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  const wanted = [...new Set(productIds.map((id) => String(id)))];

  // Remove this category from every product that is not its main category...
  await Product.updateMany(
    { categoryIds: categoryId, categoryId: { $ne: categoryId } },
    { $pull: { categoryIds: categoryId } },
  );

  // ...then add it back for the ones the admin ticked.
  if (wanted.length > 0) {
    await Product.updateMany(
      { _id: { $in: wanted }, categoryId: { $ne: categoryId } },
      { $addToSet: { categoryIds: categoryId } },
    );
  }

  // The category keeps its own product list, which the admin list reads.
  const members = await Product.find({
    $or: [{ categoryId }, { categoryIds: categoryId }],
  }).distinct("_id");

  const updatedCategory = await categoryRepository.updateCategory(categoryId, {
    products: members,
  });

  return updatedCategory;
};

export const changeCategoryStatus = async (categoryId, status) => {
  const category = await categoryRepository.getCategoryById(categoryId);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  if (!["active", "draft"].includes(status)) {
    throw new AppError("Status must be active or draft", 400);
  }

  return await categoryRepository.updateCategory(categoryId, {
    status,
  });
};

export const updateCategoryImages = async (categoryId, files = {}) => {
  const category = await categoryRepository.getCategoryById(categoryId);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  const imageFile = files.image?.[0];
  const bannerFile = files.bannerImage?.[0];
  if (!imageFile && !bannerFile) {
    throw new AppError("At least one category image or banner image is required", 400);
  }

  const uploaded = {};
  try {
    if (imageFile) {
      uploaded.image = await uploadToCloudinary(imageFile, {
        folder: "categories/images",
      });
    }
    if (bannerFile) {
      uploaded.bannerImage = await uploadToCloudinary(bannerFile, {
        folder: "categories/banners",
      });
    }
  } catch (error) {
    const cleanupErrors = [];
    for (const image of Object.values(uploaded)) {
      try {
        await deleteImage(image.publicId);
      } catch (cleanupError) {
        cleanupErrors.push(cleanupError);
      }
    }
    if (cleanupErrors.length) {
      throw new AggregateError(
        [error, ...cleanupErrors],
        "Category image upload failed and uploaded images could not all be cleaned up",
      );
    }
    throw error;
  }

  const updateData = {};
  if (uploaded.image) {
    updateData.image = uploaded.image.url;
    updateData.imagePublicId = uploaded.image.publicId;
  }
  if (uploaded.bannerImage) {
    updateData.bannerImage = uploaded.bannerImage.url;
    updateData.bannerImagePublicId = uploaded.bannerImage.publicId;
  }

  let updatedCategory;
  try {
    updatedCategory = await categoryRepository.updateCategory(categoryId, updateData);
  } catch (error) {
    const cleanupErrors = [];
    for (const image of Object.values(uploaded)) {
      try {
        await deleteImage(image.publicId);
      } catch (cleanupError) {
        cleanupErrors.push(cleanupError);
      }
    }
    if (cleanupErrors.length) {
      throw new AggregateError(
        [error, ...cleanupErrors],
        "Category update failed and uploaded images could not all be cleaned up",
      );
    }
    throw error;
  }

  if (!updatedCategory) {
    for (const image of Object.values(uploaded)) {
      await deleteImage(image.publicId);
    }
    throw new AppError("Category not found", 404);
  }

  const oldPublicIds = [];
  if (uploaded.image && category.imagePublicId) {
    oldPublicIds.push(category.imagePublicId);
  }
  if (uploaded.bannerImage && category.bannerImagePublicId) {
    oldPublicIds.push(category.bannerImagePublicId);
  }
  for (const publicId of oldPublicIds) {
    try {
      await deleteImage(publicId);
    } catch (error) {
      console.error("Could not delete replaced category image from Cloudinary", error);
    }
  }

  return updatedCategory;
};

export const deleteCategoryImage = async (categoryId, imageType) => {
  const fields = {
    image: ["image", "imagePublicId"],
    banner: ["bannerImage", "bannerImagePublicId"],
  };
  const selectedFields = fields[imageType];
  if (!selectedFields) {
    throw new AppError("Image type must be image or banner", 400);
  }

  const category = await categoryRepository.getCategoryById(categoryId);
  if (!category) {
    throw new AppError("Category not found", 404);
  }

  const [urlField, publicIdField] = selectedFields;
  if (!category[urlField]) {
    throw new AppError(`Category ${imageType} image not found`, 404);
  }

  const updatedCategory = await categoryRepository.updateCategory(categoryId, {
    [urlField]: null,
    [publicIdField]: null,
  });

  if (!updatedCategory) {
    throw new AppError("Category not found", 404);
  }

  if (category[publicIdField]) {
    try {
      await deleteImage(category[publicIdField]);
    } catch (error) {
      console.error("Could not delete category image from Cloudinary", error);
    }
  }

  return updatedCategory;
};
