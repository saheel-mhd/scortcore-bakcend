import { z } from "zod";

import { Role } from "@prisma/client";

const emailSchema = z
  .string()
  .trim()
  .email("A valid email address is required")
  .transform((value) => value.toLowerCase());

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(72, "Password must not exceed 72 characters")
  .refine((value) => /[A-Z]/.test(value), {
    message: "Password must include at least one uppercase letter",
  })
  .refine((value) => /[a-z]/.test(value), {
    message: "Password must include at least one lowercase letter",
  })
  .refine((value) => /\d/.test(value), {
    message: "Password must include at least one number",
  })
  .refine((value) => /[^A-Za-z0-9]/.test(value), {
    message: "Password must include at least one special character",
  });

const loginPasswordSchema = z
  .string()
  .min(1, "Password is required")
  .max(72, "Password must not exceed 72 characters");

export const registerValidationSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: passwordSchema,
    role: z.literal(Role.customer).default(Role.customer),
  }),
});

export const loginValidationSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: loginPasswordSchema,
  }),
});

export const changePasswordValidationSchema = z.object({
  body: z.object({
    currentPassword: loginPasswordSchema,
    newPassword: passwordSchema,
  }),
});

export type RegisterUserInput = z.infer<typeof registerValidationSchema>["body"];
export type LoginUserInput = z.infer<typeof loginValidationSchema>["body"];
export type ChangePasswordInput = z.infer<typeof changePasswordValidationSchema>["body"];
