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

export interface UpdateCouponRecordData {
  description?: string | null;
  type?: CouponType;
  value?: number;
  minOrderAmount?: number | null;
  maxDiscountAmount?: number | null;
  isActive?: boolean;
  expiresAt?: Date | null;
  usageLimit?: number | null;
}

export interface ListCouponsOptions {
  skip: number;
  take: number;
  sortBy: string;
  sortOrder: Prisma.SortOrder;
  isActive?: boolean;
  type?: CouponType;
  search?: string;
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

const list = async (options: ListCouponsOptions) => {
  const conditions: Prisma.CouponWhereInput[] = [];

  if (typeof options.isActive === "boolean") {
    conditions.push({ isActive: options.isActive });
  }

  if (options.type) {
    conditions.push({ type: options.type });
  }

  if (options.search) {
    conditions.push({
      OR: [
        { code: { contains: options.search, mode: "insensitive" } },
        { description: { contains: options.search, mode: "insensitive" } },
      ],
    });
  }

  const where: Prisma.CouponWhereInput =
    conditions.length === 0 ? {} : { AND: conditions };

  const [items, total] = await prisma.$transaction([
    prisma.coupon.findMany({
      where,
      skip: options.skip,
      take: options.take,
      orderBy: { [options.sortBy]: options.sortOrder },
      select: publicCouponSelect,
    }),
    prisma.coupon.count({ where }),
  ]);

  return { items, total };
};

const createCoupon = async (data: CreateCouponRecordData): Promise<CouponRecord> => {
  return prisma.coupon.create({
    data,
    select: publicCouponSelect,
  });
};

const updateCoupon = async (
  id: string,
  data: UpdateCouponRecordData,
): Promise<CouponRecord> => {
  return prisma.coupon.update({
    where: { id },
    data,
    select: publicCouponSelect,
  });
};

const deleteCoupon = async (id: string): Promise<CouponRecord> => {
  return prisma.coupon.delete({
    where: { id },
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
  list,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  incrementCouponUsage,
};
