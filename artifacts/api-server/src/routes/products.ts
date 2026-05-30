import { Router, type IRouter } from "express";
import { and, desc, eq, ilike, ne, or } from "drizzle-orm";
import { db, productsTable } from "@workspace/db";
import {
  GetProductParams,
  GetProductRecommendationsParams,
  GetProductResponse,
  ListBestSellersResponse,
  ListProductsQueryParams,
  ListProductsResponse,
  GetProductRecommendationsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function toProductDto(row: typeof productsTable.$inferSelect) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    variety: row.variety,
    tagline: row.tagline,
    description: row.description,
    price: Number(row.price),
    unit: row.unit,
    imageUrl: row.imageUrl,
    gallery: row.gallery,
    origin: row.origin,
    sweetness: row.sweetness,
    rating: Number(row.rating),
    reviewCount: row.reviewCount,
    stock: row.stock,
    deliveryEtaHours: row.deliveryEtaHours,
    badge: row.badge,
    categorySlug: row.categorySlug,
    isBestSeller: row.isBestSeller,
    isOrganic: row.isOrganic,
  };
}

router.get("/products", async (req, res): Promise<void> => {
  const params = ListProductsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const filters = [eq(productsTable.isActive, true)];
  if (params.data.category) {
    filters.push(eq(productsTable.categorySlug, params.data.category));
  }
  if (params.data.search) {
    const term = `%${params.data.search}%`;
    filters.push(
      or(
        ilike(productsTable.name, term),
        ilike(productsTable.variety, term),
        ilike(productsTable.tagline, term),
        ilike(productsTable.description, term),
      )!,
    );
  }

  const rows = await db
    .select()
    .from(productsTable)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(productsTable.popularity));

  res.json(ListProductsResponse.parse(rows.map(toProductDto)));
});

router.get("/products/best-sellers", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(productsTable)
    .where(and(eq(productsTable.isBestSeller, true), eq(productsTable.isActive, true)))
    .orderBy(desc(productsTable.popularity))
    .limit(8);

  res.json(ListBestSellersResponse.parse(rows.map(toProductDto)));
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const params = GetProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, params.data.id));

  if (!row) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(GetProductResponse.parse(toProductDto(row)));
});

router.get("/products/:id/recommendations", async (req, res): Promise<void> => {
  const params = GetProductRecommendationsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [base] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, params.data.id));

  if (!base) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const sameCat = await db
    .select()
    .from(productsTable)
    .where(
      and(
        eq(productsTable.categorySlug, base.categorySlug),
        ne(productsTable.id, base.id),
      ),
    )
    .orderBy(desc(productsTable.popularity))
    .limit(4);

  let recs = sameCat;
  if (recs.length < 4) {
    const fillers = await db
      .select()
      .from(productsTable)
      .where(ne(productsTable.id, base.id))
      .orderBy(desc(productsTable.popularity))
      .limit(8);
    const seen = new Set(recs.map((r) => r.id));
    for (const f of fillers) {
      if (recs.length >= 4) break;
      if (!seen.has(f.id)) {
        recs.push(f);
        seen.add(f.id);
      }
    }
  }

  res.json(GetProductRecommendationsResponse.parse(recs.map(toProductDto)));
});

export default router;
