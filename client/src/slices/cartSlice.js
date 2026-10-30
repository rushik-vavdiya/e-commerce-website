import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import * as cartService from '../services/cartService';

// Read a short message from a rejected request.
const getError = (error) => {
  return error.response?.data?.message || error.message;
};

// Build an async thunk that calls one cart endpoint.
const createRequest = (name, serviceCall) =>
  createAsyncThunk(name, async (args, { rejectWithValue }) => {
    try {
      return await serviceCall(args);
    } catch (error) {
      return rejectWithValue(getError(error));
    }
  });


// Load the signed-in customer's cart.
export const fetchCart = createRequest('cart/fetch', cartService.getCart);

// Put a product, with its chosen size, into the cart.
export const addToCart = createRequest('cart/add', cartService.addCartProduct);

// Change the quantity of one cart line.
export const changeCartQuantity = createRequest(
  'cart/update',
  ({ itemId, quantity }) => cartService.updateCartProduct(itemId, quantity),
);

// Take one line out of the cart.
export const removeFromCart = createRequest('cart/remove', cartService.removeCartProduct);

// Empty the whole cart.
export const emptyCart = createRequest('cart/clear', cartService.clearCart);


// A confirmation for the drawer: raised when a change lands, cleared once the
// drawer has shown it. `seq` gives every banner its own key, so the same
// message twice (two quantity taps) still animates in twice.
const setNotice = (state, kind) => {
  state.noticeSeq += 1;
  state.notice = { kind, seq: state.noticeSeq };
};

// The cart the header, the drawer and the checkout page all read from.
const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    cart: null,
    loading: false,
    error: null,
    drawerOpen: false,
    notice: null,
    noticeSeq: 0,
  },
  reducers: {
    // Dismiss the drawer's confirmation line (called when its timer drains).
    clearCartNotice: (state) => {
      state.notice = null;
    },
    // Clear the cart state, keeping the drawer flag as it is.
    resetCart: (state) => {
      state.cart = null;
      state.error = null;
    },

    // Slide the cart drawer open — raised once an item lands in the bag.
    openCartDrawer: (state) => {
      state.drawerOpen = true;
    },

    // Slide the cart drawer closed.
    closeCartDrawer: (state) => {
      state.drawerOpen = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload.data;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload.data;
        setNotice(state, 'added');
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(changeCartQuantity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changeCartQuantity.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload.data;
        setNotice(state, 'updated');
      })
      .addCase(changeCartQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload.data;
        setNotice(state, 'removed');
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(emptyCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(emptyCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload.data;
      })
      .addCase(emptyCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  resetCart,
  openCartDrawer,
  closeCartDrawer,
  clearCartNotice,
} = cartSlice.actions;

export default cartSlice.reducer;
