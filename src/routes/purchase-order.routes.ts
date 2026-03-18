import { Router } from "express";

import { Role } from "@prisma/client";
import { purchaseOrderController } from "../controllers/purchase-order.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import {
  createPurchaseOrderValidationSchema,
  getPurchaseOrderValidationSchema,
  listPurchaseOrdersValidationSchema,
  receivePurchaseOrderValidationSchema,
} from "../validations/purchase-order.validation.js";

const purchaseOrderRouter = Router();

purchaseOrderRouter.use(authenticate, authorize(Role.admin, Role.staff));

purchaseOrderRouter.get(
  "/",
  validateRequest(listPurchaseOrdersValidationSchema),
  purchaseOrderController.listPurchaseOrders,
);
purchaseOrderRouter.get(
  "/:id",
  validateRequest(getPurchaseOrderValidationSchema),
  purchaseOrderController.getPurchaseOrder,
);
purchaseOrderRouter.post(
  "/",
  validateRequest(createPurchaseOrderValidationSchema),
  purchaseOrderController.createPurchaseOrder,
);
purchaseOrderRouter.put(
  "/:id/receive",
  validateRequest(receivePurchaseOrderValidationSchema),
  purchaseOrderController.receivePurchaseOrder,
);

export { purchaseOrderRouter };
export default purchaseOrderRouter;
