import { addWishlistProduct, getWishlist, removeWishlistProduct } from "./wishlist.service.js";

export const getWishlistController = async (req, res, next) => {
  try {
    const wishlist = await getWishlist(req.user.id);
    return res.status(200).json({ success: true, message: "Wishlist fetched", data: wishlist });
  } catch (error) {
    return next(error);
  }
};

export const addWishlistProductController = async (req, res, next) => {
  try {
    const wishlist = await addWishlistProduct(req.user.id, req.body.productId);
    return res
      .status(200)
      .json({ success: true, message: "Product added to wishlist", data: wishlist });
  } catch (error) {
    if (error.message === "Invalid product ID") {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error.message === "Product not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    return next(error);
  }
};

export const removeWishlistProductController = async (req, res, next) => {
  try {
    const wishlist = await removeWishlistProduct(req.user.id, req.params.productId);
    return res
      .status(200)
      .json({ success: true, message: "Product removed from wishlist", data: wishlist });
  } catch (error) {
    if (error.message === "Invalid product ID") {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error.message === "Wishlist not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    return next(error);
  }
};
