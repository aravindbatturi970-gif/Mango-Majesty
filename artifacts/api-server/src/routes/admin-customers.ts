import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, ordersTable } from "@workspace/db";
import { requireAdmin } from "../lib/admin-auth";

const router: IRouter = Router();
router.use(requireAdmin);

router.get("/admin/customers", async (_req, res) => {
  const orders = await db
    .select()
    .from(ordersTable)
    .orderBy(desc(ordersTable.createdAt));
  const map = new Map<
    string,
    {
      email: string;
      name: string;
      phone: string;
      city: string;
      state: string;
      orderCount: number;
      totalSpent: number;
      lastOrderAt: string;
      lastOrderId: string;
    }
  >();
  for (const o of orders) {
    const key = o.email.toLowerCase();
    const existing = map.get(key);
    if (existing) {
      existing.orderCount += 1;
      existing.totalSpent += Number(o.total);
    } else {
      map.set(key, {
        email: o.email,
        name: o.customerName,
        phone: o.phone,
        city: o.city,
        state: o.state,
        orderCount: 1,
        totalSpent: Number(o.total),
        lastOrderAt: o.createdAt.toISOString(),
        lastOrderId: o.id,
      });
    }
  }
  res.json(Array.from(map.values()));
});

router.get("/admin/customers/:email/orders", async (req, res) => {
  const email = req.params["email"];
  if (!email) {
    res.status(400).json({ error: "email required" });
    return;
  }
  const rows = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.email, email))
    .orderBy(desc(ordersTable.createdAt));
  res.json(
    rows.map((o) => ({
      ...o,
      subtotal: Number(o.subtotal),
      deliveryFee: Number(o.deliveryFee),
      total: Number(o.total),
    })),
  );
});

export default router;
