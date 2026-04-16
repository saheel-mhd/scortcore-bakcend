import { Router } from "express";

import { Role } from "@prisma/client";
import { homepageSectionController } from "../controllers/homepage-section.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import {
  createHomepageSectionValidationSchema,
  deleteHomepageSectionValidationSchema,
  getHomepageSectionValidationSchema,
  listHomepageSectionsValidationSchema,
  updateHomepageSectionValidationSchema,
} from "../validations/homepage-section.validation.js";

const homepageSectionRouter = Router();

homepageSectionRouter.get("/active", homepageSectionController.listActive);

homepageSectionRouter.use(authenticate, authorize(Role.admin, Role.staff));

homepageSectionRouter.get(
  "/",
  validateRequest(listHomepageSectionsValidationSchema),
  homepageSectionController.list,
);
homepageSectionRouter.get(
  "/:id",
  validateRequest(getHomepageSectionValidationSchema),
  homepageSectionController.getOne,
);
homepageSectionRouter.post(
  "/",
  validateRequest(createHomepageSectionValidationSchema),
  homepageSectionController.create,
);
homepageSectionRouter.put(
  "/:id",
  validateRequest(updateHomepageSectionValidationSchema),
  homepageSectionController.update,
);
homepageSectionRouter.delete(
  "/:id",
  validateRequest(deleteHomepageSectionValidationSchema),
  homepageSectionController.remove,
);

export { homepageSectionRouter };
export default homepageSectionRouter;
