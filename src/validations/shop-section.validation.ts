import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, "A valid id is required");

const titleSchema = z
  .string()
  .trim()
  .min(2, "Title must be at least 2 characters long")
  .max(120, "Title must not exceed 120 characters");

const descriptionSchema = z
  .string()
  .trim()
  .min(1)
  .max(500, "Description must not exceed 500 characters")
  .optional();

const productIdsSchema = z
  .array(objectIdSchema)
  .max(60, "A section can list at most 60 products");

const hexColorSchema = z
  .string()
  .trim()
  .regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/, "Must be a valid hex color");

const imageUrlSchema = z
  .string()
  .trim()
  .url("Must be a valid URL")
  .max(2048, "URL must not exceed 2048 characters");

const alignmentSchema = z.enum(["left", "center", "right"]);

const bannerConfigSchema = z.object({
  backgroundImage: imageUrlSchema.optional(),
  backgroundColor: hexColorSchema.optional(),
  textColor: hexColorSchema.optional(),
  height: z.coerce.number().int().min(120).max(1200).default(400),
  contentAlign: alignmentSchema.default("center"),
  ctaLabel: z.string().trim().min(1).max(60).optional(),
  ctaHref: z.string().trim().min(1).max(500).optional(),
});

const shopRowTypeSchema = z.enum(["featured", "grid", "carousel", "banner"]);

export const createShopSectionValidationSchema = z.object({
  body: z
    .object({
      title: titleSchema,
      description: descriptionSchema,
      type: shopRowTypeSchema.default("grid"),
      columns: z.coerce.number().int().min(1).max(4).default(4),
      productIds: productIdsSchema.default([]),
      bannerConfig: bannerConfigSchema.optional(),
      isActive: z.coerce.boolean().default(true),
      displayOrder: z.coerce.number().int().min(0).default(0),
    })
    .superRefine((value, ctx) => {
      if (value.type === "banner" && !value.bannerConfig) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["bannerConfig"],
          message: "bannerConfig is required when type is banner",
        });
      }
    }),
});

export const updateShopSectionValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z
    .object({
      title: titleSchema.optional(),
      description: descriptionSchema.nullable().optional(),
      type: shopRowTypeSchema.optional(),
      columns: z.coerce.number().int().min(1).max(4).optional(),
      productIds: productIdsSchema.optional(),
      bannerConfig: bannerConfigSchema.nullable().optional(),
      isActive: z.coerce.boolean().optional(),
      displayOrder: z.coerce.number().int().min(0).optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required to update the section",
    }),
});

export const getShopSectionValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const deleteShopSectionValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const listShopSectionsValidationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(50),
    sortBy: z.enum(["displayOrder", "createdAt", "updatedAt", "title"]).default("displayOrder"),
    sortOrder: z.enum(["asc", "desc"]).default("asc"),
    isActive: z.coerce.boolean().optional(),
    type: shopRowTypeSchema.optional(),
  }),
});

export type CreateShopSectionInput = z.infer<typeof createShopSectionValidationSchema>["body"];
export type UpdateShopSectionInput = z.infer<typeof updateShopSectionValidationSchema>["body"];
export type ShopSectionIdParams = z.infer<typeof getShopSectionValidationSchema>["params"];
export type ListShopSectionsQuery = z.infer<typeof listShopSectionsValidationSchema>["query"];
export type ShopBannerConfig = z.infer<typeof bannerConfigSchema>;
