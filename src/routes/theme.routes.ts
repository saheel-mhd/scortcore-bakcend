import { Router } from "express";

import { Role } from "@prisma/client";
import { themeController } from "../controllers/theme.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import {
  activateThemeValidationSchema,
  createThemeValidationSchema,
  deleteThemeValidationSchema,
  getThemeValidationSchema,
  listThemesValidationSchema,
  updateThemeValidationSchema,
} from "../validations/theme.validation.js";

const themeRouter = Router();

themeRouter.get("/active", themeController.getActiveTheme);

themeRouter.get(
  "/",
  authenticate,
  authorize(Role.admin, Role.staff),
  validateRequest(listThemesValidationSchema),
  themeController.listThemes,
);
themeRouter.get(
  "/:id",
  authenticate,
  authorize(Role.admin, Role.staff),
  validateRequest(getThemeValidationSchema),
  themeController.getTheme,
);
themeRouter.post(
  "/",
  authenticate,
  authorize(Role.admin, Role.staff),
  validateRequest(createThemeValidationSchema),
  themeController.createTheme,
);
themeRouter.put(
  "/:id",
  authenticate,
  authorize(Role.admin, Role.staff),
  validateRequest(updateThemeValidationSchema),
  themeController.updateTheme,
);
themeRouter.put(
  "/:id/activate",
  authenticate,
  authorize(Role.admin, Role.staff),
  validateRequest(activateThemeValidationSchema),
  themeController.activateTheme,
);
themeRouter.delete(
  "/:id",
  authenticate,
  authorize(Role.admin),
  validateRequest(deleteThemeValidationSchema),
  themeController.deleteTheme,
);

export { themeRouter };
export default themeRouter;
