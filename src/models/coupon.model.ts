import type { CouponType, Prisma } from "@prisma/client";

import { prisma } from "../config/prisma.js";

const publicCouponSelect = {
  id: true,
  code: true,
  description: true,
  type: true,
  value: true,
  minOrderAmount: true,
  maxDiscountAmount: true,
  isActive: true,
  expiresAt: true,
  usageLimit: true,
  usedCount: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.CouponSelect;

export type CouponRecord = Prisma.CouponGetPayload<{
  select: typeof publicCouponSelect;
}>;

export interface CreateCouponRecordData {
  code: string;
  description?: string;
  type: CouponType;
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  isActive: boolean;
  expiresAt?: Date;
  usageLimit?: number;
}

const findCouponById = async (id: string): Promise<CouponRecord | null> => {
  return prisma.coupon.findUnique({
    where: { id },
    select: publicCouponSelect,
  });
};

const findCouponByCode = async (code: string): Promise<CouponRecord | null> => {
  return prisma.coupon.findUnique({
    where: { code },
    select: publicCouponSelect,
  });
};

const createCoupon = async (data: CreateCouponRecordData): Promise<CouponRecord> => {
  return prisma.coupon.create({
    data,
    select: publicCouponSelect,
  });
};

const incrementCouponUsage = async (id: string): Promise<CouponRecord> => {
  return prisma.coupon.update({
    where: { id },
    data: {
      usedCount: {
        increment: 1,
      },
    },
    select: publicCouponSelect,
  });
};

export const couponModel = {
  findCouponById,
  findCouponByCode,
  createCoupon,
  incrementCouponUsage,
};
