import assert from "node:assert/strict";
import test from "node:test";

import multer from "multer";

import errorMiddleware from "../src/middlewares/error.middleware.js";
import { AppError, notFound } from "../src/utils/AppError.js";

// Runs the middleware with a stub response and returns what it answered.
const run = (error) => {
  const captured = {};
  const res = {
    headersSent: false,
    status(code) {
      captured.status = code;
      return this;
    },
    json(body) {
      captured.body = body;
      return this;
    },
  };

  errorMiddleware(error, {}, res, () => {});
  return captured;
};

test("an AppError keeps its own status code and message", () => {
  const { status, body } = run(new AppError("Product not found", 404));
  assert.equal(status, 404);
  assert.deepEqual(body, { success: false, message: "Product not found" });
});

test("the AppError helpers pick the matching status", () => {
  assert.equal(notFound("Thing not found").statusCode, 404);
});

test("a duplicate key becomes 409", () => {
  const error = Object.assign(new Error("E11000 duplicate key error"), { code: 11000 });
  const { status, body } = run(error);
  assert.equal(status, 409);
  assert.equal(body.message, "A record with this value already exists");
});

test("a Multer file-size error becomes 413", () => {
  const { status, body } = run(new multer.MulterError("LIMIT_FILE_SIZE", "mainImage"));
  assert.equal(status, 413);
  assert.equal(body.message, "Image must not exceed 5 MB");
});

test("any other Multer error becomes 400", () => {
  assert.equal(run(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "mainImage")).status, 400);
});

test("a Mongoose validation error becomes 400 with the schema message", () => {
  const error = new Error("Path `email` is required.");
  error.name = "ValidationError";
  const { status, body } = run(error);
  assert.equal(status, 400);
  assert.equal(body.message, "Path `email` is required.");
});

test("a Mongoose cast error becomes 400", () => {
  const error = new Error("Cast to ObjectId failed");
  error.name = "CastError";
  assert.equal(run(error).status, 400);
});

test("an optimistic concurrency clash becomes 409", () => {
  const error = new Error("No matching document found");
  error.name = "VersionError";
  assert.equal(run(error).status, 409);
});

test("an unknown failure stays a 500 and hides its message", () => {
  const originalError = console.error;
  console.error = () => {};
  try {
    const { status, body } = run(new Error("database credentials rejected"));
    assert.equal(status, 500);
    assert.deepEqual(body, { success: false, message: "Internal server error" });
  } finally {
    console.error = originalError;
  }
});

test("a response that already started is handed back to Express", () => {
  let forwarded = null;
  errorMiddleware(new Error("late failure"), {}, { headersSent: true }, (error) => {
    forwarded = error;
  });
  assert.equal(forwarded?.message, "late failure");
});
