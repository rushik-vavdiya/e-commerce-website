import {
  changeCategoryStatus,
  createCategory,
  deleteCategory,
  deleteCategoryImage as removeCategoryImage,
  getCategories,
  getCategory,
  setCategoryProducts,
  updateCategory,
  updateCategoryImages,
} from "./category.service.js";

const publicCategory = (category) => {
  const data = category.toObject ? category.toObject() : { ...category };
  delete data.imagePublicId;
  delete data.bannerImagePublicId;
  return data;
};

export const listCategories = async (req, res, next) => {
  try {
    // categorySearchSchema has already limited `search` to 100 characters.
    const categories = await getCategories((req.query.search ?? "").trim());
    const visibleCategories =
      req.user?.role === "admin"
        ? categories
        : categories.filter((category) => category.status === "active");
    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: visibleCategories.map(publicCategory),
    });
  } catch (error) {
    return next(error);
  }
};

export const getCategoryById = async (req, res, next) => {
  try {
    const category = await getCategory(req.params.categoryId);
    if (category.status !== "active" && req.user?.role !== "admin") {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Category fetched successfully",
      data: publicCategory(category),
    });
  } catch (error) {
    return next(error);
  }
};

export const createCategoryRecord = async (req, res, next) => {
  try {
    const category = await createCategory(req.body);
    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: publicCategory(category),
    });
  } catch (error) {
    return next(error);
  }
};

export const updateCategoryRecord = async (req, res, next) => {
  try {
    const category = await updateCategory(req.params.categoryId, req.body);
    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: publicCategory(category),
    });
  } catch (error) {
    return next(error);
  }
};

export const setCategoryProductsRecord = async (req, res, next) => {
  try {
    const category = await setCategoryProducts(
      req.params.categoryId,
      req.body.productIds,
    );
    return res.status(200).json({
      success: true,
      message: "Category products updated successfully",
      data: publicCategory(category),
    });
  } catch (error) {
    return next(error);
  }
};

export const removeCategory = async (req, res, next) => {
  try {
    await deleteCategory(req.params.categoryId);
    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

export const setCategoryStatus = async (req, res, next) => {
  try {
    const category = await changeCategoryStatus(req.params.categoryId, req.body.status);
    return res.status(200).json({
      success: true,
      message: "Category status updated successfully",
      data: publicCategory(category),
    });
  } catch (error) {
    return next(error);
  }
};

export const uploadCategoryImages = async (req, res, next) => {
  try {
    const category = await updateCategoryImages(req.params.categoryId, req.files);
    return res.status(200).json({
      success: true,
      message: "Category images updated successfully",
      data: publicCategory(category),
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteCategoryImage = async (req, res, next) => {
  try {
    const category = await removeCategoryImage(req.params.categoryId, req.params.imageType);
    return res.status(200).json({
      success: true,
      message: "Category image deleted successfully",
      data: publicCategory(category),
    });
  } catch (error) {
    return next(error);
  }
};
