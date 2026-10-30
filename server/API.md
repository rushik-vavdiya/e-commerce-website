# Backend API reference

This document describes the HTTP endpoints registered by the Rynova backend.

## Base URL and conventions

- Local development base URL: `http://localhost:5000/api` (the port can be changed with `PORT`).
- All paths below are relative to `/api`. For example, `GET /products` means `GET http://localhost:5000/api/products`.
- JSON endpoints accept and return JSON. Image and review-media endpoints use `multipart/form-data`.
- Successful responses generally use `{ "success": true, "message": "...", "data": ... }`. List endpoints may return a `pagination` object. Errors are passed to the shared error middleware and use a `success: false` response.
- Replace path parameters such as `:productId` with the corresponding record ID.
- Endpoints marked **Bearer** require `Authorization: Bearer <access-token>`. The token must be valid and belong to an active user. Endpoints marked **Admin**, **Customer**, or **Vendor** additionally require that role.
- Public endpoints do not require a token unless stated otherwise. Product and category reads accept an optional valid bearer token to allow admins and vendors to see records that are not public.

## Health

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | Public | Confirms that the API process is responding. Returns a success flag and the message `Rynova API is running`. |

## Authentication

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Public; rate limited | Creates a customer account and attempts to send an email verification code. The response includes `verificationEmailSent`; if delivery fails, the account is still created and the user can sign in or request another code. |
| `POST` | `/auth/login` | Public; rate limited | Authenticates the supplied account credentials and returns an access token. |
| `POST` | `/auth/verify-email` | Public; rate limited | Verifies an email address using the one-time code sent during registration. |
| `POST` | `/auth/resend-verification` | Public; rate limited | Sends a replacement email verification code. |
| `POST` | `/auth/forgot-password` | Public; rate limited | Starts password recovery by sending a one-time code to the supplied email address. |
| `POST` | `/auth/reset-password` | Public; rate limited | Resets the password after validating the account email and recovery code. |
| `POST` | `/auth/logout` | Bearer | Invalidates the user's issued access tokens. |
| `PATCH` | `/auth/change-password` | Bearer | Changes the signed-in user's password after validating the current password and new password. |

## Users and profile

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/users/me` | Bearer | Returns the signed-in user's account/profile information. |
| `PATCH` | `/users/me` | Bearer | Updates editable fields on the signed-in user's profile. |
| `GET` | `/users/me/profile-picture` | Bearer | Returns the signed-in user's profile-picture resource. |
| `PUT` | `/users/me/profile-picture` | Bearer; multipart field `image` | Uploads or replaces the signed-in user's profile picture. |
| `DELETE` | `/users/me/profile-picture` | Bearer | Removes the signed-in user's profile picture. |
| `DELETE` | `/users/me` | Bearer | Deletes the signed-in user's account and removes its stored profile-picture asset when present. |
| `PATCH` | `/users/:userId/status` | Admin | Changes the target user's account status. The status is supplied in the JSON body. |

## Categories

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/categories` | Public; optional Bearer | Lists categories. Supports the validated category search query; public users see publicly available categories, while admins can also see drafts. |
| `GET` | `/categories/:categoryId` | Public; optional Bearer | Fetches one category by ID. Admins can also retrieve draft categories. |
| `POST` | `/categories` | Admin | Creates a category using the supplied category data. |
| `PUT` | `/categories/:categoryId` | Admin | Replaces/updates the category's editable data. |
| `PATCH` | `/categories/:categoryId/status` | Admin | Changes whether the category is active/published or in draft status. |
| `DELETE` | `/categories/:categoryId` | Admin | Deletes a category. |
| `PUT` | `/categories/:categoryId/images` | Admin; multipart fields `image`, `bannerImage` | Uploads or replaces the category image and/or banner image. |
| `DELETE` | `/categories/:categoryId/images/:imageType` | Admin | Deletes the selected category image (`imageType` identifies the image field). |

