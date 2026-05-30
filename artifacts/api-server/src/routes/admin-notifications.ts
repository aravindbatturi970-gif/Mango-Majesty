import { Router, type IRouter } from "express";
import { lt, eq, inArray } from "drizzle-orm";
import { db, productsTable, ordersTable } from "@workspace/db";
import { requireAdmin } from "../lib/admin-auth";

const router: IRouter = Router();

router.get("/admin/notifications", requireAdmin, async (_req, res) => {
  const [lowStock, pendingOrders] = await Promise.all([
    db
      .select({
        id: productsTable.id,
        name: productsTable.name,
        stock: productsTable.stock,
        imageUrl: productsTable.imageUrl,
      })
      .from(productsTable)
      .where(lt(productsTable.stock, 20)),
    db
      .select({
        id: ordersTable.id,
        orderNumber: ordersTable.orderNumber,
        customerName: ordersTable.customerName,
        total: ordersTable.total,
        createdAt: ordersTable.createdAt,
      })
      .from(ordersTable)
      .where(inArray(ordersTable.status, ["confirmed", "pending"]))
      .orderBy(ordersTable.createdAt),
  ]);

  const items = [
    ...pendingOrders.map((o) => ({
      id: `order-${o.id}`,
      type: "order" as const,
      title: `New order ${o.orderNumber}`,
      body: `${o.customerName} — ₹${Number(o.total).toLocaleString("en-IN")}`,
      href: "/admin/orders",
      createdAt: o.createdAt,
    })),
    ...lowStock.map((p) => ({
      id: `stock-${p.id}`,
      type: "stock" as const,
      title: `Low stock: ${p.name}`,
      body: `Only ${p.stock} units remaining`,
      href: "/admin/products",
      imageUrl: p.imageUrl,
      createdAt: new Date().toISOString(),
    })),
  ];

  res.json({
    items,
    unread: items.length,
  });
});

export default router;
