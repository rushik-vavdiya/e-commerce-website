import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as productService from '../services/productService';

const getError = (error) => error.response?.data?.message || error.message;
const createRequest = (name, serviceCall) => createAsyncThunk(name, async (args, { rejectWithValue }) => {
  try { return await serviceCall(args); } catch (error) { return rejectWithValue(getError(error)); }
});

export const fetchProducts = createRequest('products/fetch', productService.getProducts);
export const fetchProduct = createRequest('products/fetchOne', productService.getProduct);
export const addProduct = createRequest('products/create', productService.createProduct);
export const editProduct = createRequest('products/update', ({ productId, product }) => productService.updateProduct(productId, product));
export const removeProduct = createRequest('products/delete', productService.deleteProduct);
export const editProductStatus = createRequest('products/status', ({ productId, status }) => productService.setProductStatus(productId, status));
export const saveProductImages = createRequest('products/uploadImages', ({ productId, images }) => productService.uploadProductImages(productId, images));
export const saveVariantImages = createRequest('products/uploadVariantImages', ({ productId, variantId, images }) => productService.uploadVariantImages(productId, variantId, images));
export const removeProductMainImage = createRequest('products/deleteMainImage', productService.deleteProductMainImage);
export const removeProductGalleryImage = createRequest('products/deleteGalleryImage', ({ productId, imageIndex }) => productService.deleteProductGalleryImage(productId, imageIndex));
export const removeVariantMainImage = createRequest('products/deleteVariantMainImage', ({ productId, variantId }) => productService.deleteVariantMainImage(productId, variantId));
export const removeVariantGalleryImage = createRequest('products/deleteVariantGalleryImage', ({ productId, variantId, imageIndex }) => productService.deleteVariantGalleryImage(productId, variantId, imageIndex));

// The list args are recorded in the slice so a page can tell whether the rows
// it sees came from its own query and not from another page's request.
export const productListQueryKey = (args) => JSON.stringify(args ?? {});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    selected: null,
    loading: false,
    error: null,
    listQueryKey: null,
    selectedId: null,
    // { page, limit, total, pages } from the API, so a listing can page through
    // the whole catalog instead of showing whatever the first request returned.
    pagination: null,
  },
  reducers: { clearProductError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state, action) => { state.loading = true; state.error = null; state.listQueryKey = productListQueryKey(action.meta.arg); })
      .addCase(fetchProducts.fulfilled, (state, action) => { state.loading = false; state.items = action.payload.data; state.pagination = action.payload.pagination ?? null; })
      .addCase(fetchProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchProduct.pending, (state, action) => { state.loading = true; state.error = null; state.selectedId = action.meta.arg; })
      .addCase(fetchProduct.fulfilled, (state, action) => { state.loading = false; state.selected = action.payload.data; })
      .addCase(fetchProduct.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(addProduct.fulfilled, (state, action) => { state.items.unshift(action.payload.data); })
      .addCase(editProduct.fulfilled, (state, action) => { state.items = state.items.map((item) => item._id === action.payload.data._id ? action.payload.data : item); })
      .addCase(removeProduct.fulfilled, (state, action) => { state.items = state.items.filter((item) => item._id !== action.meta.arg); })
      .addCase(editProductStatus.fulfilled, (state, action) => { state.items = state.items.map((item) => item._id === action.payload.data._id ? action.payload.data : item); })
      .addCase(saveProductImages.fulfilled, (state, action) => { state.items = state.items.map((item) => item._id === action.payload.data._id ? action.payload.data : item); })
      .addCase(saveVariantImages.fulfilled, (state, action) => { state.items = state.items.map((item) => item._id === action.payload.data._id ? action.payload.data : item); })
      .addCase(removeProductMainImage.fulfilled, (state, action) => { state.items = state.items.map((item) => item._id === action.payload.data._id ? action.payload.data : item); })
      .addCase(removeProductGalleryImage.fulfilled, (state, action) => { state.items = state.items.map((item) => item._id === action.payload.data._id ? action.payload.data : item); })
      .addCase(removeVariantMainImage.fulfilled, (state, action) => { state.items = state.items.map((item) => item._id === action.payload.data._id ? action.payload.data : item); })
      .addCase(removeVariantGalleryImage.fulfilled, (state, action) => { state.items = state.items.map((item) => item._id === action.payload.data._id ? action.payload.data : item); });
  },
});

export const { clearProductError } = productSlice.actions;
export default productSlice.reducer;
