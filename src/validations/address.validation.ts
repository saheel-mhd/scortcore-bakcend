import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, "A valid id is required");

const labelSchema = z.string().trim().min(1).max(40).optional();
const fullNameSchema = z.string().trim().min(2, "Full name must be at least 2 characters").max(120);
const phoneSchema = z.string().trim().min(3).max(30).optional();
const lineSchema = z.string().trim().min(2).max(200);
const optionalLineSchema = lineSchema.optional();
const citySchema = z.string().trim().min(2).max(80);
const stateSchema = z.string().trim().min(1).max(80).optional();
const postalCodeSchema = z.string().trim().min(2).max(20);
const countrySchema = z.string().trim().min(2).max(80);

export const createAddressValidationSchema = z.object({
  body: z.object({
    label: labelSchema,
    fullName: fullNameSchema,
    phone: phoneSchema,
    line1: lineSchema,
    line2: optionalLineSchema,
    city: citySchema,
    state: stateSchema,
    postalCode: postalCodeSchema,
    country: countrySchema,
    isDefault: z.coerce.boolean().default(false),
  }),
});

export const updateAddressValidationSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z
    .object({
      label: labelSchema.nullable(),
      fullName: fullNameSchema.optional(),
      phone: phoneSchema.nullable(),
      line1: lineSchema.optional(),
      line2: optionalLineSchema.nullable(),
      city: citySchema.optional(),
      state: stateSchema.nullable(),
      postalCode: postalCodeSchema.optional(),
      country: countrySchema.optional(),
      isDefault: z.coerce.boolean().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required to update the address",
    }),
});

export const addressIdValidationSchema = z.object({
  params: z.object({ id: objectIdSchema }),
});

export type CreateAddressInput = z.infer<typeof createAddressValidationSchema>["body"];
export type UpdateAddressInput = z.infer<typeof updateAddressValidationSchema>["body"];
export type AddressIdParams = z.infer<typeof addressIdValidationSchema>["params"];
