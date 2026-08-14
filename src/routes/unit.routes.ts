import { Router } from "express";
import { unitController } from "../controllers/unit.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { createUnitValidationSchema, deleteUnitValidationSchema, getUnitValidationSchema, listUnitsValidationSchema, updateUnitValidationSchema, } from "../validations/unit.validation.js";

const unitRouter = Router();

unitRouter.use(authenticate, requirePermission("units"));
unitRouter.get("/", validateRequest(listUnitsValidationSchema), unitController.list);
unitRouter.get("/:id", validateRequest(getUnitValidationSchema), unitController.getOne);
unitRouter.post("/", validateRequest(createUnitValidationSchema), unitController.create);
unitRouter.put("/:id", validateRequest(updateUnitValidationSchema), unitController.update);
unitRouter.delete("/:id", validateRequest(deleteUnitValidationSchema), unitController.remove);

export { unitRouter };
export default unitRouter;
