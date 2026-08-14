import { Router } from "express";
import { Role } from "@prisma/client";
import { homepageController } from "../controllers/homepage.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { createHomepageValidationSchema, updateHomepageBannerValidationSchema, updateHomepageLayoutValidationSchema, updateHomepageSectionsValidationSchema, updateHomepageValidationSchema, } from "../validations/homepage.validation.js";

const homepageRouter = Router();

homepageRouter.get("/", homepageController.getHomepage);
homepageRouter.post(
  "/",
  authenticate,
  requirePermission("layout"),
  validateRequest(createHomepageValidationSchema),
  homepageController.createHomepage,
);
homepageRouter.put(
  "/",
  authenticate,
  requirePermission("layout"),
  validateRequest(updateHomepageValidationSchema),
  homepageController.updateHomepage,
);
homepageRouter.put(
  "/sections",
  authenticate,
  requirePermission("layout"),
  validateRequest(updateHomepageSectionsValidationSchema),
  homepageController.updateHomepageSections,
);
homepageRouter.put(
  "/banner",
  authenticate,
  requirePermission("layout"),
  validateRequest(updateHomepageBannerValidationSchema),
  homepageController.updateHomepageBanner,
);
homepageRouter.put(
  "/layout",
  authenticate,
  requirePermission("layout"),
  validateRequest(updateHomepageLayoutValidationSchema),
  homepageController.updateHomepageLayout,
);
homepageRouter.delete(
  "/",
  authenticate,
  requirePermission("layout"),
  authorize(Role.admin),
  homepageController.deleteHomepage,
);

export { homepageRouter };
export default homepageRouter;
