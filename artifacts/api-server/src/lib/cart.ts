import { and, eq, inArray } from "drizzle-orm";
import { db, cartItemsTable, productsTable } from "@workspace/db";

const FREE_DELIVERY_THRESHOLD = 999;
const DELIVERY_FEE = 49;

export type CartProductDto = {
  id: string;
  slug: string;
  name: string;
  variety: string;
  tagline: string;
  description: string;
  price: number;
  unit: string;
  imageUrl: string;
  gallery: string[];
  origin: string;
  sweetness: number;
  rating: number;
  reviewCount: number;
  stock: number;
  deliveryEtaHours: number;
  badge: string | null;
  categorySlug: string;
  isBestSeller: boolean;
  isOrganic: boolean;
};

export type CartDto = {
  sessionId: string;
  items: Array<{
    id: string;
    productId: string;
    product: CartProductDto;
    quantity: number;
    lineTotal: number;
  }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
};

function productToDto(p: typeof productsTable.$inferSelect): CartProductDto {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    variety: p.variety,
    tagline: p.tagline,
    description: p.description,
    price: Number(p.price),
    unit: p.unit,
    imageUrl: p.imageUrl,
    gallery: p.gallery,
    origin: p.origin,
    sweetness: p.sweetness,
    rating: Number(p.rating),
    reviewCount: p.reviewCount,
    stock: p.stock,
    deliveryEtaHours: p.deliveryEtaHours,
    badge: p.badge,
    categorySlug: p.categorySlug,
    isBestSeller: p.isBestSeller,
    isOrganic: p.isOrganic,
  };
}

export async function buildCart(sessionId: string): Promise<CartDto> {
  const items = await db
    .select()
    .from(cartItemsTable)
    .where(eq(cartItemsTable.sessionId, sessionId));

  if (items.length === 0) {
    return {
      sessionId,
      items: [],
      subtotal: 0,
      deliveryFee: 0,
      total: 0,
      itemCount: 0,
    };
  }

  const productIds = items.map((i) => i.productId);
  const products = await db
    .select()
    .from(productsTable)
    .where(inArray(productsTable.id, productIds));

  const productMap = new Map(products.map((p) => [p.id, p]));

  const enriched = items
    .map((item) => {
      const product = productMap.get(item.productId);
      if (!product) return null;
      const dto = productToDto(product);
      const lineTotal = Math.round(dto.price * item.quantity * 100) / 100;
      return {
        id: item.id,
        productId: item.productId,
        product: dto,
        quantity: item.quantity,
        lineTotal,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const subtotal =
    Math.round(enriched.reduce((sum, i) => sum + i.lineTotal, 0) * 100) / 100;
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = Math.round((subtotal + deliveryFee) * 100) / 100;
  const itemCount = enriched.reduce((sum, i) => sum + i.quantity, 0);

  return {
    sessionId,
    items: enriched,
    subtotal,
    deliveryFee,
    total,
    itemCount,
  };
}

export async function clearCart(sessionId: string): Promise<void> {
  await db.delete(cartItemsTable).where(eq(cartItemsTable.sessionId, sessionId));
}

export async function findCartItem(
  sessionId: string,
  productId: string,
) {
  const [row] = await db
    .select()
    .from(cartItemsTable)
    .where(
      and(
        eq(cartItemsTable.sessionId, sessionId),
        eq(cartItemsTable.productId, productId),
      ),
    );
  return row;
}

export const cartConstants = {
  FREE_DELIVERY_THRESHOLD,
  DELIVERY_FEE,
};