## Products and product images

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/products` | Public; optional Bearer | Lists active products for public visitors. Validated query filters include search, category, price range, sorting, page, and page size; admins and vendors can also see records available to their role, with vendor access scoped to their own records where applicable. |
| `GET` | `/products/:productId` | Public; optional Bearer | Fetches product details. Vendors can also read their own non-public product records. |
| `POST` | `/products` | Admin or approved Vendor | Creates a product. Vendor-created products are subject to ownership and service-level rules. |
| `PUT` | `/products/:productId` | Admin or owning approved Vendor | Updates a product's editable details. |
| `PATCH` | `/products/:productId/status` | Admin | Changes the product's publication/status state. |
| `DELETE` | `/products/:productId` | Admin or owning approved Vendor | Deletes the product, subject to ownership checks. |
| `PUT` | `/products/:productId/images` | Admin or owning approved Vendor; multipart fields `mainImage`, `galleryImages` | Uploads or replaces the product's main image and/or gallery images. |
| `DELETE` | `/products/:productId/images/main` | Admin or owning approved Vendor | Removes the product's main image. |
| `DELETE` | `/products/:productId/images/gallery/:imageIndex` | Admin or owning approved Vendor | Removes one product gallery image by its zero-based image index. |
| `PUT` | `/products/:productId/variants/:variantId/images` | Admin or owning approved Vendor; multipart fields `mainImage`, `galleryImages` | Uploads or replaces the selected variant's main image and/or gallery images. |
| `DELETE` | `/products/:productId/variants/:variantId/images/main` | Admin or owning approved Vendor | Removes the selected variant's main image. |
| `DELETE` | `/products/:productId/variants/:variantId/images/gallery/:imageIndex` | Admin or owning approved Vendor | Removes one gallery image from the selected variant by its zero-based image index. |

## Cart

Cart records are scoped to the signed-in user's own account. An admin can use these endpoints for their own account, but cannot use them to view another user's cart.

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/cart` | Customer or Admin; Bearer | Returns the signed-in user's cart and its items. |
| `POST` | `/cart/products` | Customer or Admin; Bearer | Adds a product/variant and quantity to the signed-in user's cart. |
| `PATCH` | `/cart/products/:itemId` | Customer or Admin; Bearer | Changes the quantity of a cart item. |
| `DELETE` | `/cart/products/:itemId` | Customer or Admin; Bearer | Removes one item from the signed-in user's cart. |
| `DELETE` | `/cart` | Customer or Admin; Bearer | Clears the signed-in user's cart. |

## Wishlist

Wishlist records are scoped to the signed-in user's own account. An admin can use these endpoints for their own account only.

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/wishlist` | Customer or Admin; Bearer | Returns the signed-in user's wishlist. |
| `POST` | `/wishlist/products` | Customer or Admin; Bearer | Adds a product to the signed-in user's wishlist. |
| `DELETE` | `/wishlist/products/:productId` | Customer or Admin; Bearer | Removes a product from the signed-in user's wishlist. |

## Addresses

Addresses are always read and changed in the context of their owner. An admin can use the address book endpoints for their own account, but does not get access to other users' address records.

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/addresses` | Customer or Admin; Bearer | Lists the signed-in user's saved addresses. |
| `GET` | `/addresses/:addressId` | Customer or Admin; Bearer | Fetches one saved address owned by the signed-in user. |
| `POST` | `/addresses` | Customer or Admin; Bearer | Creates a saved address for the signed-in user. |
| `PATCH` | `/addresses/:addressId` | Customer or Admin; Bearer | Updates a saved address owned by the signed-in user. |
| `DELETE` | `/addresses/:addressId` | Customer or Admin; Bearer | Deletes a saved address owned by the signed-in user. |

