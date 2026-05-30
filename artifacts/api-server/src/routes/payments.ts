import { Router, type IRouter } from "express";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { db, couponsTable } from "@workspace/db";

const router: IRouter = Router();

function getRazorpay() {
  const keyId = process.env["RAZORPAY_KEY_ID"];
  const keySecret = process.env["RAZORPAY_KEY_SECRET"];
  return { keyId, keySecret, configured: !!(keyId && keySecret) };
}

router.post("/coupons/validate", async (req, res): Promise<void> => {
  const code = String(req.body?.code ?? "").toUpperCase().trim();
  const orderAmount = Number(req.body?.orderAmount ?? 0);

  if (!code) {
    res.status(400).json({ error: "Coupon code is required" });
    return;
  }

  const [coupon] = await db
    .select()
    .from(couponsTable)
    .where(eq(couponsTable.code, code))
    .limit(1);

  if (!coupon || !coupon.isActive) {
    res.status(404).json({ error: "Invalid or expired coupon code" });
    return;
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    res.status(400).json({ error: "This coupon has expired" });
    return;
  }

  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    res.status(400).json({ error: "This coupon has reached its usage limit" });
    return;
  }

  const minOrder = Number(coupon.minOrderValue);
  if (orderAmount < minOrder) {
    res.status(400).json({
      error: `Minimum order of ₹${minOrder.toLocaleString("en-IN")} required for this coupon`,
    });
    return;
  }

  const discountValue = Number(coupon.discountValue);
  let discountAmount = 0;
  if (coupon.discountType === "percent") {
    discountAmount = Math.round((orderAmount * discountValue) / 100);
  } else {
    discountAmount = Math.min(discountValue, orderAmount);
  }

  res.json({
    code: coupon.code,
    description: coupon.description,
    discountType: coupon.discountType,
    discountValue,
    discountAmount,
    finalAmount: orderAmount - discountAmount,
  });
});

router.get("/payments/razorpay/config", (_req, res): void => {
  const { keyId, configured } = getRazorpay();
  res.json({ configured, keyId: configured ? keyId : null });
});

router.post("/payments/razorpay/create-order", async (req, res): Promise<void> => {
  const { keyId, keySecret, configured } = getRazorpay();
  if (!configured) {
    res.status(503).json({ error: "Online payment not configured yet." });
    return;
  }

  const { amount } = req.body as { amount: number };
  if (!amount || amount <= 0) {
    res.status(400).json({ error: "Invalid amount" });
    return;
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const resp = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    res.status(502).json({ error: "Failed to create payment order", detail: err });
    return;
  }

  const order = await resp.json() as { id: string; amount: number; currency: string };
  res.json({ razorpayOrderId: order.id, amount: order.amount, currency: order.currency, keyId });
});

router.post("/payments/razorpay/verify", (req, res): void => {
  const { keySecret, configured } = getRazorpay();
  if (!configured) {
    res.status(503).json({ error: "Payment not configured." });
    return;
  }

  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body as {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  };

  const expectedSig = crypto
    .createHmac("sha256", keySecret!)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (expectedSig !== razorpaySignature) {
    res.status(400).json({ error: "Payment verification failed. Signature mismatch." });
    return;
  }

  res.json({ verified: true });
});

export default router;
