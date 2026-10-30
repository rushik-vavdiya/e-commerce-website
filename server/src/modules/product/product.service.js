import { productRepository } from "./product.repository.js";
import { deleteImage } from "../../services/cloudinary.service.js";
import { uploadToCloudinary } from "../../utils/cloudinary.js";
import Category from "../category/category.model.js";
import Vendor from "../vendor/vendor.model.js";
import { AppError } from "../../utils/AppError.js";

const removeImageFields = (productData) => {
  const cleanData = { ...productData };
  delete cleanData.mainImage;
  delete cleanData.mainImagePublicId;
  delete cleanData.galleryImages;
  delete cleanData.galleryImagePublicIds;

  if (Array.isArray(cleanData.variantCombinations)) {
    cleanData.variantCombinations = cleanData.variantCombinations.map((variant) => {
      const cleanVariant = { ...variant };
      delete cleanVariant.mainImage;
      delete cleanVariant.mainImagePublicId;
      delete cleanVariant.galleryImages;
      delete cleanVariant.galleryImagePublicIds;
      return cleanVariant;
    });
  }

  return cleanData;
};

// An edit replaces the whole variantCombinations array, so the images that were
// uploaded for an existing combination are copied back on by matching _id.
// Without this, saving a product from the form would drop its combination images.
const mergeCombinationImages = (incoming, existing) => {
  if (!Array.isArray(incoming)) return incoming;
  const byId = new Map(
    (existing ?? [])
      .filter((combination) => combination._id)
      .map((combination) => [String(combination._id), combination]),
  );

  return incoming.map((combination) => {
    const match = combination._id ? byId.get(String(combination._id)) : null;
    if (!match) return combination;
    return {
      ...combination,
      mainImage: match.mainImage ?? null,
      mainImagePublicId: match.mainImagePublicId ?? null,
      galleryImages: match.galleryImages ?? [],
      galleryImagePublicIds: match.galleryImagePublicIds ?? [],
    };
  });
};

export const getAllProducts = async (filters = {}) => {
  return await productRepository.filterProducts(filters);
};

// Options for the storefront's size, colour and price filters.
export const getProductFilterOptions = async () => {
  return await productRepository.getFilterOptions();
};

export const getProductById = async (id) => {
  const product = await productRepository.getProductById(id);
  return product;
};

// A store only has to exist (and be approved) when the product is linked to
// one. An admin product has no store, which is allowed.
export const findApprovedVendor = async (vendorId) => {
  if (!vendorId) return null;
  return Vendor.findOne({ _id: vendorId, approvalStatus: "approved", status: "active" });
};

export const createProduct = async (productData) => {
  const [category, vendor] = await Promise.all([
    Category.findById(productData.categoryId),
    findApprovedVendor(productData.vendorId),
  ]);
  if (!category) throw new AppError("Category not found", 404);
  if (productData.status === "active" && category.status !== "active")
    throw new AppError("Active category is required to publish a product", 400);
  if (productData.vendorId && !vendor) throw new AppError("Approved vendor not found", 404);
  const newProduct = await productRepository.createProduct(removeImageFields(productData));
  return newProduct;
};

export const updateProduct = async (id, productData) => {
  if (productData.categoryId) {
    const category = await Category.findById(productData.categoryId);
    if (!category) throw new AppError("Category not found", 404);
    if (productData.status === "active" && category.status !== "active")
      throw new AppError("Active category is required to publish a product", 400);
  }
  const cleanData = removeImageFields(productData);
  if (Array.isArray(productData.variantCombinations)) {
    const existing = await productRepository.getProductById(id);
    cleanData.variantCombinations = mergeCombinationImages(
      cleanData.variantCombinations,
      existing?.variantCombinations ?? [],
    );
  }
  const updatedProduct = await productRepository.updateProduct(id, cleanData);
  return updatedProduct;
};

export const deleteProduct = async (id) => {
  const product = await productRepository.deleteProduct(id);
  if (product) {
    const publicIds = [
      product.mainImagePublicId,
      ...(product.galleryImagePublicIds ?? []),
      ...(product.variantCombinations ?? []).flatMap((variant) => [
        variant.mainImagePublicId,
        ...(variant.galleryImagePublicIds ?? []),
      ]),
    ].filter(Boolean);

    for (const publicId of publicIds) {
      try {
        await deleteImage(publicId);
      } catch (error) {
        console.error("Could not delete product image from Cloudinary", error);
      }
    }
  }
  const deletedProduct = product;
  return deletedProduct;
};

export const changeProductStatus = async (id, status) => {
  if (status === "active") {
    const product = await productRepository.getProductById(id);
    if (!product) return null;
    const category = await Category.findById(product.categoryId);
    if (!category || category.status !== "active")
      throw new AppError("Active category is required to publish a product", 400);
    const vendor = await findApprovedVendor(product.vendorId);
    if (product.vendorId && !vendor) throw new AppError("Approved vendor not found", 404);
  }
  const updatedProduct = await productRepository.changeProductStatus(id, status);
  return updatedProduct;
};

// The routes validate the product, variant and upload shape before this runs;
// the rules here are about the product itself (it must exist, and the images
// must fit the gallery limit).
export const updateProductImages = async (productId, files, variantId) => {
  const product = await productRepository.getProductById(productId);
  if (!product) {
    throw new AppError("Product not found", 404);
  }

  const imageTarget = variantId ? product.variantCombinations.id(variantId) : product;
  if (!imageTarget) {
    throw new AppError("Product variant not found", 404);
  }

  const mainImageFile = files.mainImage?.[0];
  const galleryImageFiles = files.galleryImages ?? [];
  if (!mainImageFile && galleryImageFiles.length === 0) {
    throw new AppError("A product image is required", 400);
  }
  if (imageTarget.galleryImages.length + galleryImageFiles.length > 10) {
    throw new AppError("A maximum of 10 gallery images is allowed", 400);
  }

  const folder = variantId
    ? `products/${productId}/variants/${variantId}`
    : `products/${productId}`;
  const uploadedImages = [];
  try {
    const uploaded = await uploadToCloudinary(
      [mainImageFile, ...galleryImageFiles].filter(Boolean),
      { folder },
    );
    uploadedImages.push(...uploaded);
    const mainImage = mainImageFile ? uploaded[0] : undefined;
    const galleryImages = uploaded.slice(mainImageFile ? 1 : 0);

    const result = await productRepository.updateProductImages(productId, variantId, {
      mainImage,
      galleryImages,
    });
    if (!result) {
      throw new AppError(variantId ? "Product variant not found" : "Product not found", 404);
    }

    for (const publicId of result.oldPublicIds) {
      try {
        await deleteImage(publicId);
      } catch (error) {
        console.error("Could not delete replaced product image from Cloudinary", error);
      }
    }

    return result.product;
  } catch (error) {
    for (const image of uploadedImages) {
      try {
        await deleteImage(image.publicId);
      } catch (cleanupError) {
        console.error("Could not clean up uploaded product image", cleanupError);
      }
    }
    throw error;
  }
};

export const deleteProductImage = async (productId, imageType, imageIndex, variantId) => {
  if (!["main", "gallery"].includes(imageType)) {
    throw new AppError("Image type must be main or gallery", 400);
  }

  const result = await productRepository.deleteProductImage(
    productId,
    variantId,
    imageType,
    imageIndex,
  );
  if (!result) {
    throw new AppError(variantId ? "Product variant not found" : "Product not found", 404);
  }
  if (result.publicId) {
    try {
      await deleteImage(result.publicId);
    } catch (error) {
      console.error("Could not delete product image from Cloudinary", error);
    }
  }

  return result.product;
};
