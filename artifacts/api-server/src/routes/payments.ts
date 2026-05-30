import { Router, type IRouter } from "express";
import crypto from "crypto";

const router: IRouter = Router();

function getRazorpay() {
  const keyId = process.env["RAZORPAY_KEY_ID"];
  const keySecret = process.env["RAZORPAY_KEY_SECRET"];
  return { keyId, keySecret, configured: !!(keyId && keySecret) };
}

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
