import { z } from "zod";
import { idParams, objectIdSchema } from "../../validators/common.validator.js";

export const couponSchema = z
  .object({
    code: z.string().trim().min(3).max(40),
    discountType: z.enum(["percentage", "fixed"]),
    discountValue: z.number().positive(),
    maxDiscountAmount: z.number().nonnegative().nullable().optional(),
    minOrderAmount: z.number().nonnegative().optional(),
    maxUses: z.number().int().positive().nullable().optional(),
    perUserLimit: z.number().int().positive().optional(),
    startsAt: z.coerce.date().optional(),
    expiresAt: z.coerce.date(),
    productIds: z.array(objectIdSchema).optional(),
    categoryIds: z.array(objectIdSchema).optional(),
    active: z.boolean().optional(),
  })
  .strict()
  .superRefine((coupon, context) => {
    if (coupon.discountType === "percentage" && coupon.discountValue > 100) {
      context.addIssue({
        code: "custom",
        path: ["discountValue"],
        message: "Percentage discount cannot exceed 100",
      });
    }
    if (coupon.startsAt && coupon.expiresAt <= coupon.startsAt) {
      context.addIssue({
        code: "custom",
        path: ["expiresAt"],
        message: "Expiry must be later than the start date",
      });
    }
  });

export const couponCodeSchema = z.object({ code: z.string().trim().min(1).max(40) }).strict();
export const couponIdParams = idParams("couponId");
