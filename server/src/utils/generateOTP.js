import { randomInt } from "node:crypto";

const generateOTP = (length = 6) => {
  if (!Number.isInteger(length) || length < 4 || length > 9) {
    throw new Error("OTP length must be a whole number between 4 and 9");
  }
  return randomInt(0, 10 ** length)
    .toString()
    .padStart(length, "0");
};

export default generateOTP;
