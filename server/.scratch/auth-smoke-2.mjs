import "dotenv/config";
import mongoose from "mongoose";
import { createHash, randomBytes } from "node:crypto";

const API = "http://localhost:5000/api";
const sha256 = (token) => createHash("sha256").update(token).digest("hex");
const users = mongoose.connection.collection("users");

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  const stamp = Date.now();
  const email = `smoke2-${stamp}@example.com`;
  const password = "a-long-unique-password-123";
  const phone = `+91${String(stamp).slice(-10)}`;

  let res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firstName: "Smoke", lastName: "Two", email, password, phoneNumber: phone }),
  });
  console.log("1 register:", res.status);

  const rawVerify = randomBytes(32).toString("base64url");
  await users.updateOne(
    { email },
    { $set: { emailVerificationTokenHash: sha256(rawVerify), emailVerificationExpiresAt: new Date(Date.now() + 30 * 60 * 1000) } },
  );
  res = await fetch(`${API}/auth/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: rawVerify }),
  });
  console.log("2 verify-email:", res.status);

  res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const login = await res.json();
  console.log("3 login:", res.status, "bearer:", Boolean(login.token));

  res = await fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${login.token}` } });
  console.log("4 me-before-change:", res.status);

  res = await fetch(`${API}/auth/change-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${login.token}` },
    body: JSON.stringify({ oldPassword: password, newPassword: "brand-new-password-456" }),
  });
  console.log("5 change-password:", res.status, (await res.json()).message?.slice(0, 40));

  res = await fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${login.token}` } });
  console.log("6 me-after-change:", res.status, "(401 expected)");

  res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firstName: "Smoke", lastName: "Two", email: `other-${stamp}@example.com`, password: "short", phoneNumber: phone }),
  });
  console.log("7 short-password:", res.status, "(400 expected)");

  await mongoose.connection.db.collection("users").deleteMany({ email: { $in: [email, `other-${stamp}@example.com`] } });
  console.log("cleanup: done");
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error("SMOKE2 FAILED:", error.message);
  process.exit(1);
});
