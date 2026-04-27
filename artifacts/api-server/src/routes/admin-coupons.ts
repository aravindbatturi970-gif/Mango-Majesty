import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, couponsTable } from "@workspace/db";
import { requireAdmin } from "../lib/admin-auth";

const router: IRouter = Router();
router.use(requireAdmin);

function toDto(c: typeof couponsTable.$inferSelect) {
  return {
    ...c,
    discountValue: Number(c.discountValue),
    minOrderValue: Number(c.minOrderValue),
  };
}

router.get("/admin/coupons", async (_req, res) => {
  const rows = await db
    .select()
    .from(couponsTable)
    .orderBy(desc(couponsTable.createdAt));
  res.json(rows.map(toDto));
});

router.post("/admin/coupons", async (req, res) => {
  const b = req.body ?? {};
  if (!b.code || !b.discountType || b.discountValue == null) {
    res.status(400).json({ error: "code, discountType, discountValue required" });
    return;
  }
  if (!["percent", "fixed"].includes(b.discountType)) {
    res.status(400).json({ error: "discountType must be percent or fixed" });
    return;
  }
  try {
    const [row] = await db
      .insert(couponsTable)
      .values({
        code: String(b.code).toUpperCase().trim(),
        description: b.description ?? "",
        discountType: b.discountType,
        discountValue: String(b.discountValue),
        minOrderValue: String(b.minOrderValue ?? 0),
        usageLimit: b.usageLimit != null ? Number(b.usageLimit) : null,
        expiresAt: b.expiresAt ? new Date(b.expiresAt) : null,
        isActive: b.isActive !== false,
      })
      .returning();
    res.status(201).json(toDto(row!));
  } catch (err) {
    res.status(400).json({ error: "Code must be unique" });
  }
});

router.patch("/admin/coupons/:id", async (req, res) => {
  const id = req.params["id"];
  if (!id) {
    res.status(400).json({ error: "id required" });
    return;
  }
  const b = req.body ?? {};
  const update: Record<string, unknown> = {};
  if (b.description !== undefined) update["description"] = b.description;
  if (b.discountType !== undefined) update["discountType"] = b.discountType;
  if (b.discountValue !== undefined) update["discountValue"] = String(b.discountValue);
  if (b.minOrderValue !== undefined) update["minOrderValue"] = String(b.minOrderValue);
  if (b.usageLimit !== undefined)
    update["usageLimit"] = b.usageLimit == null ? null : Number(b.usageLimit);
  if (b.expiresAt !== undefined)
    update["expiresAt"] = b.expiresAt ? new Date(b.expiresAt) : null;
  if (b.isActive !== undefined) update["isActive"] = Boolean(b.isActive);

  const [row] = await db
    .update(couponsTable)
    .set(update)
    .where(eq(couponsTable.id, id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(toDto(row));
});

router.delete("/admin/coupons/:id", async (req, res) => {
  const id = req.params["id"];
  if (!id) {
    res.status(400).json({ error: "id required" });
    return;
  }
  await db.delete(couponsTable).where(eq(couponsTable.id, id));
  res.json({ ok: true });
});

export default router;
