import type { Request, RequestHandler } from "express";

import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { couponService } from "../services/coupon.service.js";
import { sendSuccessResponse } from "../utils/api-response.js";
import type {
  ApplyCouponInput,
  CreateCouponInput,
  ValidateCouponInput,
} from "../validations/coupon.validation.js";

type CreateCouponRequest = Request<Record<string, never>, unknown, CreateCouponInput>;
type ValidateCouponRequest = Request<Record<string, never>, unknown, ValidateCouponInput>;
type ApplyCouponRequest = Request<Record<string, never>, unknown, ApplyCouponInput>;

const createCoupon: RequestHandler = async (request, response, next) => {
  try {
    const coupon = await couponService.createCoupon((request as CreateCouponRequest).body);

    sendSuccessResponse(response, 201, coupon, "Coupon created successfully");
  } catch (error) {
    next(error);
  }
};

const validateCoupon: RequestHandler = async (request, response, next) => {
  try {
    const authenticatedRequest = request as AuthenticatedRequest & ValidateCouponRequest;
    const result = await couponService.validateCoupon(
      authenticatedRequest.body,
      authenticatedRequest.user!,
    );

    sendSuccessResponse(response, 200, result, "Coupon validated successfully");
  } catch (error) {
    next(error);
  }
};

const applyCoupon: RequestHandler = async (request, response, next) => {
  try {
    const authenticatedRequest = request as AuthenticatedRequest & ApplyCouponRequest;
    const order = await couponService.applyCoupon(
      authenticatedRequest.body,
      authenticatedRequest.user!,
    );

    sendSuccessResponse(response, 200, order, "Coupon applied successfully");
  } catch (error) {
    next(error);
  }
};

export const couponController = {
  createCoupon,
  validateCoupon,
  applyCoupon,
};
