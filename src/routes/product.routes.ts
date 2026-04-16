import { Router } from "express";

import { Role } from "@prisma/client";
import { productController } from "../controllers/product.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import {
  createProductValidationSchema,
  deleteProductValidationSchema,
  getProductValidationSchema,
  listProductsValidationSchema,
  updateProductValidationSchema,
} from "../validations/product.validation.js";

const productRouter = Router();

productRouter.get("/", validateRequest(listProductsValidationSchema), productController.listProducts);
productRouter.get("/:id", validateRequest(getProductValidationSchema), productController.getProduct);

productRouter.post(
  "/",
  authenticate,
  authorize(Role.admin, Role.staff),
  validateRequest(createProductValidationSchema),
  productController.createProduct,
);
productRouter.put(
  "/:id",
  authenticate,
  authorize(Role.admin, Role.staff),
  validateRequest(updateProductValidationSchema),
  productController.updateProduct,
);
productRouter.delete(
  "/:id",
  authenticate,
  authorize(Role.admin),
  validateRequest(deleteProductValidationSchema),
  productController.deleteProduct,
);

export { productRouter };
export default productRouter;
