import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, ordersTable, orderItemsTable } from "@workspace/db";
import { requireAdmin } from "../lib/admin-auth";

const router: IRouter = Router();
router.use(requireAdmin);

function toOrderDto(o: typeof ordersTable.$inferSelect) {
  return {
    ...o,
    subtotal: Number(o.subtotal),
    deliveryFee: Number(o.deliveryFee),
    total: Number(o.total),
  };
}
function toItemDto(i: typeof orderItemsTable.$inferSelect) {
  return {
    ...i,
    unitPrice: Number(i.unitPrice),
    lineTotal: Number(i.lineTotal),
  };
}

router.get("/admin/orders", async (_req, res) => {
  const rows = await db
    .select()
    .from(ordersTable)
    .orderBy(desc(ordersTable.createdAt));
  res.json(rows.map(toOrderDto));
});

router.get("/admin/orders/:id", async (req, res) => {
  const id = req.params["id"];
  if (!id) {
    res.status(400).json({ error: "id required" });
    return;
  }
  const [row] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, id))
    .limit(1);
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const items = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, id));
  res.json({ ...toOrderDto(row), items: items.map(toItemDto) });
});

const VALID_STATUSES = ["confirmed", "packed", "shipped", "delivered", "cancelled"];

router.patch("/admin/orders/:id", async (req, res) => {
  const id = req.params["id"];
  if (!id) {
    res.status(400).json({ error: "id required" });
    return;
  }
  const { status } = req.body ?? {};
  if (typeof status !== "string" || !VALID_STATUSES.includes(status)) {
    res.status(400).json({ error: `status must be one of ${VALID_STATUSES.join(", ")}` });
    return;
  }
  const [row] = await db
    .update(ordersTable)
    .set({ status })
    .where(eq(ordersTable.id, id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(toOrderDto(row));
});

export default router;
