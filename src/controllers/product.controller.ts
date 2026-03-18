import type { Request, RequestHandler } from "express";

import { productService } from "../services/product.service.js";
import { sendSuccessResponse } from "../utils/api-response.js";
import type {
  CreateProductInput,
  ListProductsQuery,
  ProductIdParams,
  UpdateProductInput,
  UpdateProductStockInput,
} from "../validations/product.validation.js";

type CreateProductRequest = Request<Record<string, never>, unknown, CreateProductInput>;
type UpdateProductRequest = Request<ProductIdParams, unknown, UpdateProductInput>;
type GetProductRequest = Request<ProductIdParams>;
type ListProductsRequest = Request<Record<string, string>, unknown, unknown, ListProductsQuery>;
type UpdateProductStockRequest = Request<ProductIdParams, unknown, UpdateProductStockInput>;

const listProducts: RequestHandler = async (request, response, next) => {
  try {
    const result = await productService.listProducts((request as unknown as ListProductsRequest).query);

    sendSuccessResponse(response, 200, result, "Products retrieved successfully");
  } catch (error) {
    next(error);
  }
};

const getProduct: RequestHandler = async (request, response, next) => {
  try {
    const product = await productService.getProductById((request as GetProductRequest).params.id);

    sendSuccessResponse(response, 200, product, "Product retrieved successfully");
  } catch (error) {
    next(error);
  }
};

const createProduct: RequestHandler = async (request, response, next) => {
  try {
    const product = await productService.createProduct((request as CreateProductRequest).body);

    sendSuccessResponse(response, 201, product, "Product created successfully");
  } catch (error) {
    next(error);
  }
};

const updateProduct: RequestHandler = async (request, response, next) => {
  try {
    const typedRequest = request as UpdateProductRequest;
    const product = await productService.updateProduct(typedRequest.params.id, typedRequest.body);

    sendSuccessResponse(response, 200, product, "Product updated successfully");
  } catch (error) {
    next(error);
  }
};

const updateProductStock: RequestHandler = async (request, response, next) => {
  try {
    const typedRequest = request as UpdateProductStockRequest;
    const product = await productService.updateProductStock(typedRequest.params.id, typedRequest.body);

    sendSuccessResponse(response, 200, product, "Product stock updated successfully");
  } catch (error) {
    next(error);
  }
};

const deleteProduct: RequestHandler = async (request, response, next) => {
  try {
    const product = await productService.deleteProduct((request as GetProductRequest).params.id);

    sendSuccessResponse(response, 200, product, "Product deleted successfully");
  } catch (error) {
    next(error);
  }
};

export const productController = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  updateProductStock,
  deleteProduct,
};