## Vendors

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/vendors` | Customer; Bearer | Submits a vendor application. |
| `GET` | `/vendors/me` | Customer or Vendor; Bearer | Returns the signed-in user's vendor record/application. |
| `PATCH` | `/vendors/me` | Vendor; Bearer | Updates the approved vendor's own store/profile information. |
| `GET` | `/vendors` | Admin; Bearer | Lists vendor records/applications for administration. |
| `PATCH` | `/vendors/:vendorId/review` | Admin; Bearer | Reviews a vendor application, such as approving, rejecting, or marking it under review. |
| `PATCH` | `/vendors/:vendorId/status` | Admin; Bearer | Changes the status of a vendor record. |

## Orders

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/orders` | Customer; Bearer | Creates an order from the signed-in customer's cart. The request schema accepts saved shipping/billing address IDs and an optional coupon code; an `Idempotency-Key` header can be used to safely retry order creation. |
| `GET` | `/orders` | Customer or Admin; Bearer | Lists the signed-in customer's orders, or all orders for an admin. |
| `GET` | `/orders/:orderId` | Customer owner or Admin; Bearer | Returns one order if the signed-in customer owns it, or if the caller is an admin. |
| `POST` | `/orders/:orderId/cancel` | Customer owner or Admin; Bearer | Requests cancellation of an order, subject to the order/payment cancellation rules. |
| `PATCH` | `/orders/:orderId/status` | Admin; Bearer | Updates an order's status. Setting the status to `cancelled` uses the order cancellation flow. |

## Payments

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/payments` | Customer; Bearer | Starts a payment for the customer's own order with the configured Razorpay integration. |
| `POST` | `/payments/verify` | Customer; Bearer | Verifies a payment using the provider's payment details/signature and updates the payment result. |
| `POST` | `/payments/:paymentId/refund` | Admin; Bearer | Requests a refund for a payment. An optional refund amount may be supplied in the JSON body; completion is reconciled through provider events. |
| `POST` | `/payments/webhook` | Razorpay server-to-server; signature required | Accepts Razorpay webhook events. The request must contain the raw JSON body and the `x-razorpay-signature` header; `x-razorpay-event-id` is also read for event processing. This endpoint is registered separately from the normal JSON parser. |

## Coupons

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/coupons/validate` | Customer; Bearer | Checks whether a coupon code can be applied to the customer's current cart and returns the validation result. |
| `GET` | `/coupons` | Admin; Bearer | Lists coupons for administration. |
| `POST` | `/coupons` | Admin; Bearer | Creates a coupon. |
| `PUT` | `/coupons/:couponId` | Admin; Bearer | Updates an existing coupon. |
| `DELETE` | `/coupons/:couponId` | Admin; Bearer | Deletes a coupon. |

## Product reviews

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/reviews/product/:productId` | Public | Lists reviews for a product. |
| `POST` | `/reviews` | Customer; Bearer | Creates a product review. |
| `POST` | `/reviews/:reviewId/media` | Customer; Bearer; multipart field `media` (up to 6 files) | Adds media files to a review owned by the signed-in customer. |
| `DELETE` | `/reviews/:reviewId/media/:mediaIndex` | Customer; Bearer | Deletes one media file from the customer's review by its zero-based index. |
| `PUT` | `/reviews/:reviewId` | Customer; Bearer | Updates a review owned by the signed-in customer. |
| `DELETE` | `/reviews/:reviewId` | Customer or Admin; Bearer | Deletes a review, with ownership checks for customers. |
| `GET` | `/reviews/admin/pending` | Admin; Bearer | Lists product reviews awaiting moderation. |
| `PATCH` | `/reviews/admin/:reviewId` | Admin; Bearer | Moderates a product review using the supplied moderation action/status. |

## Vendor reviews

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/vendor-reviews/vendor/:vendorId` | Public | Lists reviews for the specified vendor. |
| `POST` | `/vendor-reviews` | Customer; Bearer | Creates a vendor review. |
| `POST` | `/vendor-reviews/:reviewId/media` | Customer; Bearer; multipart field `media` (up to 6 files) | Adds media files to a vendor review owned by the signed-in customer. |
| `DELETE` | `/vendor-reviews/:reviewId/media/:mediaIndex` | Customer; Bearer | Deletes one media file from the customer's vendor review by its zero-based index. |
| `GET` | `/vendor-reviews/admin/pending` | Admin; Bearer | Lists vendor reviews awaiting moderation. |
| `PATCH` | `/vendor-reviews/admin/:reviewId` | Admin; Bearer | Moderates a vendor review using the supplied moderation action/status. |

