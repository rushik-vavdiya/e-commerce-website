import { configureStore } from '@reduxjs/toolkit';
import addressReducer from '../slices/addressSlice';
import authReducer from '../slices/authSlice';
import cartReducer from '../slices/cartSlice';
import categoryReducer from '../slices/categorySlice';
import contentReducer from '../slices/contentSlice';
import productReducer from '../slices/productSlice';
import userReducer from '../slices/userSlice';
import wishlistReducer from '../slices/wishlistSlice';
import orderReducer from '../slices/orderSlice';
import paymentReducer from '../slices/paymentSlice';
import vendorReducer from '../slices/vendorSlice';
import couponReducer from '../slices/couponSlice';
import reviewReducer from '../slices/reviewSlice';
import vendorReviewReducer from '../slices/vendorReviewSlice';
import websiteReviewReducer from '../slices/websiteReviewSlice';
import adminReducer from '../slices/adminSlice';
import newsletterReducer from '../slices/newsletterSlice';
import contactReducer from '../slices/contactSlice';
import siteSettingsReducer from '../slices/siteSettingsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    products: productReducer,
    categories: categoryReducer,
    content: contentReducer,
    wishlist: wishlistReducer,
    cart: cartReducer,
    addresses: addressReducer,
    orders: orderReducer,
    payments: paymentReducer,
    vendor: vendorReducer,
    coupons: couponReducer,
    reviews: reviewReducer,
    vendorReviews: vendorReviewReducer,
    websiteReviews: websiteReviewReducer,
    admin: adminReducer,
    newsletter: newsletterReducer,
    contact: contactReducer,
    siteSettings: siteSettingsReducer,
  },
});

export default store;
