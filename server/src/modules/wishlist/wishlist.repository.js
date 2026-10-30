import Wishlist from "./wishlist.model.js";

export const wishlistRepository = {
  getWishlistByUserId: async (userId) => {
    const wishlist = await Wishlist.findOne({ userId }).populate("products");
    return wishlist;
  },

  createWishlist: async (userId) => {
    const wishlist = await Wishlist.create({ userId, products: [] });
    return wishlist;
  },

  addProduct: async (userId, productId) => {
    const wishlist = await Wishlist.findOneAndUpdate(
      { userId },
      { $addToSet: { products: productId } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    ).populate("products");
    return wishlist;
  },

  removeProduct: async (userId, productId) => {
    const wishlist = await Wishlist.findOneAndUpdate(
      { userId },
      { $pull: { products: productId } },
      { new: true },
    ).populate("products");
    return wishlist;
  },
};
