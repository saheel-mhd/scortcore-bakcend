import { Router } from "express";

import { Role } from "@prisma/client";
import { inventoryController } from "../controllers/inventory.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import {
  adjustInventoryValidationSchema,
  inventoryVariantParamsValidationSchema,
  listInventoryMovementsValidationSchema,
  listInventoryValidationSchema,
  listLowStockValidationSchema,
} from "../validations/inventory.validation.js";

const inventoryRouter = Router();

inventoryRouter.use(authenticate, authorize(Role.admin, Role.staff));

inventoryRouter.get("/", validateRequest(listInventoryValidationSchema), inventoryController.listInventory);
inventoryRouter.get(
  "/low-stock",
  validateRequest(listLowStockValidationSchema),
  inventoryController.listLowStock,
);
inventoryRouter.get(
  "/:productVariantId/movements",
  validateRequest(listInventoryMovementsValidationSchema),
  inventoryController.listInventoryMovements,
);
inventoryRouter.put(
  "/:productVariantId/stock",
  validateRequest(adjustInventoryValidationSchema),
  inventoryController.adjustInventoryStock,
);

void inventoryVariantParamsValidationSchema;

export { inventoryRouter };
export default inventoryRouter;
