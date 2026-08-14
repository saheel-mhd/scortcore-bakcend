import { CouponType } from "@prisma/client";
import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, "A valid id is required");

const couponCodeSchema = z
  .string()
  .trim()
  .min(3, "Coupon code must be at least 3 characters long")
  .max(40, "Coupon code must not exceed 40 characters")
  .regex(/^[A-Za-z0-9_-]+$/, "Coupon code must use letters, numbers, underscores, or hyphens only");

const moneySchema = z.coerce
  .number()
  .finite("Value must be a valid number")
  .min(0, "Value cannot be negative")
  .multipleOf(0.01, "Value can have at most two decimal places");

export const createCouponValidationSchema = z.object({
  body: z
    .object({
      code: couponCodeSchema,
      description: z.string().trim().min(1).max(300).optional(),
      type: z.nativeEnum(CouponType),
      value: moneySchema,
      minOrderAmount: moneySchema.optional(),
      maxDiscountAmount: moneySchema.optional(),
      isActive: z.coerce.boolean().default(true),
      expiresAt: z.iso.datetime().optional(),
      usageLimit: z.coerce.number().int().min(1).optional(),
    })
    .superRefine((value, context) => {
      if (value.type === CouponType.percentage && value.value > 100) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["value"],
          message: "Percentage coupon value cannot exceed 100",
        });
      }
    }),
});

const couponActionBodySchema = z.object({
  code: couponCodeSchema,
  orderId: objectIdSchema,
});

export const validateCouponValidationSchema = z.object({
  body: couponActionBodySchema,
});

export const applyCouponValidationSchema = z.object({
  body: couponActionBodySchema,
});

const cartItemSchema = z.object({
  productVariantId: objectIdSchema,
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
});

export const validateCartCouponValidationSchema = z.object({
  body: z.object({
    code: couponCodeSchema,
    items: z.array(cartItemSchema).min(1, "At least one cart item is required"),
  }),
});

export const listCouponsValidationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(50),
    sortBy: z.enum(["createdAt", "updatedAt", "code", "value", "usedCount"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    isActive: z.coerce.boolean().optional(),
    type: z.nativeEnum(CouponType).optional(),
    search: z.string().trim().max(100).optional(),
  }),
});

export const getCouponValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const updateCouponValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z
    .object({
      description: z.string().trim().min(1).max(300).nullable().optional(),
      type: z.nativeEnum(CouponType).optional(),
      value: moneySchema.optional(),
      minOrderAmount: moneySchema.nullable().optional(),
      maxDiscountAmount: moneySchema.nullable().optional(),
      isActive: z.coerce.boolean().optional(),
      expiresAt: z.iso.datetime().nullable().optional(),
      usageLimit: z.coerce.number().int().min(1).nullable().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required to update the coupon",
    }),
});

export const deleteCouponValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export type CreateCouponInput = z.infer<typeof createCouponValidationSchema>["body"];
export type ValidateCouponInput = z.infer<typeof validateCouponValidationSchema>["body"];
export type ApplyCouponInput = z.infer<typeof applyCouponValidationSchema>["body"];
export type ValidateCartCouponInput = z.infer<typeof validateCartCouponValidationSchema>["body"];
export type ListCouponsQuery = z.infer<typeof listCouponsValidationSchema>["query"];
export type UpdateCouponInput = z.infer<typeof updateCouponValidationSchema>["body"];
export type CouponIdParams = z.infer<typeof getCouponValidationSchema>["params"];
