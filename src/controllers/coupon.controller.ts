import type { Request, RequestHandler } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { couponService } from "../services/coupon.service.js";
import { sendSuccessResponse } from "../utils/api-response.js";
import type { ApplyCouponInput, CouponIdParams, CreateCouponInput, ListCouponsQuery, UpdateCouponInput, ValidateCartCouponInput, ValidateCouponInput, } from "../validations/coupon.validation.js";

type CreateCouponRequest = Request<Record<string, never>, unknown, CreateCouponInput>;
type ValidateCouponRequest = Request<Record<string, never>, unknown, ValidateCouponInput>;
type ValidateCartCouponRequest = Request<Record<string, never>, unknown, ValidateCartCouponInput>;
type ApplyCouponRequest = Request<Record<string, never>, unknown, ApplyCouponInput>;
type ListRequest = Request<Record<string, string>, unknown, unknown, ListCouponsQuery>;
type GetRequest = Request<CouponIdParams>;
type UpdateRequest = Request<CouponIdParams, unknown, UpdateCouponInput>;

const list: RequestHandler = async (request, response, next) => {
  try {
    const result = await couponService.list(
      (request as unknown as ListRequest).query,
    );
    sendSuccessResponse(response, 200, result, "Coupons retrieved successfully");
  } catch (error) {
    next(error);
  }
};

const getOne: RequestHandler = async (request, response, next) => {
  try {
    const coupon = await couponService.getById((request as GetRequest).params.id);
    sendSuccessResponse(response, 200, coupon, "Coupon retrieved successfully");
  } catch (error) {
    next(error);
  }
};

const createCoupon: RequestHandler = async (request, response, next) => {
  try {
    const coupon = await couponService.createCoupon((request as CreateCouponRequest).body);
    sendSuccessResponse(response, 201, coupon, "Coupon created successfully");
  } catch (error) {
    next(error);
  }
};

const update: RequestHandler = async (request, response, next) => {
  try {
    const typed = request as UpdateRequest;
    const coupon = await couponService.updateCoupon(typed.params.id, typed.body);
    sendSuccessResponse(response, 200, coupon, "Coupon updated successfully");
  } catch (error) {
    next(error);
  }
};

const remove: RequestHandler = async (request, response, next) => {
  try {
    const coupon = await couponService.deleteCoupon((request as GetRequest).params.id);
    sendSuccessResponse(response, 200, coupon, "Coupon deleted successfully");
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

const validateCouponForCart: RequestHandler = async (request, response, next) => {
  try {
    const result = await couponService.validateCouponForCart(
      (request as ValidateCartCouponRequest).body,
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
  list,
  getOne,
  createCoupon,
  update,
  remove,
  validateCoupon,
  validateCouponForCart,
  applyCoupon,
};
