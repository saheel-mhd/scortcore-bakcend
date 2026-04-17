import { config } from "dotenv";
import { z } from "zod";

import { Role } from "@prisma/client";
import { prisma } from "../src/config/prisma.js";
import { hashPassword } from "../src/utils/hash.js";

config();

const seedEnvSchema = z.object({
  SEED_ADMIN_EMAIL: z
    .string()
    .trim()
    .email("SEED_ADMIN_EMAIL must be a valid email address")
    .transform((value) => value.toLowerCase()),
  SEED_ADMIN_PASSWORD: z
    .string()
    .min(8, "SEED_ADMIN_PASSWORD must be at least 8 characters long")
    .max(72, "SEED_ADMIN_PASSWORD must not exceed 72 characters")
    .refine((value) => /[A-Z]/.test(value), {
      message: "SEED_ADMIN_PASSWORD must include at least one uppercase letter",
    })
    .refine((value) => /[a-z]/.test(value), {
      message: "SEED_ADMIN_PASSWORD must include at least one lowercase letter",
    })
    .refine((value) => /\d/.test(value), {
      message: "SEED_ADMIN_PASSWORD must include at least one number",
    })
    .refine((value) => /[^A-Za-z0-9]/.test(value), {
      message: "SEED_ADMIN_PASSWORD must include at least one special character",
    }),
});

const seedAdminUser = async (): Promise<void> => {
  const parsed = seedEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    throw new Error(`Invalid seed environment variables: ${JSON.stringify(fieldErrors)}`);
  }

  const { SEED_ADMIN_EMAIL: email, SEED_ADMIN_PASSWORD: password } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser && existingUser.role === Role.admin) {
    console.log(`[seed] Admin user ${email} already exists — nothing to do.`);
    return;
  }

  if (existingUser && existingUser.role !== Role.admin) {
    throw new Error(
      `[seed] A user with email ${email} already exists with role "${existingUser.role}". ` +
        `Refusing to silently promote them. Use a different email or update the role manually.`,
    );
  }

  const hashedPassword = await hashPassword(password);

  const createdUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: Role.admin,
    },
    select: { id: true, email: true, role: true, createdAt: true },
  });

  console.log(`[seed] Created admin user:`, createdUser);
};

const seedSystemRoles = async (): Promise<void> => {
  const systemRoles = [
    {
      name: "admin",
      description: "Full access to all features",
      permissions: {
        dashboard: true,
        products: true,
        orders: true,
        units: true,
        coupons: true,
        layout: true,
        settings: true,
      },
      isSystem: true,
    },
    {
      name: "staff",
      description: "CRM access without user management",
      permissions: {
        dashboard: true,
        products: true,
        orders: true,
        units: true,
        coupons: true,
        layout: true,
        settings: false,
      },
      isSystem: true,
    },
    {
      name: "customer",
      description: "Store access only",
      permissions: {
        dashboard: false,
        products: false,
        orders: false,
        units: false,
        coupons: false,
        layout: false,
        settings: false,
      },
      isSystem: true,
    },
  ];

  for (const role of systemRoles) {
    const existing = await prisma.roleConfig.findUnique({
      where: { name: role.name },
    });

    if (existing) {
      console.log(`[seed] Role "${role.name}" already exists — skipping.`);
      continue;
    }

    const created = await prisma.roleConfig.create({
      data: role,
      select: { id: true, name: true, isSystem: true },
    });

    console.log(`[seed] Created system role:`, created);
  }
};

seedAdminUser()
  .then(() => seedSystemRoles())
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
