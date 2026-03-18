import type { Prisma, PurchaseOrderStatus } from "@prisma/client";

import { prisma } from "../config/prisma.js";

const purchaseOrderProductSelect = {
  id: true,
  name: true,
  slug: true,
  sku: true,
  stock: true,
} satisfies Prisma.ProductSelect;

const publicPurchaseOrderSelect = {
  id: true,
  purchaseNumber: true,
  supplierName: true,
  supplierEmail: true,
  supplierPhone: true,
  productId: true,
  product: {
    select: purchaseOrderProductSelect,
  },
  quantity: true,
  receivedQuantity: true,
  unitCost: true,
  totalCost: true,
  status: true,
  notes: true,
  orderedAt: true,
  receivedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.PurchaseOrderSelect;

export type PurchaseOrderRecord = Prisma.PurchaseOrderGetPayload<{
  select: typeof publicPurchaseOrderSelect;
}>;

export interface CreatePurchaseOrderRecordData {
  purchaseNumber: string;
  supplierName: string;
  supplierEmail?: string;
  supplierPhone?: string;
  productId: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  notes?: string;
  status?: PurchaseOrderStatus;
}

export interface UpdatePurchaseOrderRecordData {
  receivedQuantity?: number;
  status?: PurchaseOrderStatus;
  receivedAt?: Date | null;
}

export interface ListPurchaseOrdersOptions {
  skip: number;
  take: number;
  search?: string;
  status?: PurchaseOrderStatus;
  productId?: string;
  sortBy: Prisma.PurchaseOrderScalarFieldEnum;
  sortOrder: Prisma.SortOrder;
}

const buildPurchaseOrderWhereInput = (
  options: Pick<ListPurchaseOrdersOptions, "search" | "status" | "productId">,
): Prisma.PurchaseOrderWhereInput => {
  const andConditions: Prisma.PurchaseOrderWhereInput[] = [];

  if (options.search) {
    andConditions.push({
      OR: [
        {
          purchaseNumber: {
            contains: options.search,
            mode: "insensitive",
          },
        },
        {
          supplierName: {
            contains: options.search,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (options.status) {
    andConditions.push({
      status: options.status,
    });
  }

  if (options.productId) {
    andConditions.push({
      productId: options.productId,
    });
  }

  if (andConditions.length === 0) {
    return {};
  }

  return {
    AND: andConditions,
  };
};

const findPurchaseOrderById = async (id: string): Promise<PurchaseOrderRecord | null> => {
  return prisma.purchaseOrder.findUnique({
    where: { id },
    select: publicPurchaseOrderSelect,
  });
};

const findPurchaseOrderByNumber = async (
  purchaseNumber: string,
): Promise<PurchaseOrderRecord | null> => {
  return prisma.purchaseOrder.findUnique({
    where: { purchaseNumber },
    select: publicPurchaseOrderSelect,
  });
};

const createPurchaseOrder = async (
  data: CreatePurchaseOrderRecordData,
): Promise<PurchaseOrderRecord> => {
  return prisma.purchaseOrder.create({
    data,
    select: publicPurchaseOrderSelect,
  });
};

const updatePurchaseOrder = async (
  id: string,
  data: UpdatePurchaseOrderRecordData,
): Promise<PurchaseOrderRecord> => {
  return prisma.purchaseOrder.update({
    where: { id },
    data,
    select: publicPurchaseOrderSelect,
  });
};

const listPurchaseOrders = async (options: ListPurchaseOrdersOptions) => {
  const where = buildPurchaseOrderWhereInput(options);

  const [purchaseOrders, total] = await prisma.$transaction([
    prisma.purchaseOrder.findMany({
      where,
      skip: options.skip,
      take: options.take,
      orderBy: {
        [options.sortBy]: options.sortOrder,
      },
      select: publicPurchaseOrderSelect,
    }),
    prisma.purchaseOrder.count({ where }),
  ]);

  return {
    purchaseOrders,
    total,
  };
};

export const purchaseOrderModel = {
  findPurchaseOrderById,
  findPurchaseOrderByNumber,
  createPurchaseOrder,
  updatePurchaseOrder,
  listPurchaseOrders,
};
