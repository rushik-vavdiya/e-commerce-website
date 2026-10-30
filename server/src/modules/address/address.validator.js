import { z } from "zod";

// Indian delivery details. The mobile number is the 10-digit local format and the
// PIN code is the 6-digit postal code, so a typo is caught before the address is
// saved instead of when the courier cannot find the door.
const phoneSchema = z
  .string()
  .trim()
  .regex(/^[6-9][0-9]{9}$/, "Enter a 10-digit mobile number");

const postalCodeSchema = z
  .string()
  .trim()
  .regex(/^[1-9][0-9]{5}$/, "Enter a 6-digit PIN code");

export const addressSchema = z
  .object({
    fullName: z.string().trim().min(2).max(150),
    phone: phoneSchema,
    // Flat or house number and the street or area.
    addressLine1: z.string().trim().min(3).max(200),
    addressLine2: z.string().trim().max(200).optional(),
    city: z.string().trim().min(1).max(100),
    state: z.string().trim().min(1).max(100),
    postalCode: postalCodeSchema,
    country: z.string().trim().min(2).max(100),
    default: z.boolean().optional(),
    type: z.enum(["home", "work", "other"]).optional(),
  })
  .strict();

// Editing one field (for example the default flag from the address book) only
// sends that field, so the update schema stays partial while the postal code and
// phone keep their format rule when they are included.
export const addressUpdateSchema = z
  .object({
    fullName: z.string().trim().min(2).max(150).optional(),
    phone: phoneSchema.optional(),
    addressLine1: z.string().trim().min(3).max(200).optional(),
    addressLine2: z.string().trim().max(200).optional(),
    city: z.string().trim().min(1).max(100).optional(),
    state: z.string().trim().min(1).max(100).optional(),
    postalCode: postalCodeSchema.optional(),
    country: z.string().trim().min(2).max(100).optional(),
    default: z.boolean().optional(),
    type: z.enum(["home", "work", "other"]).optional(),
  })
  .refine((address) => Object.keys(address).length > 0, "At least one address field is required");
