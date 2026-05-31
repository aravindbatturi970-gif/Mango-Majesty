import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, ordersTable, orderItemsTable, couponsTable } from "@workspace/db";
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
    discountAmount: order.discountAmount ? Number(order.discountAmount) : 0,
    couponCode: order.couponCode ?? undefined,
    total: Number(order.total),
    status: order.status,
    estimatedDelivery: order.estimatedDelivery.toISOString(),
    createdAt: order.createdAt.toISOString(),
  };
}

router.get("/orders/by-phone", async (req, res): Promise<void> => {
  const phone = typeof req.query["phone"] === "string" ? req.query["phone"].replace(/\D/g, "") : "";
  if (!phone || phone.length < 10) {
    res.status(400).json({ error: "Invalid phone number" });
    return;
  }
  const orders = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.phone, phone))
    .orderBy(ordersTable.createdAt);

  const result = await Promise.all(
    orders.map(async (order) => {
      const items = await db
        .select()
        .from(orderItemsTable)
        .where(eq(orderItemsTable.orderId, order.id));
      return {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: Number(order.total),
        createdAt: order.createdAt.toISOString(),
        items: items.map((i) => ({ productName: i.productName, quantity: i.quantity })),
      };
    }),
  );

  res.json(result);
});

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

  const couponCode = (req.body as Record<string, unknown>)["couponCode"];
  let discountAmount = 0;
  let appliedCouponCode: string | null = null;

  if (couponCode && typeof couponCode === "string") {
    const code = couponCode.toUpperCase().trim();
    const [coupon] = await db
      .select()
      .from(couponsTable)
      .where(eq(couponsTable.code, code))
      .limit(1);

    if (
      coupon &&
      coupon.isActive &&
      (!coupon.expiresAt || coupon.expiresAt > new Date()) &&
      (coupon.usageLimit === null || coupon.usageCount < coupon.usageLimit) &&
      cart.total >= Number(coupon.minOrderValue)
    ) {
      const val = Number(coupon.discountValue);
      discountAmount =
        coupon.discountType === "percent"
          ? Math.round((cart.total * val) / 100)
          : Math.min(val, cart.total);
      appliedCouponCode = code;

      await db
        .update(couponsTable)
        .set({ usageCount: coupon.usageCount + 1 })
        .where(eq(couponsTable.code, code));
    }
  }

  const finalTotal = cart.total - discountAmount;
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
      couponCode: appliedCouponCode,
      discountAmount: discountAmount > 0 ? discountAmount.toFixed(2) : null,
      total: finalTotal.toFixed(2),
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

router.get("/orders/track/:orderNumber", async (req, res): Promise<void> => {
  const orderNumber = req.params["orderNumber"]?.toUpperCase().trim();
  if (!orderNumber) {
    res.status(400).json({ error: "Order number required" });
    return;
  }
  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.orderNumber, orderNumber))
    .limit(1);
  if (!order) {
    res.status(404).json({ error: "Order not found. Please check the order number and try again." });
    return;
  }
  const items = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, order.id));

  const maskEmail = (e: string) => {
    const [name, domain] = e.split("@");
    return `${name.slice(0, 2)}***@${domain}`;
  };
  const maskPhone = (p: string) =>
    p.slice(0, 2) + "******" + p.slice(-2);

  res.json({
    orderNumber: order.orderNumber,
    customerName: order.customerName.split(" ")[0] + " " + (order.customerName.split(" ")[1]?.[0] ?? "") + ".",
    email: maskEmail(order.email),
    phone: maskPhone(order.phone),
    city: order.city,
    state: order.state,
    status: order.status,
    paymentMethod: order.paymentMethod,
    subtotal: Number(order.subtotal),
    deliveryFee: Number(order.deliveryFee),
    total: Number(order.total),
    estimatedDelivery: order.estimatedDelivery.toISOString(),
    createdAt: order.createdAt.toISOString(),
    items: items.map((it) => ({
      productName: it.productName,
      productImageUrl: it.productImageUrl,
      quantity: it.quantity,
      unitPrice: Number(it.unitPrice),
      lineTotal: Number(it.lineTotal),
    })),
  });
});

export default router;
