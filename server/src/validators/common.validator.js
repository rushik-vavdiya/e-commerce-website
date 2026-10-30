import { z } from "zod";

export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Must be a valid ID");
export const idParams = (name) => z.object({ [name]: objectIdSchema }).strict();
