import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";

const API = "http://localhost:5000/api";
const sha256 = (token) => createHash("sha256").update(token).digest("hex");

const users = mongoose.connection.collection("users");

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  const stamp = Date.now();
  const email = `smoke-${stamp}@example.com`;
  const password = "a-long-unique-password-123";
  const phone = `+91${String(stamp).slice(-10)}`;

  let res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firstName: "Smoke", lastName: "Tester", email, password, phoneNumber: phone }),
  });
  const reg = await res.json();
  console.log("1 register:", res.status, reg.success, "emailSent:", reg.verificationEmailSent, reg.message?.slice(0, 40));

  res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  console.log("2 login-unverified:", res.status, (await res.json()).message);

  // Mint a verification token the same way the server would have emailed one.
  const rawVerify = randomBytes(32).toString("base64url");
  await mongoose.connect(process.env.MONGO_URI);
  await users.updateOne(
    { email },
    { $set: { emailVerificationTokenHash: sha256(rawVerify), emailVerificationExpiresAt: new Date(Date.now() + 30 * 60 * 1000) } },
  );

  res = await fetch(`${API}/auth/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: rawVerify }),
  });
  console.log("3 verify-email:", res.status, (await res.json()).message);

  res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const login = await res.json();
  const cookie = (res.headers.get("set-cookie") || "").split(";")[0];
  console.log("4 login:", res.status, "token:", Boolean(login.token), "user:", login.data?.firstName, "verified:", login.data?.emailVerified, "cookie:", Boolean(cookie));

  res = await fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${login.token}` } });
  console.log("5 me:", res.status, (await res.json()).data?.email);

  res = await fetch(`${API}/auth/refresh`, { method: "POST", headers: { Cookie: cookie } });
  const refresh1 = await res.json();
  console.log("6 refresh:", res.status, "new token:", Boolean(refresh1.token), "rotated cookie:", Boolean(res.headers.get("set-cookie")));

  // Same old cookie again right away = concurrent tab, must pass the grace.
  res = await fetch(`${API}/auth/refresh`, { method: "POST", headers: { Cookie: cookie } });
  const refresh2 = await res.json();
  const graceOk = res.status === 200 && Boolean(refresh2.token);
  console.log("7 refresh-concurrent-tab:", res.status, "grace:", graceOk ? "OK" : "FAIL");

  res = await fetch(`${API}/auth/refresh`, { method: "POST", headers: { Cookie: "refreshToken=forgedvalue" } });
  console.log("8 refresh-forged:", res.status);

  res = await fetch(`${API}/auth/refresh`, { method: "POST", headers: { "Origin": "http://evil.example", Cookie: "refreshToken=abc" } });
  console.log("9 refresh-foreign-origin:", res.status, "(403 expected)");

  res = await fetch(`${API}/auth/change-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${refresh2.token}` },
    body: JSON.stringify({ oldPassword: "wrong-old-password", newPassword: "brand-new-password-456" }),
  });
  console.log("10 change-wrong-old:", res.status, (await res.json()).message);

  res = await fetch(`${API}/auth/change-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${refresh2.token}` },
    body: JSON.stringify({ oldPassword: password, newPassword: "brand-new-password-456" }),
  });
  console.log("11 change-password:", res.status, (await res.json()).message);

  res = await fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${refresh2.token}` } });
  console.log("12 bearer-after-change:", res.status, "(401 expected)");

  res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "brand-new-password-456" }),
  });
  console.log("13 login-new-password:", res.status);

  const rawReset = randomBytes(32).toString("base64url");
  await users.updateOne(
    { email },
    { $set: { passwordResetTokenHash: sha256(rawReset), passwordResetExpiresAt: new Date(Date.now() + 15 * 60 * 1000) } },
  );
  res = await fetch(`${API}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: rawReset, newPassword: "reset-flow-password-789" }),
  });
  console.log("14 reset-password:", res.status, (await res.json()).message);

  res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "reset-flow-password-789" }),
  });
  console.log("15 login-after-reset:", res.status);

  // Legacy bcrypt account behaves like the old system's users.
  const legacyEmail = `legacy-${stamp}@example.com`;
  await users.insertOne({
    firstName: "Legacy", lastName: "User", email: legacyEmail, password: await bcrypt.hash("oldpass8chars", 10),
    phone: "+919111223339", role: "customer", status: "active", emailVerified: true, emailVerifiedAt: new Date(),
    tokenVersion: 0,
  });
  res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: legacyEmail, password: "oldpass8chars" }),
  });
  console.log("16 legacy-login:", res.status, "token:", Boolean((await res.json()).token));
  const after = await users.findOne({ email: legacyEmail }, { password: 1 });
  console.log("17 legacy-hash-upgraded:", String(after.password).startsWith("$argon2") ? "OK" : "FAIL");
  await users.deleteOne({ email: legacyEmail });

  // Validation and duplicate guards.
  res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firstName: "Smoke", lastName: "Tester", email, password, phoneNumber: phone }),
  });
  console.log("18 duplicate-register:", res.status, (await res.json()).message);

  res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firstName: "Smoke", lastName: "Tester", email: `other-${stamp}@example.com`, password: "short", phoneNumber: phone }),
  });
  console.log("19 short-password:", res.status);

  await mongoose.connection.db.collection("users").deleteMany({ email: { $in: [email, `other-${stamp}@example.com`] } });
  console.log("cleanup: done");
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error("SMOKE FAILED:", error.message);
  process.exit(1);
});
