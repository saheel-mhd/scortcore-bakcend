import { Router } from "express";

import { Role } from "@prisma/client";
import { couponController } from "../controllers/coupon.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import {
  applyCouponValidationSchema,
  createCouponValidationSchema,
  validateCouponValidationSchema,
} from "../validations/coupon.validation.js";

const couponRouter = Router();

couponRouter.post(
  "/",
  authenticate,
  authorize(Role.admin),
  validateRequest(createCouponValidationSchema),
  couponController.createCoupon,
);
couponRouter.post(
  "/validate",
  authenticate,
  validateRequest(validateCouponValidationSchema),
  couponController.validateCoupon,
);
couponRouter.post(
  "/apply",
  authenticate,
  validateRequest(applyCouponValidationSchema),
  couponController.applyCoupon,
);

export { couponRouter };
export default couponRouter;
