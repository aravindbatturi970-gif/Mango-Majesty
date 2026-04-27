import { Router, type IRouter } from "express";
import { desc, gte, sql } from "drizzle-orm";
import {
  db,
  ordersTable,
  orderItemsTable,
  productsTable,
} from "@workspace/db";
import { requireAdmin } from "../lib/admin-auth";

const router: IRouter = Router();
router.use(requireAdmin);

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

router.get("/admin/analytics/overview", async (_req, res) => {
  const now = new Date();
  const today = startOfDay(now);
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - 6);
  const monthStart = new Date(today);
  monthStart.setDate(monthStart.getDate() - 29);

  const allOrders = await db
    .select()
    .from(ordersTable)
    .orderBy(desc(ordersTable.createdAt));

  let salesToday = 0;
  let salesWeek = 0;
  let salesMonth = 0;
  let ordersToday = 0;
  let ordersWeek = 0;
  let ordersMonth = 0;
  for (const o of allOrders) {
    const t = Number(o.total);
    if (o.createdAt >= today) {
      salesToday += t;
      ordersToday += 1;
    }
    if (o.createdAt >= weekStart) {
      salesWeek += t;
      ordersWeek += 1;
    }
    if (o.createdAt >= monthStart) {
      salesMonth += t;
      ordersMonth += 1;
    }
  }

  const seriesMap = new Map<string, { date: string; revenue: number; orders: number }>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    seriesMap.set(key, { date: key, revenue: 0, orders: 0 });
  }
  for (const o of allOrders) {
    if (o.createdAt < monthStart) continue;
    const key = o.createdAt.toISOString().slice(0, 10);
    const e = seriesMap.get(key);
    if (e) {
      e.revenue += Number(o.total);
      e.orders += 1;
    }
  }
  const revenueSeries = Array.from(seriesMap.values());

  const topProductsRows = await db
    .select({
      productId: orderItemsTable.productId,
      productName: orderItemsTable.productName,
      productImageUrl: orderItemsTable.productImageUrl,
      qty: sql<number>`sum(${orderItemsTable.quantity})::int`,
      revenue: sql<string>`sum(${orderItemsTable.lineTotal})`,
    })
    .from(orderItemsTable)
    .groupBy(
      orderItemsTable.productId,
      orderItemsTable.productName,
      orderItemsTable.productImageUrl,
    )
    .orderBy(sql`sum(${orderItemsTable.quantity}) desc`)
    .limit(5);
  const topProducts = topProductsRows.map((r) => ({
    productId: r.productId,
    productName: r.productName,
    productImageUrl: r.productImageUrl,
    quantitySold: Number(r.qty),
    revenue: Number(r.revenue),
  }));

  const lowStock = await db
    .select()
    .from(productsTable)
    .where(sql`${productsTable.stock} < 20`)
    .orderBy(productsTable.stock);

  const recentOrders = allOrders.slice(0, 8).map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    total: Number(o.total),
    status: o.status,
    paymentMethod: o.paymentMethod,
    createdAt: o.createdAt.toISOString(),
  }));

  const paymentBreakdownMap = new Map<string, { method: string; count: number; total: number }>();
  for (const o of allOrders) {
    const m = o.paymentMethod;
    const e = paymentBreakdownMap.get(m) ?? { method: m, count: 0, total: 0 };
    e.count += 1;
    e.total += Number(o.total);
    paymentBreakdownMap.set(m, e);
  }
  const paymentBreakdown = Array.from(paymentBreakdownMap.values());

  res.json({
    salesToday,
    salesWeek,
    salesMonth,
    ordersToday,
    ordersWeek,
    ordersMonth,
    totalOrders: allOrders.length,
    averageOrderValue:
      allOrders.length > 0
        ? allOrders.reduce((s, o) => s + Number(o.total), 0) / allOrders.length
        : 0,
    revenueSeries,
    topProducts,
    lowStock: lowStock.map((p) => ({
      id: p.id,
      name: p.name,
      imageUrl: p.imageUrl,
      stock: p.stock,
      variety: p.variety,
    })),
    recentOrders,
    paymentBreakdown,
  });
});

export default router;