## Website reviews

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/website-reviews` | Public | Lists website reviews that are available for display. |
| `POST` | `/website-reviews` | Customer; Bearer | Creates a website/store review. |
| `PUT` | `/website-reviews/:reviewId` | Customer; Bearer | Updates the signed-in customer's website review. |
| `DELETE` | `/website-reviews/:reviewId` | Customer; Bearer | Deletes the signed-in customer's website review. |
| `GET` | `/website-reviews/admin/pending` | Admin; Bearer | Lists website reviews awaiting moderation. |
| `PATCH` | `/website-reviews/admin/:reviewId` | Admin; Bearer | Moderates a website review using the supplied moderation action/status. |

## Administration

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/admin/dashboard` | Admin; Bearer | Returns the administrative dashboard summary and metrics. |
| `GET` | `/admin/users` | Admin; Bearer | Lists users for administration. |
| `PATCH` | `/admin/users/:userId/status` | Admin; Bearer | Changes a user's account status. This is an admin-scoped alias of the user-status operation. |

## Newsletter

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/newsletter/subscribe` | Public | Adds an email address to the newsletter subscriber list. |
| `GET` | `/newsletter/subscribers` | Admin; Bearer | Lists up to the 500 newest newsletter subscribers. |

## Contact messages

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/contact` | Public; rate limited | Validates and stores a contact-form message and sends a notification email to the studio. |
| `GET` | `/contact` | Admin; Bearer | Lists contact-form messages. Supports validated pagination query parameters. |

## Home page sections

One document per home page band. The storefront renders the active sections in `order`; the admin page is Admin → Home page.

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/home-sections` | Public | Active sections in page order. |
| `GET` | `/home-sections/admin` | Admin; Bearer | Every section, including hidden ones. |
| `POST` | `/home-sections` | Admin; Bearer | Create a section. Body: `{ sectionName, heading, subheading, content, image, images, benefits, order, isActive }`. Only `sectionName` is required. |
| `PUT` | `/home-sections/:sectionId` | Admin; Bearer | Update any field. |
| `DELETE` | `/home-sections/:sectionId` | Admin; Bearer | Delete a section. |
| `POST` | `/home-sections/upload` | Admin; Bearer | Upload up to 8 images (`multipart/form-data`, field `images`); returns the URLs. |
| `POST` | `/home-sections/defaults` | Admin; Bearer | Insert missing default sections and return the full list. |

## Site content

The storefront's copy and images are edited from Admin → Customize site. The API stores only the dot paths that were changed; the client ships the full defaults in `client/src/data/siteContent.json` and merges the two. Every write answers with the whole saved tree.

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/site-content` | Public | Returns the saved overrides (an object keyed by content path). |
| `PATCH` | `/site-content` | Admin; Bearer | Sets one path. Body: `{ "path": "home.hero.titleLine1", "value": "Elegant Kurtis" }`. |
| `DELETE` | `/site-content` | Admin; Bearer | Removes one override, so the shipped default applies again. Body: `{ "path": "home.hero.titleLine1" }`. |
| `POST` | `/site-content/image` | Admin; Bearer | Uploads one image (`multipart/form-data`, field `image`) and returns `{ url }`. |

## Configuration notes

- Email verification and password recovery depend on the SMTP mail settings configured in the server environment.
- Razorpay payment creation, verification, refunds, and webhooks require the corresponding Razorpay keys and webhook secret.
- Image and review-media uploads rely on the configured upload/storage integration.
- The backend does not expose KYC verification endpoints.
