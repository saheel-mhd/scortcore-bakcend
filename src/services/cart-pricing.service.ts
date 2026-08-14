import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";

export interface CartItemInput {
  productVariantId: string;
  quantity: number;
}

export interface OrderItemSnapshot {
  productVariantId: string;
  productId: string;
  name: string;
  slug: string;
  sku: string;
  unitId: string;
  unitName: string;
  unitShortName: string;
  unitCategoryId: string;
  unitCategoryName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface PricedCart {
  aggregatedItems: CartItemInput[];
  orderItems: OrderItemSnapshot[];
  subtotalAmount: number;
}

const aggregateItems = (items: CartItemInput[]): CartItemInput[] => {
  return Array.from(
    items.reduce((map, item) => {
      const currentQuantity = map.get(item.productVariantId) ?? 0;
      map.set(item.productVariantId, currentQuantity + item.quantity);
      return map;
    }, new Map<string, number>()),
  ).map(([productVariantId, quantity]) => ({
    productVariantId,
    quantity,
  }));
};

export const priceCartItems = async (items: CartItemInput[]): Promise<PricedCart> => {
  const aggregatedItems = aggregateItems(items);
  const variantIds = aggregatedItems.map((item) => item.productVariantId);

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: {
      product: true,
      unit: { include: { category: true } },
    },
  });

  if (variants.length !== variantIds.length) {
    throw new AppError("One or more product variants were not found", 404);
  }

  const variantMap = new Map(variants.map((variant) => [variant.id, variant]));
  const orderItems: OrderItemSnapshot[] = aggregatedItems.map((item) => {
    const variant = variantMap.get(item.productVariantId);

    if (!variant) {
      throw new AppError("One or more product variants were not found", 404);
    }
    if (!variant.product.isActive) {
      throw new AppError(
        `Product ${variant.product.name} is inactive and cannot be ordered`,
        400,
      );
    }
    if (variant.stock < item.quantity) {
      throw new AppError(
        `Insufficient stock for ${variant.product.name} (${variant.unit.shortName})`,
        400,
      );
    }
    return {
      productVariantId: variant.id,
      productId: variant.product.id,
      name: variant.product.name,
      slug: variant.product.slug,
      sku: variant.product.sku,
      unitId: variant.unit.id,
      unitName: variant.unit.name,
      unitShortName: variant.unit.shortName,
      unitCategoryId: variant.unit.category.id,
      unitCategoryName: variant.unit.category.name,
      quantity: item.quantity,
      unitPrice: variant.product.price,
      lineTotal: Number((variant.product.price * item.quantity).toFixed(2)),
    };
  });

  const subtotalAmount = Number(
    orderItems.reduce((total, item) => total + item.lineTotal, 0).toFixed(2),
  );
  return { aggregatedItems, orderItems, subtotalAmount };
};
