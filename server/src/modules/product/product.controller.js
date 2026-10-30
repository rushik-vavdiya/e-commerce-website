import {
  changeProductStatus,
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  getProductFilterOptions,
  updateProductImages,
  deleteProductImage,
  updateProduct,
} from "./product.service.js";
import Vendor from "../vendor/vendor.model.js";

const editableProductFields = [
  "vendorId",
  "name",
  "description",
  "price",
  "comarePrice",
  "stock",
  "weight",
  "dimensions",
  "sku",
  "categoryId",
  "categoryIds",
  "productSpecifications",
  "variants",
  "variantCombinations",
];

const getVendor = async (req) =>
  Vendor.findOne({
    userId: req.user.id,
    approvalStatus: "approved",
    status: "active",
  });

const canManageProduct = async (req, productId) => {
  if (req.user.role === "admin") return true;
  if (req.user.role !== "vendor") return false;
  const [vendor, product] = await Promise.all([getVendor(req), getProductById(productId)]);
  return Boolean(
    vendor && product?.vendorId && product.vendorId.toString() === vendor._id.toString(),
  );
};

const permittedProductData = (body, isAdmin) =>
  Object.fromEntries(
    Object.entries(body).filter(
      ([key]) => editableProductFields.includes(key) && (isAdmin || key !== "vendorId"),
    ),
  );

// The filter rail's own data: the sizes and colours the catalogue carries and
// its price band. Public — the storefront shows it before anyone signs in.
export const getProductFilters = async (req, res, next) => {
  try {
    const options = await getProductFilterOptions();
    return res.status(200).json({
      success: true,
      message: "Product filter options fetched",
      data: options,
    });
  } catch (error) {
    return next(error);
  }
};

export const listProducts = async (req, res, next) => {
  try {
    // The query rules live in product.validator.js, so this is already checked
    // and coerced: numbers are numbers and the enums are real values.
    const filters = { ...(req.validated?.query ?? {}) };

    if (req.user?.role === "vendor") {
      const vendor = await getVendor(req);
      if (!vendor)
        return res.status(403).json({ success: false, message: "Vendor account is not approved" });
      filters.vendorId = vendor._id.toString();
    } else if (req.user?.role !== "admin") {
      filters.status = "active";
    }
    const result = await getAllProducts(filters);
    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: result.items,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        pages: Math.ceil(result.total / result.limit),
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getProductByIdRecord = async (req, res, next) => {
  try {
    const product = await getProductById(req.params.productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const ownsProduct = req.user?.role === "vendor" && (await canManageProduct(req, product._id));
    if (product.status !== "active" && req.user?.role !== "admin" && !ownsProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: product,
    });
  } catch (error) {
    return next(error);
  }
};

export const createProductRecord = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === "admin";
    let vendorId = null;
    if (isAdmin) {
      // The admin form has no vendor picker. An admin product is owned by the
      // marketplace itself, so it stays without a store unless the request
      // explicitly sends one. It can be published without waiting for a vendor.
      vendorId = req.body.vendorId || null;
    } else {
      const vendor = await getVendor(req);
      if (!vendor)
        return res.status(403).json({ success: false, message: "Vendor account is not approved" });
      vendorId = vendor._id;
    }
    const data = permittedProductData(req.body, isAdmin);
    data.vendorId = vendorId;
    if (!isAdmin) data.status = "draft";
    const product = await createProduct(data);
    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateProductRecord = async (req, res, next) => {
  try {
    if (!(await canManageProduct(req, req.params.productId))) {
      return res.status(403).json({ success: false, message: "You cannot update this product" });
    }
    const data = permittedProductData(req.body, req.user.role === "admin");
    if (req.user.role === "vendor") data.status = "draft";
    const product = await updateProduct(req.params.productId, data);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    return next(error);
  }
};

export const removeProduct = async (req, res, next) => {
  try {
    if (!(await canManageProduct(req, req.params.productId))) {
      return res.status(403).json({ success: false, message: "You cannot delete this product" });
    }
    const product = await deleteProduct(req.params.productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: product,
    });
  } catch (error) {
    return next(error);
  }
};

export const setProductStatus = async (req, res, next) => {
  try {
    const product = await changeProductStatus(req.params.productId, req.body.status);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product status updated successfully",
      data: product,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateProductImagesController = async (req, res, next) => {
  try {
    if (!(await canManageProduct(req, req.params.productId))) {
      return res
        .status(403)
        .json({ success: false, message: "You cannot change images for this product" });
    }
    const product = await updateProductImages(
      req.params.productId,
      req.files ?? {},
      req.params.variantId,
    );

    return res.status(200).json({
      success: true,
      message: "Product images updated successfully",
      data: product,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteProductImageController = async (req, res, next) => {
  try {
    if (!(await canManageProduct(req, req.params.productId))) {
      return res
        .status(403)
        .json({ success: false, message: "You cannot change images for this product" });
    }
    const imageIndex =
      req.params.imageIndex === undefined ? undefined : Number(req.params.imageIndex);
    const imageType = req.params.imageIndex === undefined ? "main" : "gallery";
    const product = await deleteProductImage(
      req.params.productId,
      imageType,
      imageIndex,
      req.params.variantId,
    );

    return res.status(200).json({
      success: true,
      message: "Product image deleted successfully",
      data: product,
    });
  } catch (error) {
    return next(error);
  }
};
