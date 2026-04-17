import { CouponType, OrderStatus, type Role } from "@prisma/client";

import { couponModel } from "../models/coupon.model.js";
import { orderModel } from "../models/order.model.js";
import { AppError } from "../utils/app-error.js";
import type {
  ApplyCouponInput,
  CreateCouponInput,
  ValidateCouponInput,
} from "../validations/coupon.validation.js";

interface CouponValidationResult {
  couponId: string;
  code: string;
  type: CouponType;
  subtotalAmount: number;
  discountAmount: number;
  totalAmount: number;
  isValid: true;
}

const normalizeCouponCode = (value: string): string => {
  return value.trim().toUpperCase();
};

const ensureOrderAccess = (
  customerId: string,
  authenticatedUser: { id: string; role: Role },
): void => {
  if (authenticatedUser.role === "admin") {
    return;
  }

  if (customerId !== authenticatedUser.id) {
    throw new AppError("You are not authorized to access this order", 403);
  }
};

const calculateDiscount = (
  subtotalAmount: number,
  coupon: Awaited<ReturnType<typeof couponModel.findCouponByCode>> extends infer T
    ? Exclude<T, null>
    : never,
): number => {
  let discountAmount =
    coupon.type === CouponType.percentage
      ? Number(((subtotalAmount * coupon.value) / 100).toFixed(2))
      : Number(coupon.value.toFixed(2));

  if (typeof coupon.maxDiscountAmount === "number") {
    discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
  }

  discountAmount = Math.min(discountAmount, subtotalAmount);

  return Number(discountAmount.toFixed(2));
};

const validateCouponAgainstOrder = async (
  code: string,
  orderId: string,
  authenticatedUser: { id: string; role: Role },
): Promise<CouponValidationResult> => {
  const normalizedCode = normalizeCouponCode(code);
  const coupon = await couponModel.findCouponByCode(normalizedCode);

  if (!coupon) {
    throw new AppError("Coupon not found", 404);
  }

  if (!coupon.isActive) {
    throw new AppError("Coupon is inactive", 400);
  }

  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
    throw new AppError("Coupon has expired", 400);
  }

  if (typeof coupon.usageLimit === "number" && coupon.usedCount >= coupon.usageLimit) {
    throw new AppError("Coupon usage limit has been reached", 400);
  }

  const order = await orderModel.findOrderById(orderId);

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  ensureOrderAccess(order.customerId, authenticatedUser);

  if (order.status !== OrderStatus.pending) {
    throw new AppError("Coupons can only be applied to pending orders", 400);
  }

  if (order.payment && order.payment.status === "paid") {
    throw new AppError("Coupons cannot be applied to paid orders", 400);
  }

  const subtotalAmount = order.subtotalAmount;

  if (typeof coupon.minOrderAmount === "number" && subtotalAmount < coupon.minOrderAmount) {
    throw new AppError("Order does not meet the minimum amount required for this coupon", 400);
  }

  const discountAmount = calculateDiscount(subtotalAmount, coupon);
  const totalAmount = Number((subtotalAmount - discountAmount).toFixed(2));

  return {
    couponId: coupon.id,
    code: coupon.code,
    type: coupon.type,
    subtotalAmount,
    discountAmount,
    totalAmount,
    isValid: true,
  };
};

const createCoupon = async (input: CreateCouponInput) => {
  const normalizedCode = normalizeCouponCode(input.code);
  const existingCoupon = await couponModel.findCouponByCode(normalizedCode);

  if (existingCoupon) {
    throw new AppError("Coupon with this code already exists", 409);
  }

  return couponModel.createCoupon({
    code: normalizedCode,
    description: input.description,
    type: input.type,
    value: input.value,
    minOrderAmount: input.minOrderAmount,
    maxDiscountAmount: input.maxDiscountAmount,
    isActive: input.isActive,
    expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
    usageLimit: input.usageLimit,
  });
};

const validateCoupon = async (
  input: ValidateCouponInput,
  authenticatedUser: { id: string; role: Role },
) => {
  return validateCouponAgainstOrder(input.code, input.orderId, authenticatedUser);
};

const applyCoupon = async (
  input: ApplyCouponInput,
  authenticatedUser: { id: string; role: Role },
) => {
  const validationResult = await validateCouponAgainstOrder(
    input.code,
    input.orderId,
    authenticatedUser,
  );

  await couponModel.incrementCouponUsage(validationResult.couponId);

  return orderModel.updateOrderPricing(input.orderId, {
    couponId: validationResult.couponId,
    discountAmount: validationResult.discountAmount,
    totalAmount: validationResult.totalAmount,
  });
};

const list = async (query: {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
  isActive?: boolean;
  type?: "percentage" | "fixed";
  search?: string;
}) => {
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const result = await couponModel.list({
    skip,
    take: limit,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
    isActive: query.isActive,
    type: query.type,
    search: query.search,
  });

  const totalPages = result.total === 0 ? 0 : Math.ceil(result.total / limit);

  return {
    items: result.items,
    pagination: { page, limit, total: result.total, totalPages },
  };
};

const getById = async (id: string) => {
  const coupon = await couponModel.findCouponById(id);
  if (!coupon) {
    throw new AppError("Coupon not found", 404);
  }
  return coupon;
};

const updateCoupon = async (
  id: string,
  input: {
    description?: string | null;
    type?: "percentage" | "fixed";
    value?: number;
    minOrderAmount?: number | null;
    maxDiscountAmount?: number | null;
    isActive?: boolean;
    expiresAt?: string | null;
    usageLimit?: number | null;
  },
) => {
  const existing = await couponModel.findCouponById(id);
  if (!existing) {
    throw new AppError("Coupon not found", 404);
  }

  return couponModel.updateCoupon(id, {
    description: input.description,
    type: input.type,
    value: input.value,
    minOrderAmount: input.minOrderAmount,
    maxDiscountAmount: input.maxDiscountAmount,
    isActive: input.isActive,
    expiresAt:
      input.expiresAt === undefined
        ? undefined
        : input.expiresAt === null
          ? null
          : new Date(input.expiresAt),
    usageLimit: input.usageLimit,
  });
};

const deleteCoupon = async (id: string) => {
  const existing = await couponModel.findCouponById(id);
  if (!existing) {
    throw new AppError("Coupon not found", 404);
  }
  return couponModel.deleteCoupon(id);
};

export const couponService = {
  createCoupon,
  validateCoupon,
  applyCoupon,
  list,
  getById,
  updateCoupon,
  deleteCoupon,
};
