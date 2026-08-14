import { Router } from "express";
import { couponController } from "../controllers/coupon.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { applyCouponValidationSchema, createCouponValidationSchema, deleteCouponValidationSchema, getCouponValidationSchema, listCouponsValidationSchema, updateCouponValidationSchema, validateCartCouponValidationSchema, validateCouponValidationSchema, } from "../validations/coupon.validation.js";

const couponRouter = Router();

couponRouter.post(
  "/validate",
  authenticate,
  validateRequest(validateCouponValidationSchema),
  couponController.validateCoupon,
);
couponRouter.post(
  "/validate-cart",
  authenticate,
  validateRequest(validateCartCouponValidationSchema),
  couponController.validateCouponForCart,
);
couponRouter.post(
  "/apply",
  authenticate,
  validateRequest(applyCouponValidationSchema),
  couponController.applyCoupon,
);
couponRouter.use(authenticate, requirePermission("coupons"));
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
