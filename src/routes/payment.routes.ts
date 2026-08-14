import { Router } from "express";
import { paymentController } from "../controllers/payment.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { createPaymentValidationSchema, getPaymentByOrderValidationSchema, getPaymentValidationSchema, listPaymentsValidationSchema, updatePaymentStatusValidationSchema, } from "../validations/payment.validation.js";

const paymentRouter = Router();

paymentRouter.use(authenticate);
paymentRouter.post("/", validateRequest(createPaymentValidationSchema), paymentController.createPayment);
paymentRouter.get(
  "/",
  requirePermission("orders"),
  validateRequest(listPaymentsValidationSchema),
  paymentController.listPayments,
);
paymentRouter.get(
  "/order/:orderId",
  validateRequest(getPaymentByOrderValidationSchema),
  paymentController.getPaymentByOrderId,
);
paymentRouter.get("/:id", validateRequest(getPaymentValidationSchema), paymentController.getPayment);
paymentRouter.put(
  "/:id/status",
  requirePermission("orders"),
  validateRequest(updatePaymentStatusValidationSchema),
  paymentController.updatePaymentStatus,
);

export { paymentRouter };
export default paymentRouter;
