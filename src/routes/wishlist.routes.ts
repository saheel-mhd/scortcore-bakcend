import { Router } from "express";

import { wishlistController } from "../controllers/wishlist.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { wishlistProductParamsValidationSchema } from "../validations/wishlist.validation.js";

const wishlistRouter = Router();

wishlistRouter.use(authenticate);

wishlistRouter.get("/", wishlistController.list);
wishlistRouter.post(
  "/:productId",
  validateRequest(wishlistProductParamsValidationSchema),
  wishlistController.add,
);
wishlistRouter.delete(
  "/:productId",
  validateRequest(wishlistProductParamsValidationSchema),
  wishlistController.remove,
);

export { wishlistRouter };
export default wishlistRouter;
