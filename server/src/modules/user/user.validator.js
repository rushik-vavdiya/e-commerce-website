import { z } from "zod";
import { idParams } from "../../validators/common.validator.js";

// first name, last name and phone are the values a profile must carry; gender and
// birth date are optional. An empty string or null for those two means "clear it",
// so clearing a field is a successful update rather than a validation error.
const clearedToNull = (value) => (value === "" || value === null ? null : value);

export const updateUserSchema = z
  .object({
    firstName: z.string().trim().min(2).max(50).optional(),
    lastName: z.string().trim().min(2).max(50).optional(),
    gender: z.preprocess(
      clearedToNull,
      z.union([z.null(), z.enum(["male", "female", "other"])]).optional(),
    ),
    // null is matched before the date coercion, which would otherwise turn a cleared
    // birth date into 1970-01-01.
    birthDate: z.preprocess(clearedToNull, z.union([z.null(), z.coerce.date()]).optional()),
    phone: z.string().trim().min(10).max(15).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, "At least one profile field is required");
export const userIdParams = idParams("userId");
export const userStatusSchema = z.object({ status: z.enum(["active", "inactive"]) }).strict();
