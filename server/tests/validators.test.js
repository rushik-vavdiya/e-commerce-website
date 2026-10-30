import assert from "node:assert/strict";
import test from "node:test";

import { productQuerySchema } from "../src/modules/product/product.validator.js";
import { vendorReviewSchema } from "../src/modules/vendor/vendor.validator.js";
import { addressUpdateSchema } from "../src/modules/address/address.validator.js";
import { cartItemParams } from "../src/modules/cart/cart.validator.js";
import {
  loginSchema,
  registerSchema,
  verifyEmailSchema,
} from "../src/modules/auth/auth.validator.js";
import env from "../src/config/env.js";

test("auth validators accept normalized sign-in, registration, and configured OTP inputs", () => {
  assert.equal(
    loginSchema.safeParse({ email: " USER@example.com ", password: "password" }).success,
    true,
  );
  assert.equal(
    registerSchema.safeParse({
      firstName: "Test",
      lastName: "Customer",
      email: "user@example.com",
      password: "password123",
      phoneNumber: "+12345678901",
    }).success,
    true,
  );
  assert.equal(
    verifyEmailSchema.safeParse({ email: "user@example.com", otp: "1".repeat(env.otp.length) })
      .success,
    true,
  );
});

test("auth validators reject malformed credentials and OTPs", () => {
  assert.equal(loginSchema.safeParse({ email: "bad", password: "password" }).success, false);
  assert.equal(
    registerSchema.safeParse({
      firstName: "T",
      lastName: "Customer",
      email: "user@example.com",
      password: "short",
      phoneNumber: "123",
    }).success,
    false,
  );
  assert.equal(
    verifyEmailSchema.safeParse({ email: "user@example.com", otp: "x".repeat(env.otp.length) })
      .success,
    false,
  );
});

test("product filters are coerced and checked in one place", () => {
  const parsed = productQuerySchema.parse({
    page: "2",
    limit: "10",
    sort: "price-low-high",
    availability: "available",
    hasVariants: "true",
    minPrice: "5",
  });

  assert.equal(parsed.page, 2);
  assert.equal(parsed.limit, 10);
  assert.equal(parsed.hasVariants, true);
  assert.equal(parsed.minPrice, 5);
});

test("product filters reject values the repository cannot handle", () => {
  assert.equal(productQuerySchema.safeParse({ sort: "cheapest" }).success, false);
  assert.equal(productQuerySchema.safeParse({ status: "live" }).success, false);
  assert.equal(productQuerySchema.safeParse({ limit: "500" }).success, false);
  assert.equal(productQuerySchema.safeParse({ hasVariants: "yes" }).success, false);
  assert.equal(productQuerySchema.safeParse({ minPrice: "50", maxPrice: "10" }).success, false);
});

test("unknown product filters are dropped, not rejected", () => {
  const parsed = productQuerySchema.parse({ campaign: "diwali" });
  assert.equal("campaign" in parsed, false);
});

test("a rejected vendor application must explain why", () => {
  assert.equal(vendorReviewSchema.safeParse({ approvalStatus: "rejected" }).success, false);
  assert.equal(
    vendorReviewSchema.safeParse({ approvalStatus: "rejected", rejectionReason: "   " }).success,
    false,
  );
  assert.equal(
    vendorReviewSchema.safeParse({
      approvalStatus: "rejected",
      rejectionReason: "Documents missing",
    }).success,
    true,
  );
  assert.equal(vendorReviewSchema.safeParse({ approvalStatus: "approved" }).success, true);
});

test("an address update needs at least one field", () => {
  assert.equal(addressUpdateSchema.safeParse({}).success, false);
  assert.equal(addressUpdateSchema.safeParse({ city: "Surat" }).success, true);
});

test("cart item ids must be MongoDB object ids", () => {
  assert.equal(cartItemParams.safeParse({ itemId: "not-an-id" }).success, false);
  assert.equal(cartItemParams.safeParse({ itemId: "64b7f0c2f1a4c9d2e3b4a5c6" }).success, true);
});
