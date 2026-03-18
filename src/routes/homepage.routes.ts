import { Router } from "express";

import { Role } from "@prisma/client";
import { homepageController } from "../controllers/homepage.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import {
  createHomepageValidationSchema,
  updateHomepageBannerValidationSchema,
  updateHomepageLayoutValidationSchema,
  updateHomepageSectionsValidationSchema,
  updateHomepageValidationSchema,
} from "../validations/homepage.validation.js";

const homepageRouter = Router();

homepageRouter.get("/", homepageController.getHomepage);

homepageRouter.post(
  "/",
  authenticate,
  authorize(Role.admin, Role.staff),
  validateRequest(createHomepageValidationSchema),
  homepageController.createHomepage,
);
homepageRouter.put(
  "/",
  authenticate,
  authorize(Role.admin, Role.staff),
  validateRequest(updateHomepageValidationSchema),
  homepageController.updateHomepage,
);
homepageRouter.put(
  "/sections",
  authenticate,
  authorize(Role.admin, Role.staff),
  validateRequest(updateHomepageSectionsValidationSchema),
  homepageController.updateHomepageSections,
);
homepageRouter.put(
  "/banner",
  authenticate,
  authorize(Role.admin, Role.staff),
  validateRequest(updateHomepageBannerValidationSchema),
  homepageController.updateHomepageBanner,
);
homepageRouter.put(
  "/layout",
  authenticate,
  authorize(Role.admin, Role.staff),
  validateRequest(updateHomepageLayoutValidationSchema),
  homepageController.updateHomepageLayout,
);
homepageRouter.delete(
  "/",
  authenticate,
  authorize(Role.admin),
  homepageController.deleteHomepage,
);

export { homepageRouter };
export default homepageRouter;
