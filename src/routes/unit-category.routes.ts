import { Router } from "express";

import { Role } from "@prisma/client";
import { unitCategoryController } from "../controllers/unit-category.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import {
  createUnitCategoryValidationSchema,
  deleteUnitCategoryValidationSchema,
  getUnitCategoryValidationSchema,
  listUnitCategoriesValidationSchema,
  updateUnitCategoryValidationSchema,
} from "../validations/unit-category.validation.js";

const unitCategoryRouter = Router();

unitCategoryRouter.use(authenticate, authorize(Role.admin, Role.staff));

unitCategoryRouter.get(
  "/",
  validateRequest(listUnitCategoriesValidationSchema),
  unitCategoryController.list,
);
unitCategoryRouter.get(
  "/:id",
  validateRequest(getUnitCategoryValidationSchema),
  unitCategoryController.getOne,
);
unitCategoryRouter.post(
  "/",
  validateRequest(createUnitCategoryValidationSchema),
  unitCategoryController.create,
);
unitCategoryRouter.put(
  "/:id",
  validateRequest(updateUnitCategoryValidationSchema),
  unitCategoryController.update,
);
unitCategoryRouter.delete(
  "/:id",
  validateRequest(deleteUnitCategoryValidationSchema),
  unitCategoryController.remove,
);

export { unitCategoryRouter };
export default unitCategoryRouter;
