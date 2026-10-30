import Cart from "./cart.model.js";

export const cartRepository = {
  getCartByUserId: async (userId) => {
    const cart = await Cart.findOne({ userId }).populate("products.productId");
    return cart;
  },

  createCart: async (userId) => {
    const cart = await Cart.create({ userId, products: [] });
    return cart;
  },

  addProduct: async (userId, productId, variantId, quantity) => {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      const newCart = await Cart.create({
        userId,
        products: [{ productId, variantId, quantity }],
      });
      return newCart.populate("products.productId");
    }

    const item = cart.products.find(
      (product) =>
        product.productId.toString() === productId.toString() &&
        String(product.variantId || "") === String(variantId || ""),
    );

    if (item) {
      item.quantity += quantity;
    } else {
      cart.products.push({ productId, variantId, quantity });
    }

    await cart.save();
    return cart.populate("products.productId");
  },

  updateProductQuantity: async (userId, itemId, quantity) => {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return null;
    }

    const item = cart.products.id(itemId);
    if (!item) {
      return null;
    }

    item.quantity = quantity;
    await cart.save();
    return cart.populate("products.productId");
  },

  removeProduct: async (userId, itemId) => {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return null;
    }

    const item = cart.products.id(itemId);
    if (!item) {
      return null;
    }

    item.deleteOne();
    await cart.save();
    return cart.populate("products.productId");
  },

  clearCart: async (userId) => {
    const cart = await Cart.findOneAndUpdate(
      { userId },
      { $set: { products: [] } },
      { new: true },
    ).populate("products.productId");
    return cart;
  },
};
