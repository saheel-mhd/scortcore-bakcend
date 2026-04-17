import { Router } from "express";

import { Role } from "@prisma/client";
import { couponController } from "../controllers/coupon.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import {
  applyCouponValidationSchema,
  createCouponValidationSchema,
  deleteCouponValidationSchema,
  getCouponValidationSchema,
  listCouponsValidationSchema,
  updateCouponValidationSchema,
  validateCouponValidationSchema,
} from "../validations/coupon.validation.js";

const couponRouter = Router();

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

couponRouter.use(authenticate, authorize(Role.admin, Role.staff));

couponRouter.get(
  "/",
  validateRequest(listCouponsValidationSchema),
  couponController.list,
);
couponRouter.get(
  "/:id",
  validateRequest(getCouponValidationSchema),
  couponController.getOne,
);
couponRouter.post(
  "/",
  validateRequest(createCouponValidationSchema),
  couponController.createCoupon,
);
couponRouter.put(
  "/:id",
  validateRequest(updateCouponValidationSchema),
  couponController.update,
);
couponRouter.delete(
  "/:id",
  validateRequest(deleteCouponValidationSchema),
  couponController.remove,
);

export { couponRouter };
export default couponRouter;
