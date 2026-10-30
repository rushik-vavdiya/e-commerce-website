import { z } from "zod";
import { idParams } from "../../validators/common.validator.js";

const socialLinks = z
  .object({
    instagram: z.string().url().nullable().optional(),
    facebook: z.string().url().nullable().optional(),
    youtube: z.string().url().nullable().optional(),
    twitter: z.string().url().nullable().optional(),
    website: z.string().url().nullable().optional(),
  })
  .strict();

export const vendorApplicationSchema = z
  .object({
    storeName: z.string().trim().min(2).max(120),
    storeDescription: z.string().trim().min(10).max(2000),
    storeAddress: z.string().trim().min(5).max(500),
    storeContact: z.string().trim().min(10).max(20),
    storeEmail: z.string().trim().email(),
    storeSocial: socialLinks.optional(),
  })
  .strict();

export const vendorUpdateSchema = vendorApplicationSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, "At least one vendor profile field is required");

// A rejected application must say why, so the vendor knows what to fix.
export const vendorReviewSchema = z
  .object({
    approvalStatus: z.enum(["approved", "rejected", "under_review"]),
    rejectionReason: z.string().trim().max(500).optional(),
  })
  .strict()
  .superRefine((review, context) => {
    if (review.approvalStatus === "rejected" && !review.rejectionReason) {
      context.addIssue({
        code: "custom",
        path: ["rejectionReason"],
        message: "A rejection reason is required",
      });
    }
  });
export const vendorIdParams = idParams("vendorId");

// Ban / unban: PATCH /vendors/:vendorId/status carries only the new status.
export const vendorStatusSchema = z
  .object({
    status: z.enum(["suspended", "active"]),
  })
  .strict();
