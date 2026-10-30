# Rynova Backend Guide

This guide explains how the backend is organized, how each request moves through it, and how to run and extend the API. The project uses JavaScript ES modules, Express, MongoDB with Mongoose, Zod validation, Cloudinary image storage, and Nodemailer for email.

## 1. What the backend does

The backend provides API endpoints for:

- Registering and signing in users, verifying email addresses, and resetting passwords.
- Managing user profiles and profile pictures.
- Managing categories, products, and their images.
- Managing carts, wishlists, saved addresses, vendors, coupons, and reviews.
- Creating and tracking orders and handling Razorpay payments.
- Restricting protected operations to the right user role.

The API base path is `/api`. For example, the health endpoint is `GET /api/health`.

## 2. Folder structure

```text
server/
├── .env                         # Private local settings; do not commit it
├── .env.example                 # Names of the settings the server reads
├── API.md                       # Short endpoint reference
├── backend.md                   # This full guide
├── package.json
├── package-lock.json
└── src/
    ├── app.js                   # Express middleware and API mount point
    ├── server.js                # Startup, database connection, shutdown
    ├── config/
    │   ├── db.js                # MongoDB connection
    │   ├── env.js               # Reads and checks environment settings
    │   └── cloudinary.js        # Cloudinary client setup
    ├── middlewares/
    │   ├── auth.middleware.js   # Access token checks (required and optional)
    │   ├── role.middleware.js  # Checks allowed roles
    │   ├── validate.middleware.js # Validates request bodies, IDs, queries
    │   ├── upload.middleware.js # Image file type and size checks
    │   ├── rateLimit.middleware.js
    │   └── error.middleware.js # Converts errors into API responses
    ├── routes/
    │   └── index.js             # Mounts every feature router in one place
    ├── services/
    │   ├── email.service.js     # Sends email through SMTP
    │   └── cloudinary.service.js # Uploads and deletes remote images
    ├── utils/
    │   ├── AppError.js          # Error with an HTTP status code
    │   ├── bcrypt.js            # Password and OTP hashing
    │   ├── generateOTP.js       # Cryptographically random OTP generation
    │   ├── jwt.js               # Access token creation and verification
    │   ├── otpemail.js          # OTP email HTML
    │   └── slugify.js           # Safe category slugs
    ├── validators/
    │   └── common.validator.js  # Reusable MongoDB ID validation
    └── modules/
        ├── admin/
        ├── address/
        ├── auth/
        ├── cart/
        ├── category/
        ├── coupon/
        ├── order/
        ├── payment/
        ├── product/
        ├── review/
        ├── user/
        ├── vendor/
        ├── vendorReview/
        ├── websiteReview/
        ├── newsletter/
        ├── contact/
        └── wishlist/
```

Most feature modules follow this pattern:

```text
feature/
├── feature.routes.js       # URL, middleware, controller mapping
├── feature.validator.js    # Accepted body and path values
├── feature.controller.js   # Reads the request and sends a response
├── feature.service.js      # Business rules
├── feature.repository.js   # Database read/write helpers
└── feature.model.js        # Mongoose collection shape and constraints
```

Some simple modules combine a small amount of database work in the service. The important separation is: routes handle HTTP setup, controllers handle HTTP responses, services enforce business rules, and models/repositories handle stored data.

## 3. How a request travels through the code

```text
Browser or API client
  -> app.js
  -> routes/index.js
  -> feature router
  -> authentication and role checks (when required)
  -> Zod validation (when the route accepts input)
  -> controller
  -> service business rules
  -> repository / Mongoose model
  -> controller JSON response
```

For example, creating a product goes through `product.routes.js`, checks the token and role, validates the request with `product.validator.js`, then calls `product.controller.js`. The controller calls the product service. The service checks category/vendor rules and saves the product through the repository/model.

`routes/index.js` mounts each module once, for example `router.use('/products', productRoutes)`. `app.js` mounts that combined router at `/api`. This keeps module URLs out of `app.js`.

