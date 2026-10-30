import assert from "node:assert/strict";
import test from "node:test";

import app from "../src/app.js";
import User from "../src/modules/user/user.model.js";

// Boots the real Express app on a random port. These routes answer without a
// database connection, which keeps the test fast and independent.
const withServer = async (run) => {
  const server = app.listen(0);
  try {
    const { port } = server.address();
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
};

test("GET /api/health answers", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/health`);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).success, true);
  });
});

test("an invalid sign-in body is rejected by the shared validator", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "not-an-email" }),
    });

    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.message, "Validation failed");
    assert.ok(Array.isArray(body.errors));
  });
});

test("a protected route answers 401 without a token", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/orders`);
    assert.equal(response.status, 401);
    assert.equal((await response.json()).message, "Authentication required");
  });
});

test("a user document never serializes its password hash", () => {
  const user = new User({
    firstName: "Test",
    lastName: "Customer",
    email: "test@example.com",
    phone: "9876543210",
    password: "hashed-password",
    profilePicturePublicId: "rynova/secret",
  });

  const json = user.toJSON();
  assert.equal("password" in json, false);
  assert.equal("profilePicturePublicId" in json, false);
  assert.equal(json.email, "test@example.com");
});
