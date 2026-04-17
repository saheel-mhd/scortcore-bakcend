import { Router } from "express";

import { addressController } from "../controllers/address.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import {
  addressIdValidationSchema,
  createAddressValidationSchema,
  updateAddressValidationSchema,
} from "../validations/address.validation.js";

const addressRouter = Router();

addressRouter.use(authenticate);

addressRouter.get("/", addressController.list);
addressRouter.post(
  "/",
  validateRequest(createAddressValidationSchema),
  addressController.create,
);
addressRouter.put(
  "/:id",
  validateRequest(updateAddressValidationSchema),
  addressController.update,
);
addressRouter.delete(
  "/:id",
  validateRequest(addressIdValidationSchema),
  addressController.remove,
);

export { addressRouter };
export default addressRouter;
