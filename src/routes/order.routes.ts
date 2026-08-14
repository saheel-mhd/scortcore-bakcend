import { Router } from "express";
import { Role } from "@prisma/client";
import { orderController } from "../controllers/order.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { cancelOrderValidationSchema, createOrderValidationSchema, deleteOrderValidationSchema, getOrderValidationSchema, listOrdersValidationSchema, listUserOrdersValidationSchema, updateOrderStatusValidationSchema, } from "../validations/order.validation.js";

const orderRouter = Router();

orderRouter.use(authenticate);
orderRouter.get("/my-orders", validateRequest(listUserOrdersValidationSchema), orderController.listUserOrders);
orderRouter.get(
  "/",
  requirePermission("orders"),
  validateRequest(listOrdersValidationSchema),
  orderController.listOrders,
);
orderRouter.get("/:id", validateRequest(getOrderValidationSchema), orderController.getOrder);
orderRouter.post("/", validateRequest(createOrderValidationSchema), orderController.createOrder);
orderRouter.put(
  "/:id/status",
  requirePermission("orders"),
  validateRequest(updateOrderStatusValidationSchema),
  orderController.updateOrderStatus,
);
orderRouter.put(
  "/:id/cancel",
  validateRequest(cancelOrderValidationSchema),
  orderController.cancelOrder,
);
orderRouter.delete(
  "/:id",
  requirePermission("orders"),
  authorize(Role.admin),
  validateRequest(deleteOrderValidationSchema),
  orderController.deleteOrder,
);

export { orderRouter };
export default orderRouter;
