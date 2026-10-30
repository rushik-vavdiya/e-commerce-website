import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as categoryService from "../services/categoryService";

const getError = (error) => error.response?.data?.message || error.message;
const createRequest = (name, serviceCall) =>
  createAsyncThunk(name, async (args, { rejectWithValue }) => {
    try {
      return await serviceCall(args);
    } catch (error) {
      return rejectWithValue(getError(error));
    }
  });

export const fetchCategories = createRequest(
  "categories/fetch",
  categoryService.getCategories,
);
export const fetchCategory = createRequest(
  "categories/fetchOne",
  categoryService.getCategory,
);
export const addCategory = createRequest(
  "categories/create",
  categoryService.createCategory,
);
export const editCategory = createRequest(
  "categories/update",
  ({ categoryId, category }) =>
    categoryService.updateCategory(categoryId, category),
);
export const removeCategory = createRequest(
  "categories/delete",
  categoryService.deleteCategory,
);
export const editCategoryStatus = createRequest(
  "categories/status",
  ({ categoryId, status }) =>
    categoryService.setCategoryStatus(categoryId, status),
);
export const saveCategoryProducts = createRequest(
  "categories/products",
  ({ categoryId, productIds }) =>
    categoryService.setCategoryProducts(categoryId, productIds),
);
export const saveCategoryImages = createRequest(
  "categories/images",
  ({ categoryId, images }) =>
    categoryService.uploadCategoryImages(categoryId, images),
);
export const removeCategoryImage = createRequest(
  "categories/deleteImage",
  ({ categoryId, imageType }) =>
    categoryService.deleteCategoryImage(categoryId, imageType),
);

const categorySlice = createSlice({
  name: "categories",
  initialState: { items: [], selected: null, loading: false, error: null },
  reducers: {
    clearCategoryError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCategory.fulfilled, (state, action) => {
        state.selected = action.payload.data;
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.items.unshift(action.payload.data);
      })
      .addCase(editCategory.fulfilled, (state, action) => {
        state.items = state.items.map((item) =>
          item._id === action.payload.data._id ? action.payload.data : item,
        );
      })
      .addCase(removeCategory.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (item) => item._id !== action.meta.arg,
        );
      })
      .addCase(editCategoryStatus.fulfilled, (state, action) => {
        state.items = state.items.map((item) =>
          item._id === action.payload.data._id ? action.payload.data : item,
        );
      })
      .addCase(saveCategoryProducts.fulfilled, (state, action) => {
        state.items = state.items.map((item) =>
          item._id === action.payload.data._id ? action.payload.data : item,
        );
      })
      .addCase(saveCategoryImages.fulfilled, (state, action) => {
        state.items = state.items.map((item) =>
          item._id === action.payload.data._id ? action.payload.data : item,
        );
      })
      .addCase(removeCategoryImage.fulfilled, (state, action) => {
        state.items = state.items.map((item) =>
          item._id === action.payload.data._id ? action.payload.data : item,
        );
      });
  },
});

export const { clearCategoryError } = categorySlice.actions;
export default categorySlice.reducer;
