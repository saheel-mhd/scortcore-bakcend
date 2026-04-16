import { OrderStatus, Role } from "@prisma/client";

import { prisma } from "../config/prisma.js";

const LOW_STOCK_THRESHOLD = 5;
const RECENT_ORDER_LIMIT = 25;
const LOW_STOCK_LIMIT = 25;
const REVENUE_ORDER_STATUSES = [OrderStatus.paid, OrderStatus.shipped, OrderStatus.delivered];

interface RecentOrderSummary {
  id: string;
  orderNumber: string;
  customerEmail: string | null;
  totalAmount: number;
  status: OrderStatus;
  itemCount: number;
  createdAt: Date;
}

interface LowStockVariantSummary {
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  sku: string;
  stock: number;
  sizeName: string;
  sizeShortName: string;
}

interface DashboardSummary {
  metrics: {
    totalProducts: number;
    activeProducts: number;
    totalOrders: number;
    pendingOrders: number;
    totalCustomers: number;
    revenueTotal: number;
    revenue30d: number;
    lowStockCount: number;
  };
  recentOrders: RecentOrderSummary[];
  lowStock: LowStockVariantSummary[];
}

const sumAmount = async (since?: Date): Promise<number> => {
  const aggregate = await prisma.order.aggregate({
    _sum: { totalAmount: true },
    where: {
      status: { in: REVENUE_ORDER_STATUSES },
      ...(since ? { createdAt: { gte: since } } : {}),
    },
  });

  return Number(aggregate._sum.totalAmount ?? 0);
};

const getDashboard = async (): Promise<DashboardSummary> => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalProducts,
    activeProducts,
    totalOrders,
    pendingOrders,
    totalCustomers,
    revenueTotal,
    revenue30d,
    lowStockCount,
    recentOrdersRaw,
    lowStockRaw,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: OrderStatus.pending } }),
    prisma.user.count({ where: { role: Role.customer } }),
    sumAmount(),
    sumAmount(thirtyDaysAgo),
    prisma.productVariant.count({
      where: {
        stock: { lte: LOW_STOCK_THRESHOLD },
        product: { isActive: true },
      },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: RECENT_ORDER_LIMIT,
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        status: true,
        items: true,
        createdAt: true,
        customer: {
          select: { email: true },
        },
      },
    }),
    prisma.productVariant.findMany({
      where: {
        stock: { lte: LOW_STOCK_THRESHOLD },
        product: { isActive: true },
      },
      orderBy: [{ stock: "asc" }, { updatedAt: "desc" }],
      take: LOW_STOCK_LIMIT,
      select: {
        id: true,
        stock: true,
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            sku: true,
          },
        },
        unit: {
          select: {
            name: true,
            shortName: true,
          },
        },
      },
    }),
  ]);

  const recentOrders: RecentOrderSummary[] = recentOrdersRaw.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    customerEmail: order.customer?.email ?? null,
    totalAmount: order.totalAmount,
    status: order.status,
    itemCount: Array.isArray(order.items) ? order.items.length : 0,
    createdAt: order.createdAt,
  }));

  const lowStock: LowStockVariantSummary[] = lowStockRaw.map((variant) => ({
    variantId: variant.id,
    productId: variant.product.id,
    productName: variant.product.name,
    productSlug: variant.product.slug,
    sku: variant.product.sku,
    stock: variant.stock,
    sizeName: variant.unit.name,
    sizeShortName: variant.unit.shortName,
  }));

  return {
    metrics: {
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      totalCustomers,
      revenueTotal: Number(revenueTotal.toFixed(2)),
      revenue30d: Number(revenue30d.toFixed(2)),
      lowStockCount,
    },
    recentOrders,
    lowStock,
  };
};

export const adminDashboardService = {
  getDashboard,
};
