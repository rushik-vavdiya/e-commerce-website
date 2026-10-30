import { z } from "zod";

const emailField = z.string().trim().email("Please provide a valid email");

const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .max(100, "Password cannot exceed 100 characters");

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name cannot exceed 50 characters"),

    lastName: z
      .string()
      .trim()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name cannot exceed 50 characters"),

    email: emailField,

    password: passwordSchema,

    phoneNumber: z
      .string()
      .trim()
      .regex(/^\+?[0-9]{10,15}$/, "Phone number must contain 10 to 15 digits"),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().trim().email(),
    password: z.string().min(1).max(100),
  })
  .strict();

export const emailSchema = z.object({ email: emailField }).strict();

export const verifyEmailSchema = z
  .object({
    token: z.string().min(20).max(500),
  })
  .strict();

export const resetPasswordSchema = z
  .object({
    token: z.string().min(20).max(500),
    newPassword: passwordSchema,
  })
  .strict();

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1).max(100),
    newPassword: passwordSchema,
  })
  .strict();