## 4. Start the backend

1. Install a supported Node.js version and MongoDB access.
2. In the `server` folder, install packages with `npm install`.
3. Copy `.env.example` to `.env` and set the values for your own environment. Never publish `.env` or paste its secret values into chat.
4. Set at least `MONGO_URI` and `JWT_ACCESS_SECRET` to start the server. Use a long random access secret in production.
5. Set the SMTP values to enable email verification and password-reset email.
6. Set Cloudinary values to enable image upload. Set Razorpay values to enable real payment-provider calls.
7. Run `npm run dev` from `server`.
8. Open `GET http://localhost:5000/api/health`. A successful response means Express is running; it does not by itself prove MongoDB, SMTP, Cloudinary, or Razorpay credentials are valid.

Other scripts in `server/package.json`:

| Command | What it does |
| --- | --- |
| `npm start` | Runs the server without the file watcher |
| `npm test` | Runs the `node:test` suite in `tests/` (no database needed) |
| `npm run format` | Formats `src/` and `tests/` with Prettier |
| `npm run format:check` | Fails when a file does not match the formatting rules |

The server loads environment settings in `config/env.js`, connects to MongoDB in `config/db.js`, and then starts listening. In production, `server.js` also checks that `CLIENT_URL` is set and that the access secret is at least 32 characters.

## 5. Environment settings

| Setting | Used for | Required when |
| --- | --- | --- |
| `NODE_ENV`, `PORT` | Runtime mode and server port | Always; defaults are supplied |
| `CLIENT_URL` | CORS origin | Set to the deployed client in production |
| `MONGO_URI` | MongoDB connection | Always |
| `JWT_ACCESS_SECRET`, `JWT_ACCESS_EXPIRES_IN` | Signed login token | Always |
| `BCRYPT_SALT_ROUNDS` | Password and OTP hashing cost | Defaults to 12 |
| `MAIL_HOST`, `MAIL_PORT`, `MAIL_SECURE` | SMTP server connection | Registration verification and password reset |
| `MAIL_USER`, `MAIL_PASSWORD` | SMTP login | Registration verification and password reset |
| `MAIL_FROM_NAME`, `MAIL_FROM_EMAIL` | Sender shown in email | Registration verification and password reset |
| `OTP_LENGTH`, `OTP_EXPIRES_IN_MINUTES` | Code length and expiry | OTP endpoints; defaults to 6 digits and 10 minutes |
| `OTP_RATE_LIMIT_WINDOW_MS`, `OTP_RATE_LIMIT_MAX` | OTP endpoint throttling | OTP endpoints; defaults are supplied |
| `AUTH_RATE_LIMIT_WINDOW_MS`, `AUTH_RATE_LIMIT_MAX` | Login/register throttling | Login and registration; defaults are supplied |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Remote image storage | Profile, category, and product image routes |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Create payments/refunds | Razorpay payment operations |
| `RAZORPAY_WEBHOOK_SECRET` | Verify provider callbacks | Payment webhook processing |

The current authentication system uses bearer access tokens and `tokenVersion` invalidation. It does not issue refresh tokens or use cookie authentication. Phone/SMS OTP is not implemented; OTP delivery is by email.

## 6. Authentication, OTP, and email

### Register and verify an email

1. `POST /api/auth/register` accepts `firstName`, `lastName`, `email`, `password`, and `phoneNumber`.
2. Validation checks field shape, email format, password length, and phone format.
3. The auth service normalizes the email, checks for duplicate email/phone, hashes the password with bcrypt, and creates a customer account with `emailVerified: false`.
4. It generates an OTP using Node's cryptographic random number generator. The code length comes from `OTP_LENGTH`.
5. It stores only a bcrypt hash of the OTP, its expiration time, and the failed-attempt counter in the user's OTP record.
6. `email.service.js` sends the HTML email over SMTP. The raw OTP is never stored in MongoDB.
7. `POST /api/auth/verify-email` accepts `{ "email": "person@example.com", "otp": "123456" }` (use the configured number of digits). The code must be unexpired and the user must have fewer than five failed attempts.
8. A successful check consumes the code and marks the email verified. The same code cannot be used again.
9. `POST /api/auth/resend-verification` accepts `{ "email": "person@example.com" }`. It sends a new code only for an existing unverified account and returns a general response so callers cannot use it to discover registered emails.

