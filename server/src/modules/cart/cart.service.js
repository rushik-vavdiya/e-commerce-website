import { productRepository } from "../product/product.repository.js";
import { cartRepository } from "./cart.repository.js";
import { AppError } from "../../utils/AppError.js";

export const getCart = async (userId) => {
  let cart = await cartRepository.getCartByUserId(userId);

  if (!cart) {
    cart = await cartRepository.createCart(userId);
  }

  return cart;
};

// addCartProductSchema has already checked the product, variant and quantity,
// so this only applies the business rules: the product must be sellable and
// there must be enough stock for the extra quantity.
export const addCartProduct = async (userId, productId, variantId, quantity = 1) => {
  const product = await productRepository.getProductById(productId);
  if (!product || product.status !== "active") {
    throw new AppError("Product not found", 404);
  }

  let availableStock = product.stock;
  if (variantId) {
    const variant = product.variantCombinations.id(variantId);
    if (!variant) {
      throw new AppError("Product variant not found", 404);
    }
    availableStock = variant.stock;
  }

  const currentCart = await cartRepository.getCartByUserId(userId);
  const existingItem = currentCart?.products.find(
    (item) =>
      item.productId._id?.toString() === productId.toString() &&
      String(item.variantId || "") === String(variantId || ""),
  );
  if (quantity + (existingItem?.quantity ?? 0) > availableStock) {
    throw new AppError("Not enough product stock", 409);
  }

  const cart = await cartRepository.addProduct(userId, productId, variantId, quantity);
  return cart;
};

export const updateCartProduct = async (userId, itemId, quantity) => {
  const currentCart = await cartRepository.getCartByUserId(userId);
  const currentItem = currentCart?.products.id(itemId);
  if (!currentItem) {
    throw new AppError("Cart item not found", 404);
  }

  const product = currentItem.productId;
  if (!product) {
    throw new AppError("Product not found", 404);
  }
  let availableStock = product.stock;
  if (currentItem.variantId) {
    const variant = product.variantCombinations.id(currentItem.variantId);
    if (!variant) {
      throw new AppError("Product variant not found", 404);
    }
    availableStock = variant.stock;
  }
  if (quantity > availableStock) {
    throw new AppError("Not enough product stock", 409);
  }

  const cart = await cartRepository.updateProductQuantity(userId, itemId, quantity);
  if (!cart) {
    throw new AppError("Cart item not found", 404);
  }
  return cart;
};

export const removeCartProduct = async (userId, itemId) => {
  const cart = await cartRepository.removeProduct(userId, itemId);
  if (!cart) {
    throw new AppError("Cart item not found", 404);
  }
  return cart;
};

export const clearCart = async (userId) => {
  const cart = await cartRepository.clearCart(userId);
  if (!cart) {
    throw new AppError("Cart not found", 404);
  }
  return cart;
};
