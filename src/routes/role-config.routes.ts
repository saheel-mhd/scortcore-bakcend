import { Router } from "express";

import { Role } from "@prisma/client";
import { roleConfigController } from "../controllers/role-config.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import {
  createRoleConfigValidationSchema,
  deleteRoleConfigValidationSchema,
  getRoleConfigValidationSchema,
  updateRoleConfigValidationSchema,
} from "../validations/role-config.validation.js";

const roleConfigRouter = Router();

roleConfigRouter.use(authenticate, authorize(Role.admin));

roleConfigRouter.get("/", roleConfigController.list);
roleConfigRouter.get(
  "/:id",
  validateRequest(getRoleConfigValidationSchema),
  roleConfigController.getOne,
);
roleConfigRouter.post(
  "/",
  validateRequest(createRoleConfigValidationSchema),
  roleConfigController.create,
);
roleConfigRouter.put(
  "/:id",
  validateRequest(updateRoleConfigValidationSchema),
  roleConfigController.update,
);
roleConfigRouter.delete(
  "/:id",
  validateRequest(deleteRoleConfigValidationSchema),
  roleConfigController.remove,
);

export { roleConfigRouter };
export default roleConfigRouter;
