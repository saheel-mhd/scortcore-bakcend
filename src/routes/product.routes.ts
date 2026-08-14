import { Router } from "express";
import { Role } from "@prisma/client";
import { productController } from "../controllers/product.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { createProductValidationSchema, deleteProductValidationSchema, getProductValidationSchema, listProductsValidationSchema, updateProductValidationSchema, } from "../validations/product.validation.js";

const productRouter = Router();

productRouter.get("/", validateRequest(listProductsValidationSchema), productController.listProducts);
productRouter.get("/:id", validateRequest(getProductValidationSchema), productController.getProduct);
productRouter.post(
  "/",
  authenticate,
  requirePermission("products"),
  validateRequest(createProductValidationSchema),
  productController.createProduct,
);
productRouter.put(
  "/:id",
  authenticate,
  requirePermission("products"),
  validateRequest(updateProductValidationSchema),
  productController.updateProduct,
);
productRouter.delete(
  "/:id",
  authenticate,
  requirePermission("products"),
  authorize(Role.admin),
  validateRequest(deleteProductValidationSchema),
  productController.deleteProduct,
);

export { productRouter };
export default productRouter;
