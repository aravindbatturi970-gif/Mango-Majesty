import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, ordersTable, orderItemsTable } from "@workspace/db";
import {
  CreateOrderBody,
  GetOrderParams,
  GetOrderResponse,
} from "@workspace/api-zod";
import { buildCart, clearCart } from "../lib/cart";

const router: IRouter = Router();

function generateOrderNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `AAM-${ts}-${rand}`;
}

async function fetchOrderDto(orderId: string) {
  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, orderId));
  if (!order) return null;

  const items = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, orderId));

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    email: order.email,
    phone: order.phone,
    addressLine1: order.addressLine1,
    addressLine2: order.addressLine2 ?? undefined,
    city: order.city,
    state: order.state,
    pincode: order.pincode,
    paymentMethod: order.paymentMethod,
    items: items.map((it) => ({
      id: it.id,
      productId: it.productId,
      productName: it.productName,
      productImageUrl: it.productImageUrl,
      quantity: it.quantity,
      unitPrice: Number(it.unitPrice),
      lineTotal: Number(it.lineTotal),
    })),
    subtotal: Number(order.subtotal),
    deliveryFee: Number(order.deliveryFee),
    total: Number(order.total),
    status: order.status,
    estimatedDelivery: order.estimatedDelivery.toISOString(),
    createdAt: order.createdAt.toISOString(),
  };
}

router.post("/orders", async (req, res): Promise<void> => {
  const body = CreateOrderBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const cart = await buildCart(body.data.sessionId);
  if (cart.items.length === 0) {
    res.status(400).json({ error: "Cart is empty" });
    return;
  }

  const eta = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const [order] = await db
    .insert(ordersTable)
    .values({
      orderNumber: generateOrderNumber(),
      customerName: body.data.customerName,
      email: body.data.email,
      phone: body.data.phone,
      addressLine1: body.data.addressLine1,
      addressLine2: body.data.addressLine2 ?? null,
      city: body.data.city,
      state: body.data.state,
      pincode: body.data.pincode,
      paymentMethod: body.data.paymentMethod,
      subtotal: cart.subtotal.toFixed(2),
      deliveryFee: cart.deliveryFee.toFixed(2),
      total: cart.total.toFixed(2),
      status: "confirmed",
      estimatedDelivery: eta,
    })
    .returning();

  await db.insert(orderItemsTable).values(
    cart.items.map((it) => ({
      orderId: order.id,
      productId: it.productId,
      productName: it.product.name,
      productImageUrl: it.product.imageUrl,
      quantity: it.quantity,
      unitPrice: it.product.price.toFixed(2),
      lineTotal: it.lineTotal.toFixed(2),
    })),
  );

  await clearCart(body.data.sessionId);

  const dto = await fetchOrderDto(order.id);
  res.status(201).json(GetOrderResponse.parse(dto));
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const dto = await fetchOrderDto(params.data.id);
  if (!dto) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(GetOrderResponse.parse(dto));
});

export default router;