Registration does not return a login token, but the account can sign in immediately: email verification is optional. The client opens the verification page after registration, and the response includes `verificationEmailSent`. If delivery fails, the account remains usable and the verification page explains that the user can request another code; SMTP failures from other email endpoints return a 502 response rather than a generic 500. `POST /api/auth/verify-email` and `POST /api/auth/resend-verification` remain public, so the profile card and any old link keep working.

### Forgot and reset a password

1. `POST /api/auth/forgot-password` accepts `{ "email": "person@example.com" }` and is rate-limited.
2. If the account exists, the server saves a hashed, expiring reset code and emails the code. The response is the same whether or not that account exists.
3. `POST /api/auth/reset-password` accepts `{ "email": "person@example.com", "otp": "123456", "newPassword": "a-long-password" }`.
4. The code is checked, failed attempts are counted, and a successful code is consumed atomically.
5. The new password is hashed and the user's `tokenVersion` is incremented. Old access tokens then stop working.

Email verification and reset codes use separate fields and counters. The old document-wide MongoDB TTL index could delete an email-verification code when only the reset code expired. On startup, the backend detects and removes the obsolete TTL index `resetExpiresAt_1`; this index removal keeps OTP records and user accounts.

### Verify SMTP without sending a message

The code can verify generated OTP shape, schema checks, and email-template rendering without delivering mail. A real delivery check needs a reachable SMTP server and an address you control. Do not test by sending an OTP to another person's email. SMTP settings being present in `.env` do not prove that the server accepts the credentials or that a message lands in the inbox.

The current rate limiter stores counts in the Node process. For multiple backend instances, use shared storage such as Redis so callers cannot bypass the OTP limit by reaching a different instance.

## 7. Input validation and API errors

Zod schemas are stored beside the feature routes in `*.validator.js`. They are the only place request rules live: controllers read the parsed values and services only apply business rules. `validate(schema)` checks JSON request bodies; `validateParams(schema)` checks URL IDs; `validateQuery(schema)` checks query-string filters and keeps the parsed result on `req.validated.query` (Express 5 exposes `req.query` as a read-only getter). Invalid input returns HTTP 400 with a list of fields and messages.

Image routes use Multer as their input validator. It accepts AVIF, GIF, JPEG, PNG, and WebP images up to 5 MB each. Product gallery upload is capped at 10 files per request.

Typical successful JSON looks like:

```json
{ "success": true, "message": "Products fetched successfully", "data": [] }
```

Validation errors include an `errors` array. Other API errors use `{ "success": false, "message": "..." }`.

Expected failures are thrown as `AppError` (`src/utils/AppError.js`) and carry their own status code, so `error.middleware.js` never has to guess one from the message. It also translates the errors the libraries raise: a duplicate key becomes 409, a Mongoose validation or cast error becomes 400, a Multer upload limit becomes 413, and an optimistic concurrency clash becomes 409. Anything unclassified stays a 500 and its details are logged on the server instead of being sent to the client.

## 8. Roles and access checks

`auth.middleware.js` checks the bearer token, loads the current user, and checks the token version. It exports `authMiddleware` for routes that require a signed-in user and `optionalAuthMiddleware` for public catalog reads that show an admin or vendor more than a regular visitor, sharing one token check. `role.middleware.js` accepts one or more roles, for example `roleMiddleware("admin", "vendor")`.

Access is enforced in the backend, even when the client hides a button. Vendor product updates also check that the product belongs to the signed-in vendor. Customer-owned addresses, orders, reviews, carts, and wishlists are queried with the current user ID.

## 9. Module-by-module API map

