import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, productsTable } from "@workspace/db";
import { requireAdmin } from "../lib/admin-auth";

const router: IRouter = Router();
router.use(requireAdmin);

function toDto(p: typeof productsTable.$inferSelect) {
  return {
    ...p,
    price: Number(p.price),
    rating: Number(p.rating),
  };
}

router.get("/admin/products", async (_req, res) => {
  const rows = await db
    .select()
    .from(productsTable)
    .orderBy(desc(productsTable.popularity));
  res.json(rows.map(toDto));
});

router.get("/admin/products/:id", async (req, res) => {
  const id = req.params["id"];
  if (!id) {
    res.status(400).json({ error: "id required" });
    return;
  }
  const [row] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, id))
    .limit(1);
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(toDto(row));
});

function buildSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

router.post("/admin/products", async (req, res) => {
  const b = req.body ?? {};
  if (!b.name || !b.variety || !b.price) {
    res.status(400).json({ error: "name, variety, price required" });
    return;
  }
  const slug = b.slug || `${buildSlug(b.name)}-${Date.now().toString(36)}`;
  const [row] = await db
    .insert(productsTable)
    .values({
      slug,
      name: b.name,
      variety: b.variety,
      tagline: b.tagline ?? "",
      description: b.description ?? "",
      price: String(b.price),
      unit: b.unit ?? "per kg",
      imageUrl: b.imageUrl ?? "",
      gallery: Array.isArray(b.gallery) ? b.gallery : [],
      origin: b.origin ?? "",
      sweetness: Number(b.sweetness ?? 8),
      rating: String(b.rating ?? "4.8"),
      reviewCount: Number(b.reviewCount ?? 0),
      stock: Number(b.stock ?? 0),
      deliveryEtaHours: Number(b.deliveryEtaHours ?? 24),
      badge: b.badge ?? null,
      categorySlug: b.categorySlug ?? "alphonso",
      isBestSeller: Boolean(b.isBestSeller),
      isOrganic: Boolean(b.isOrganic),
      popularity: Number(b.popularity ?? 0),
      tags: Array.isArray(b.tags) ? b.tags : [],
      isActive: b.isActive !== false,
    })
    .returning();
  res.status(201).json(toDto(row!));
});

router.put("/admin/products/:id", async (req, res) => {
  const id = req.params["id"];
  if (!id) {
    res.status(400).json({ error: "id required" });
    return;
  }
  const b = req.body ?? {};
  const update: Record<string, unknown> = {};
  if (b.name !== undefined) update["name"] = b.name;
  if (b.variety !== undefined) update["variety"] = b.variety;
  if (b.tagline !== undefined) update["tagline"] = b.tagline;
  if (b.description !== undefined) update["description"] = b.description;
  if (b.price !== undefined) update["price"] = String(b.price);
  if (b.unit !== undefined) update["unit"] = b.unit;
  if (b.imageUrl !== undefined) update["imageUrl"] = b.imageUrl;
  if (b.gallery !== undefined) update["gallery"] = b.gallery;
  if (b.origin !== undefined) update["origin"] = b.origin;
  if (b.sweetness !== undefined) update["sweetness"] = Number(b.sweetness);
  if (b.stock !== undefined) update["stock"] = Number(b.stock);
  if (b.badge !== undefined) update["badge"] = b.badge;
  if (b.categorySlug !== undefined) update["categorySlug"] = b.categorySlug;
  if (b.isBestSeller !== undefined) update["isBestSeller"] = Boolean(b.isBestSeller);
  if (b.isOrganic !== undefined) update["isOrganic"] = Boolean(b.isOrganic);
  if (b.tags !== undefined) update["tags"] = b.tags;
  if (b.isActive !== undefined) update["isActive"] = Boolean(b.isActive);

  const [row] = await db
    .update(productsTable)
    .set(update)
    .where(eq(productsTable.id, id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(toDto(row));
});

router.delete("/admin/products/:id", async (req, res) => {
  const id = req.params["id"];
  if (!id) {
    res.status(400).json({ error: "id required" });
    return;
  }
  await db.delete(productsTable).where(eq(productsTable.id, id));
  res.json({ ok: true });
});

export default router;
