import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, "A valid product id is required");

export const wishlistProductParamsValidationSchema = z.object({
  params: z.object({
    productId: objectIdSchema,
  }),
});

export type WishlistProductIdParams = z.infer<
  typeof wishlistProductParamsValidationSchema
>["params"];