All paths below are prefixed with `/api`. Protected routes use `Authorization: Bearer <access-token>`.

### Auth

| Method | Path | Access / purpose |
| --- | --- | --- |
| `POST` | `/auth/register` | Public; create a customer and attempt verification email delivery (response includes `verificationEmailSent`) |
| `POST` | `/auth/login` | Public; only active users can sign in, verified email or not |
| `POST` | `/auth/verify-email` | Public; consume email-verification code |
| `POST` | `/auth/resend-verification` | Public; request a new verification code |
| `POST` | `/auth/forgot-password` | Public; request password-reset code |
| `POST` | `/auth/reset-password` | Public; verify code and set new password |
| `POST` | `/auth/logout` | Signed-in user; increments token version |
| `PATCH` | `/auth/change-password` | Signed-in user; validates old password and invalidates old tokens |

### User and admin

| Method | Path | Access / purpose |
| --- | --- | --- |
| `GET`, `PATCH` | `/users/me` | Signed-in user; read/update own profile |
| `GET`, `PUT`, `DELETE` | `/users/me/profile-picture` | Signed-in user; read, upload, or delete own picture |
| `DELETE` | `/users/me` | Signed-in user; delete own account |
| `PATCH` | `/users/:userId/status` | Admin; activate/deactivate a user |
| `GET` | `/admin/dashboard` | Admin dashboard totals |
| `GET` | `/admin/users` | Admin user list |
| `PATCH` | `/admin/users/:userId/status` | Admin user status update |

Profile upload uses multipart field `image`. The profile-picture endpoint returns a URL, not the Cloudinary secret/public ID.

### Categories and products

| Method | Path | Access / purpose |
| --- | --- | --- |
| `GET` | `/categories?search=` | Public; active categories; admin can see drafts |
| `GET` | `/categories/:categoryId` | Public; active category; admin can see drafts |
| `POST`, `PUT` | `/categories`, `/categories/:categoryId` | Admin; create or update category |
| `PATCH` | `/categories/:categoryId/status` | Admin; activate or draft a category |
| `DELETE` | `/categories/:categoryId` | Admin; cannot delete a category still used by products/children |
| `PUT` | `/categories/:categoryId/images` | Admin; multipart fields `image` and/or `bannerImage` |
| `DELETE` | `/categories/:categoryId/images/:imageType` | Admin; `imageType` is `image` or `banner` |
| `GET` | `/products` | Public; filters include search, category, price, variant, sort, and pagination |
| `GET` | `/products/:productId` | Public; reads active product; admin/vendor can read permitted drafts |
| `POST`, `PUT`, `DELETE` | `/products`, `/products/:productId` | Admin or approved vendor; vendor ownership is checked |
| `PATCH` | `/products/:productId/status` | Admin; change product status |
| `PUT` | `/products/:productId/images` | Admin or owning vendor; upload product images |
| `DELETE` | `/products/:productId/images/main` | Admin or owning vendor |
| `DELETE` | `/products/:productId/images/gallery/:imageIndex` | Admin or owning vendor |
| `PUT` | `/products/:productId/variants/:variantId/images` | Admin or owning vendor; upload variant images |
| `DELETE` | `/products/:productId/variants/:variantId/images/main` | Admin or owning vendor |
| `DELETE` | `/products/:productId/variants/:variantId/images/gallery/:imageIndex` | Admin or owning vendor |

Product image upload uses `mainImage` and/or repeated `galleryImages` multipart fields. A product's prices and stock are read by the backend; order totals must not be trusted from the browser.

### Home page sections

| Method | Path | Access / purpose |
| --- | --- | --- |
| `GET` | `/home-sections` | Public; active sections, ordered by `order` |
| `GET` | `/home-sections/admin` | Admin; every section, including hidden ones |
| `POST`, `PUT`, `DELETE` | `/home-sections`, `/home-sections/:sectionId` | Admin; create, update or delete a section |
| `POST` | `/home-sections/upload` | Admin; multipart field `images` (up to 8 files), returns the uploaded URLs |
| `POST` | `/home-sections/defaults` | Admin; insert any missing default sections, leave existing ones alone |

