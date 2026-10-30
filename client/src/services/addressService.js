import api from "./api";

export const getAddresses = async () => (await api.get("/addresses")).data;
export const getAddress = async (addressId) =>
  (await api.get(`/addresses/${addressId}`)).data;
export const createAddress = async (address) =>
  (await api.post("/addresses", address)).data;
export const updateAddress = async (addressId, address) =>
  (await api.patch(`/addresses/${addressId}`, address)).data;
export const deleteAddress = async (addressId) =>
  (await api.delete(`/addresses/${addressId}`)).data;
