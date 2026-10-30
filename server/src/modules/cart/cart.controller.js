import {
  addCartProduct,
  clearCart,
  getCart,
  removeCartProduct,
  updateCartProduct,
} from "./cart.service.js";

export const getCartController = async (req, res, next) => {
  try {
    const cart = await getCart(req.user.id);
    return res.status(200).json({ success: true, message: "Cart fetched", data: cart });
  } catch (error) {
    return next(error);
  }
};

export const addCartProductController = async (req, res, next) => {
  try {
    const { productId, variantId, quantity } = req.body;
    const cart = await addCartProduct(req.user.id, productId, variantId, quantity ?? 1);
    return res.status(200).json({ success: true, message: "Product added to cart", data: cart });
  } catch (error) {
    return next(error);
  }
};

export const updateCartProductController = async (req, res, next) => {
  try {
    const cart = await updateCartProduct(req.user.id, req.params.itemId, req.body.quantity);
    return res.status(200).json({ success: true, message: "Cart quantity updated", data: cart });
  } catch (error) {
    return next(error);
  }
};

export const removeCartProductController = async (req, res, next) => {
  try {
    const cart = await removeCartProduct(req.user.id, req.params.itemId);
    return res
      .status(200)
      .json({ success: true, message: "Product removed from cart", data: cart });
  } catch (error) {
    return next(error);
  }
};

export const clearCartController = async (req, res, next) => {
  try {
    const cart = await clearCart(req.user.id);
    return res.status(200).json({ success: true, message: "Cart cleared", data: cart });
  } catch (error) {
    return next(error);
  }
};