One `HomeSection` document holds one band of the home page: `sectionName`, `heading`, `subheading`, `content`, `image`, `images`, `benefits`, `order` and `isActive`. Only `sectionName` is required. Names the storefront already designs (`hero`, `categories`, `newArrivals`, `promo`, `featuredCollections`, `reviews`, `brandStory`, `newsletter`) keep that design; any other name is drawn with the generic section layout. The storefront falls back to its built-in copy when the collection is empty, and to `siteContent.json` for any field left blank.

### Customer data

| Method | Path | Access / purpose |
| --- | --- | --- |
| `GET` | `/cart` | Customer; get or create own cart |
| `POST` | `/cart/products` | Customer; add a product/optional variant and quantity |
| `PATCH` | `/cart/products/:itemId` | Customer; change quantity |
| `DELETE` | `/cart/products/:itemId` | Customer; remove a line |
| `DELETE` | `/cart` | Customer; clear cart |
| `GET` | `/wishlist` | Customer; get or create own wishlist |
| `POST` | `/wishlist/products` | Customer; add product ID |
| `DELETE` | `/wishlist/products/:productId` | Customer; remove product |
| `GET`, `POST` | `/addresses` | Customer; list/create own addresses |
| `GET`, `PATCH`, `DELETE` | `/addresses/:addressId` | Customer; read/update/delete own address |
| `POST` | `/coupons/validate` | Customer; validate coupon against their current cart |

Cart add body example: `{ "productId": "24-hex-id", "variantId": "24-hex-id", "quantity": 2 }`. `variantId` and `quantity` may be omitted when not needed. The server checks product status and available stock.

### Vendors, coupons, and reviews

| Method | Path | Access / purpose |
| --- | --- | --- |
| `POST` | `/vendors` | Customer; apply to become a vendor |
| `GET` | `/vendors/me` | Customer/vendor; get own vendor record |
| `PATCH` | `/vendors/me` | Approved vendor; update store details |
| `GET` | `/vendors` | Admin; list vendors |
| `PATCH` | `/vendors/:vendorId/review` | Admin; approve/reject application |
| `GET`, `POST`, `PUT`, `DELETE` | `/coupons`, `/coupons/:couponId` | Admin coupon management |
| `GET` | `/reviews/product/:productId` | Public; list approved product reviews |
| `POST` | `/reviews` | Customer; requires a delivered order for the product |
| `PUT`, `DELETE` | `/reviews/:reviewId` | Customer owner; admin may delete |
| `GET` | `/reviews/admin/pending` | Admin; list submitted reviews awaiting moderation |
| `PATCH` | `/reviews/admin/:reviewId` | Admin; approve/reject review |

## 10. Cart, address, wishlist, and catalog CRUD logic

1. The route authenticates the caller and checks the role.
2. The validator rejects missing fields, unexpected fields, malformed IDs, and invalid values.
3. The controller passes only the signed-in user ID and validated inputs to the service.
4. The service checks ownership, related records, stock, status, and other business rules.
5. The repository/model saves the result.
6. The controller sends the updated record in the `data` field.

For update/delete operations, use the existing database ID in the route. Do not accept `userId` from a customer request; services always use `req.user.id` for customer-owned records. Address ownership is checked by querying both address ID and user ID.

## 11. Image upload and deletion logic

1. A route checks authentication and role, then Multer reads the multipart file into memory.
2. Multer rejects unsupported MIME types and files over 5 MB.
3. The controller passes the file to the feature service.
4. `cloudinary.service.js` streams the buffer to Cloudinary and returns only the secure URL and Cloudinary public ID to the service.
5. The feature service saves the URL and public ID in the MongoDB record. The public ID is used later to delete/replacement-cleanup the remote image.
6. On image replacement, the new image is uploaded and saved first; the old remote image is deleted after a successful database update. Failed uploads are cleaned up where possible.

