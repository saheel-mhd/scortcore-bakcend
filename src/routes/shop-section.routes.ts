import { Router } from "express";
import { shopSectionController } from "../controllers/shop-section.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { createShopSectionValidationSchema, deleteShopSectionValidationSchema, getShopSectionValidationSchema, listShopSectionsValidationSchema, updateShopSectionValidationSchema, } from "../validations/shop-section.validation.js";

const shopSectionRouter = Router();

shopSectionRouter.get("/active", shopSectionController.listActive);
shopSectionRouter.use(authenticate, requirePermission("layout"));
shopSectionRouter.get(
  "/",
  validateRequest(listShopSectionsValidationSchema),
  shopSectionController.list,
);
shopSectionRouter.get(
  "/:id",
  validateRequest(getShopSectionValidationSchema),
  shopSectionController.getOne,
);
shopSectionRouter.post(
  "/",
  validateRequest(createShopSectionValidationSchema),
  shopSectionController.create,
);
shopSectionRouter.put(
  "/:id",
  validateRequest(updateShopSectionValidationSchema),
  shopSectionController.update,
);
shopSectionRouter.delete(
  "/:id",
  validateRequest(deleteShopSectionValidationSchema),
  shopSectionController.remove,
);

export { shopSectionRouter };
export default shopSectionRouter;
