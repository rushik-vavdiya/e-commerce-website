import bcrypt from "bcryptjs";
import env from "../config/env.js";

export const hashPassword = async (password) => {
  const saltRounds = env.security.bcryptSaltRounds;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

export const comparePassword = async (password, hashedPassword) => {
  const isMatch = await bcrypt.compare(password, hashedPassword);
  return isMatch;
};
