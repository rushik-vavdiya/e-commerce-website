import { z } from "zod";

// Body of POST /api/contact. The same limits as the form on the client, so a
// direct API call gets the same answer as a typed one.
export const contactMessageSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    email: z
      .string()
      .trim()
      .email()
      .max(254)
      .transform((email) => email.toLowerCase()),
    message: z.string().trim().min(10).max(2000),
  })
  .strict();

// Query of GET /api/contact (the admin list).
export const contactListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();