Use the `image` multipart field for user profile pictures, `image`/`bannerImage` for categories, and `mainImage`/`galleryImages` for products and product variants. Set Cloudinary credentials in `.env`; they are never returned to the browser.

## 12. Orders and payments

### Order creation

1. A signed-in customer sends `POST /api/orders` with `shippingAddressId`, optional `billingAddressId`, optional `couponCode`, and optional `idempotencyKey`.
2. The service confirms addresses belong to the customer and the cart has items.
3. It loads each product and variant from MongoDB, checks active status and stock, then reserves stock.
4. It snapshots product name, variant, price, SKU, and image into the order. It computes subtotal, discount, tax, shipping, and total on the server.
5. If anything fails before order completion, it attempts to restore reserved stock and coupon use.
6. On success it creates an order and clears the cart. A repeated idempotency key for the same customer returns the existing order.

Orders store address snapshots so later address edits do not change an old order. Customers can only read/cancel their own orders. Cancellation is limited to eligible unpaid/failed orders; stock and coupon usage are restored. Admin status changes must follow valid order transitions.

### Payment lifecycle

1. Create an order first.
2. The customer calls `POST /api/payments` with `{ "orderId": "24-hex-id", "idempotencyKey": "unique-key-at-least-8-chars" }`.
3. The API creates the Razorpay order/payment record and returns the provider details needed by the checkout UI.
4. After checkout, the client posts the payment identifiers/signature to `POST /api/payments/verify`.
5. The server verifies the signature and checks amount, currency, provider order, and payment status before marking payment/order paid.
6. Razorpay calls `POST /api/payments/webhook`. This route is registered before JSON parsing so signature validation uses the original raw bytes. Webhook event IDs are recorded so repeated deliveries are safe to process.
7. An admin requests a refund with `POST /api/payments/:paymentId/refund`. Final refund status is updated from verified Razorpay webhooks.

Never mark an order paid from a browser-only success message. Provider keys belong only in the backend `.env`. Razorpay test mode should be used before live keys.

## 13. Add a new CRUD module

Use this checklist to keep the same style as the existing backend:

1. Create `src/modules/<name>/`.
2. Add a Mongoose model with required fields, enums, indexes, and timestamps.
3. Add Zod schemas for create, partial update, request parameters, and query filters. Use `.strict()` for JSON bodies to reject misspelled/extra fields.
4. Add repository functions for database access.
5. Add service functions for ownership checks and business rules. Never trust client-supplied prices, roles, user IDs, or totals.
6. Add a controller that calls the service and returns a consistent JSON response. Pass unexpected failures to `next(error)`.
7. Add routes in this order: authentication, role check, params/body/query validation, upload middleware if needed, controller.
8. Mount the module router in `src/routes/index.js`; do not add feature endpoints directly to `app.js`.
9. Add the endpoint and request examples to `API.md` and this guide.
10. Run the syntax and integration checks for the affected module. Verify a customer cannot read/update another customer's data.

## 14. Maintenance and production notes

- Keep `.env` private. Rotate any credential that has been shared or committed.
- SMTP values must be checked with the provider. A code/template test is not proof of inbox delivery.
- The local SMTP connection check could not complete in this restricted environment, and no test email was sent. The OTP generation, request validation, and email-template logic were checked locally.
- The rate limiter is in-memory; use shared storage when running multiple instances.
- The API does not currently implement phone/SMS OTP, KYC, refresh tokens, or transactional order emails.
- Make a MongoDB backup before a production schema/index migration.
- For production, use TLS, a restricted database account, production Cloudinary/Razorpay credentials, monitoring, backups, and an SMTP provider with domain authentication (SPF/DKIM/DMARC).
- The backend package list was cleaned of unused `express-validator`, `cookie-parser`, and `streamifier` dependencies. Empty placeholder utilities/constants and duplicate legacy OTP functions were removed; active modules and Cloudinary image handling remain.
