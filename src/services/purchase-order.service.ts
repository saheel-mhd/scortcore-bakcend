import { InventoryMovementType, PurchaseOrderStatus, type Prisma } from "@prisma/client";

import { inventoryModel } from "../models/inventory.model.js";
import { purchaseOrderModel } from "../models/purchase-order.model.js";
import { productModel } from "../models/product.model.js";
import { AppError } from "../utils/app-error.js";
import type {
  CreatePurchaseOrderInput,
  ListPurchaseOrdersQuery,
  ReceivePurchaseOrderInput,
} from "../validations/purchase-order.validation.js";

interface ListPurchaseOrdersResult {
  purchaseOrders: Awaited<ReturnType<typeof purchaseOrderModel.listPurchaseOrders>>["purchaseOrders"];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const generatePurchaseNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomSegment = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `PO-${timestamp}-${randomSegment}`;
};

const createPurchaseOrder = async (input: CreatePurchaseOrderInput) => {
  const product = await productModel.findProductById(input.productId);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  const purchaseNumber = generatePurchaseNumber();
  const totalCost = Number((input.quantity * input.unitCost).toFixed(2));

  return purchaseOrderModel.createPurchaseOrder({
    purchaseNumber,
    supplierName: input.supplierName,
    supplierEmail: input.supplierEmail,
    supplierPhone: input.supplierPhone,
    productId: input.productId,
    quantity: input.quantity,
    unitCost: input.unitCost,
    totalCost,
    notes: input.notes,
    status: PurchaseOrderStatus.ordered,
  });
};

const getPurchaseOrderById = async (id: string) => {
  const purchaseOrder = await purchaseOrderModel.findPurchaseOrderById(id);

  if (!purchaseOrder) {
    throw new AppError("Purchase order not found", 404);
  }

  return purchaseOrder;
};

const listPurchaseOrders = async (
  query: ListPurchaseOrdersQuery,
): Promise<ListPurchaseOrdersResult> => {
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const result = await purchaseOrderModel.listPurchaseOrders({
    skip,
    take: limit,
    search: query.search,
    status: query.status,
    productId: query.productId,
    sortBy: query.sortBy as Prisma.PurchaseOrderScalarFieldEnum,
    sortOrder: query.sortOrder,
  });

  const totalPages = result.total === 0 ? 0 : Math.ceil(result.total / limit);

  return {
    purchaseOrders: result.purchaseOrders,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages,
    },
  };
};

const receivePurchaseOrder = async (
  id: string,
  input: ReceivePurchaseOrderInput,
) => {
  const purchaseOrder = await purchaseOrderModel.findPurchaseOrderById(id);

  if (!purchaseOrder) {
    throw new AppError("Purchase order not found", 404);
  }

  if (
    purchaseOrder.status === PurchaseOrderStatus.received ||
    purchaseOrder.status === PurchaseOrderStatus.cancelled
  ) {
    throw new AppError("This purchase order can no longer receive stock", 400);
  }

  const remainingQuantity = purchaseOrder.quantity - purchaseOrder.receivedQuantity;

  if (input.receivedQuantity > remainingQuantity) {
    throw new AppError("Received quantity exceeds remaining purchase order quantity", 400);
  }

  const product = await inventoryModel.findInventoryProductById(purchaseOrder.productId);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  const nextReceivedQuantity = purchaseOrder.receivedQuantity + input.receivedQuantity;
  const nextStatus =
    nextReceivedQuantity >= purchaseOrder.quantity
      ? PurchaseOrderStatus.received
      : PurchaseOrderStatus.partially_received;

  await inventoryModel.adjustInventoryStock({
    productId: purchaseOrder.productId,
    nextStock: product.stock + input.receivedQuantity,
    type: InventoryMovementType.purchase_order,
    reason:
      input.reason ??
      `Restock received from purchase order ${purchaseOrder.purchaseNumber}`,
    referenceType: "purchase_order",
    referenceId: purchaseOrder.id,
  });

  return purchaseOrderModel.updatePurchaseOrder(id, {
    receivedQuantity: nextReceivedQuantity,
    status: nextStatus,
    receivedAt: nextStatus === PurchaseOrderStatus.received ? new Date() : purchaseOrder.receivedAt,
  });
};

export const purchaseOrderService = {
  createPurchaseOrder,
  getPurchaseOrderById,
  listPurchaseOrders,
  receivePurchaseOrder,
};
