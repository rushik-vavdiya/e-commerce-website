import Address from "./address.model.js";

export const addressRepository = {
  getAddressesByUserId: async (userId) => {
    const addresses = await Address.find({ userId }).sort({ createdAt: -1 });
    return addresses;
  },

  getAddressById: async (addressId, userId) => {
    const address = await Address.findOne({ _id: addressId, userId });
    return address;
  },

  createAddress: async (addressData) => {
    const address = await Address.create(addressData);
    return address;
  },

  updateAddress: async (addressId, userId, addressData) => {
    const address = await Address.findOneAndUpdate(
      { _id: addressId, userId },
      { $set: addressData },
      { new: true, runValidators: true },
    );
    return address;
  },

  deleteAddress: async (addressId, userId) => {
    const address = await Address.findOneAndDelete({ _id: addressId, userId });
    return address;
  },

  getMostRecentAddress: async (userId, excludeAddressId = null) => {
    const filter = { userId };
    if (excludeAddressId) filter._id = { $ne: excludeAddressId };
    return Address.findOne(filter).sort({ createdAt: -1 });
  },
  setDefaultAddress: async (addressId, userId) => {
    await Address.updateMany({ userId, _id: { $ne: addressId } }, { $set: { default: false } });
    return Address.findOneAndUpdate(
      { _id: addressId, userId },
      { $set: { default: true } },
      { new: true },
    );
  },
};
