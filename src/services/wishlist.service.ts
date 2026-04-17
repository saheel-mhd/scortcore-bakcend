import type { Prisma } from "@prisma/client";

import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";

const wishlistProductSelect = {
  id: true,
  name: true,
  slug: true,
  sku: true,
  price: true,
  isActive: true,
  cardImage: true,
  mainImage: true,
  variants: {
    select: {
      id: true,
      stock: true,
      unit: {
        select: {
          id: true,
          name: true,
          shortName: true,
        },
      },
    },
  },
} satisfies Prisma.ProductSelect;

type WishlistProduct = Prisma.ProductGetPayload<{
  select: typeof wishlistProductSelect;
}>;

interface WishlistResult {
  productIds: string[];
  products: WishlistProduct[];
}

const getUserWishlist = async (userId: string): Promise<string[]> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { wishlistProductIds: true },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user.wishlistProductIds;
};

const populate = async (ids: string[]): Promise<WishlistProduct[]> => {
  if (ids.length === 0) return [];

  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    select: wishlistProductSelect,
  });

  const byId = new Map(products.map((product) => [product.id, product]));
  return ids
    .map((id) => byId.get(id))
    .filter((product): product is WishlistProduct => Boolean(product));
};

const listMine = async (userId: string): Promise<WishlistResult> => {
  const productIds = await getUserWishlist(userId);
  const products = await populate(productIds);
  return { productIds, products };
};

const add = async (userId: string, productId: string): Promise<WishlistResult> => {
  const productExists = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });

  if (!productExists) {
    throw new AppError("Product not found", 404);
  }

  const current = await getUserWishlist(userId);

  if (current.includes(productId)) {
    return listMine(userId);
  }

  await prisma.user.update({
    where: { id: userId },
    data: { wishlistProductIds: { push: productId } },
  });

  return listMine(userId);
};

const remove = async (userId: string, productId: string): Promise<WishlistResult> => {
  const current = await getUserWishlist(userId);
  const next = current.filter((id) => id !== productId);

  await prisma.user.update({
    where: { id: userId },
    data: { wishlistProductIds: { set: next } },
  });

  return listMine(userId);
};

export const wishlistService = {
  listMine,
  add,
  remove,
};
