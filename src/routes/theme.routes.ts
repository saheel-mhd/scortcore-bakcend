import { Router } from "express";
import { Role } from "@prisma/client";
import { themeController } from "../controllers/theme.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { activateThemeValidationSchema, createThemeValidationSchema, deleteThemeValidationSchema, getThemeValidationSchema, listThemesValidationSchema, updateThemeValidationSchema, } from "../validations/theme.validation.js";

const themeRouter = Router();

themeRouter.get("/active", themeController.getActiveTheme);
themeRouter.get(
  "/",
  authenticate,
  requirePermission("layout"),
  validateRequest(listThemesValidationSchema),
  themeController.listThemes,
);
themeRouter.get(
  "/:id",
  authenticate,
  requirePermission("layout"),
  validateRequest(getThemeValidationSchema),
  themeController.getTheme,
);
themeRouter.post(
  "/",
  authenticate,
  requirePermission("layout"),
  validateRequest(createThemeValidationSchema),
  themeController.createTheme,
);
themeRouter.put(
  "/:id",
  authenticate,
  requirePermission("layout"),
  validateRequest(updateThemeValidationSchema),
  themeController.updateTheme,
);
themeRouter.put(
  "/:id/activate",
  authenticate,
  requirePermission("layout"),
  validateRequest(activateThemeValidationSchema),
  themeController.activateTheme,
);
themeRouter.delete(
  "/:id",
  authenticate,
  requirePermission("layout"),
  authorize(Role.admin),
  validateRequest(deleteThemeValidationSchema),
  themeController.deleteTheme,
);

export { themeRouter };
export default themeRouter;
