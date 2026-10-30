import { productRepository } from "../product/product.repository.js";
import { wishlistRepository } from "./wishlist.repository.js";
import { AppError } from "../../utils/AppError.js";

export const getWishlist = async (userId) => {
  let wishlist = await wishlistRepository.getWishlistByUserId(userId);

  if (!wishlist) {
    wishlist = await wishlistRepository.createWishlist(userId);
  }

  return wishlist;
};

export const addWishlistProduct = async (userId, productId) => {
  const product = await productRepository.getProductById(productId);
  if (!product || product.status !== "active") {
    throw new AppError("Product not found", 404);
  }

  const wishlist = await wishlistRepository.addProduct(userId, productId);
  return wishlist;
};

export const removeWishlistProduct = async (userId, productId) => {
  const wishlist = await wishlistRepository.removeProduct(userId, productId);
  if (!wishlist) {
    throw new AppError("Wishlist not found", 404);
  }

  return wishlist;
};
