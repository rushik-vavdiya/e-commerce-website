import argon2 from "argon2";
import bcrypt from "bcryptjs";

// Password hashing for the replaced auth system: new hashes are Argon2id.
// Accounts created by the previous auth system carry bcrypt hashes, so
// verification falls back to bcrypt for those (and quietly upgrades them the
// next time the person signs in successfully).
const argon2Options = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

const isArgon2Hash = (hash) => typeof hash === "string" && hash.startsWith("$argon2");

export const hashPassword = (password) => argon2.hash(password, argon2Options);

// Returns { ok, legacy } — legacy means the hash came from the old system and
// should be upgraded to Argon2id after a successful sign-in.
export const verifyPassword = async (hash, password) => {
  try {
    if (isArgon2Hash(hash)) {
      return { ok: await argon2.verify(hash, password), legacy: false };
    }
    return { ok: await bcrypt.compare(password, hash), legacy: true };
  } catch {
    return { ok: false, legacy: false };
  }
};

// Runs the rate-limited login at least once but keeps the response fast — the
// upgrade happens after the caller has already decided the login succeeded.
export const upgradeLegacyHash = async (user, password) => {
  if (!user?.password) return;
  try {
    user.password = await argon2.hash(password, argon2Options);
    await user.save();
  } catch {
    // Unknown password upgrades are cosmetic: the next sign-in retries it.
  }
};
