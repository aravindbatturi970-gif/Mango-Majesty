import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { useCart } from "@/hooks/use-cart";
import { useCreateOrder, CreateOrderBody } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { getSessionId } from "@/lib/session";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ShieldCheck,
  Leaf,
  Truck,
  CreditCard,
  Wallet,
  Banknote,
  AlertCircle,
  Tag,
  X,
  CheckCircle2,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  addressLine1: z.string().min(5, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(6, "Valid pincode is required"),
  paymentMethod: z.enum(["upi", "card", "cod"]),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open(): void;
      on(event: string, handler: () => void): void;
    };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-sdk")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-sdk";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Checkout() {
  const { cart, isLoading } = useCart();
  const createOrder = useCreateOrder();
  const [, setLocation] = useLocation();
  const [razorpayConfig, setRazorpayConfig] = useState<{
    configured: boolean;
    keyId: string | null;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    description: string;
    discountAmount: number;
    finalAmount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState("");

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}api/payments/razorpay/config`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then(setRazorpayConfig)
      .catch(() => setRazorpayConfig({ configured: false, keyId: null }));
  }, []);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      email: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      paymentMethod: "upi",
    },
  });

  async function applyCoupon() {
    if (!couponInput.trim() || !cart) return;
    setCouponLoading(true);
    setCouponError("");
    setAppliedCoupon(null);
    try {
      const res = await fetch(
        `${import.meta.env.BASE_URL}api/coupons/validate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            code: couponInput.trim().toUpperCase(),
            orderAmount: cart.total,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error ?? "Invalid coupon code");
      } else {
        setAppliedCoupon(data);
        setCouponInput("");
      }
    } catch {
      setCouponError("Could not validate coupon. Try again.");
    } finally {
      setCouponLoading(false);
    }
  }

  const paymentMethod = form.watch("paymentMethod");
  const onlinePaymentUnavailable =
    (paymentMethod === "upi" || paymentMethod === "card") &&
    razorpayConfig !== null &&
    !razorpayConfig.configured;

  function placeOrderInDb(
    data: CheckoutFormValues,
    couponCode?: string,
  ) {
    const orderData: CreateOrderBody & { couponCode?: string } = {
      sessionId: getSessionId(),
      ...data,
      ...(couponCode ? { couponCode } : {}),
    };
    return new Promise<string>((resolve, reject) => {
      createOrder.mutate(
        { data: orderData as CreateOrderBody },
        {
          onSuccess: (order) => resolve(order.id),
          onError: (err) => reject(err),
        },
      );
    });
  }

  async function handleRazorpayPayment(data: CheckoutFormValues) {
    const loaded = await loadRazorpayScript();
    if (!loaded || !window.Razorpay) {
      toast.error("Could not load payment gateway. Please try again.");
      return;
    }

    setIsProcessing(true);
    try {
      const chargeAmount = appliedCoupon ? appliedCoupon.finalAmount : cart!.total;
      const createRes = await fetch(
        `${import.meta.env.BASE_URL}api/payments/razorpay/create-order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ amount: chargeAmount }),
        },
      );
      const rzpOrder = await createRes.json();
      if (!createRes.ok) {
        toast.error(rzpOrder.error ?? "Payment setup failed.");
        return;
      }

      await new Promise<void>((resolve, reject) => {
        const options: Record<string, unknown> = {
          key: rzpOrder.keyId,
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
          name: "Aamras",
          description: "Premium Mango Order",
          image: `${import.meta.env.BASE_URL}favicon.ico`,
          order_id: rzpOrder.razorpayOrderId,
          prefill: {
            name: data.customerName,
            email: data.email,
            contact: data.phone,
          },
          theme: { color: "#d97706" },
          method: data.paymentMethod === "card" ? { upi: false } : undefined,
          handler: async (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) => {
            try {
              const verifyRes = await fetch(
                `${import.meta.env.BASE_URL}api/payments/razorpay/verify`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  credentials: "include",
                  body: JSON.stringify({
                    razorpayOrderId: response.razorpay_order_id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpaySignature: response.razorpay_signature,
                  }),
                },
              );
              const verifyData = await verifyRes.json();
              if (!verifyRes.ok || !verifyData.verified) {
                toast.error("Payment verification failed. Please contact support.");
                reject(new Error("verification failed"));
                return;
              }
              const orderId = await placeOrderInDb(data, appliedCoupon?.code);
              resolve();
              setLocation(`/order/${orderId}`);
            } catch {
              reject(new Error("order creation failed"));
            }
          },
          modal: {
            ondismiss: () => reject(new Error("dismissed")),
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.message !== "dismissed") {
        toast.error("Payment failed. Please try again or use Cash on Delivery.");
      }
    } finally {
      setIsProcessing(false);
    }
  }

  const onSubmit = async (data: CheckoutFormValues) => {
    if (!cart || cart.items.length === 0) return;

    if (data.paymentMethod === "cod") {
      const orderData: CreateOrderBody & { couponCode?: string } = {
        sessionId: getSessionId(),
        ...data,
        ...(appliedCoupon ? { couponCode: appliedCoupon.code } : {}),
      };
      createOrder.mutate(
        { data: orderData as CreateOrderBody },
        { onSuccess: (order) => setLocation(`/order/${order.id}`) },
      );
      return;
    }

    if (!razorpayConfig?.configured) {
      toast.error("Online payments not set up yet. Please use Cash on Delivery.");
      return;
    }

    await handleRazorpayPayment(data);
  };

  if (isLoading) return <Layout><div className="container p-8">Loading...</div></Layout>;

  if (!cart || cart.items.length === 0) {
    setLocation("/cart");
    return null;
  }

  const busy = createOrder.isPending || isProcessing;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-8 text-foreground">
          Checkout
        </h1>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-3 space-y-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
                id="checkout-form"
              >
                {/* Contact Info */}
                <div className="bg-card p-6 rounded-3xl border border-border shadow-sm">
                  <h2 className="text-xl font-bold font-serif mb-4">
                    Contact Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Raj Patel" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+91 99999 99999" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="raj@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-card p-6 rounded-3xl border border-border shadow-sm">
                  <h2 className="text-xl font-bold font-serif mb-4">
                    Delivery Address
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="addressLine1"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Address Line 1</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="House/Flat No., Building Name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="addressLine2"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Landmark / Area (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Near Metro Station"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="Mumbai" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="Maharashtra" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="pincode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pincode</FormLabel>
                          <FormControl>
                            <Input placeholder="400001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-card p-6 rounded-3xl border border-border shadow-sm">
                  <h2 className="text-xl font-bold font-serif mb-4">
                    Payment Method
                  </h2>
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col gap-3"
                          >
                            <label
                              className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${field.value === "upi" ? "border-primary bg-primary/5" : "border-border hover:bg-muted"}`}
                            >
                              <RadioGroupItem value="upi" id="payment-upi" />
                              <Wallet
                                className={`w-5 h-5 shrink-0 ${field.value === "upi" ? "text-primary" : "text-muted-foreground"}`}
                              />
                              <div className="flex-1">
                                <div className="font-medium">
                                  UPI (GPay, PhonePe, Paytm)
                                </div>
                                {field.value === "upi" && !razorpayConfig?.configured && (
                                  <div className="text-xs text-muted-foreground mt-0.5">
                                    Pay instantly via any UPI app
                                  </div>
                                )}
                              </div>
                            </label>

                            <label
                              className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${field.value === "card" ? "border-primary bg-primary/5" : "border-border hover:bg-muted"}`}
                            >
                              <RadioGroupItem value="card" id="payment-card" />
                              <CreditCard
                                className={`w-5 h-5 shrink-0 ${field.value === "card" ? "text-primary" : "text-muted-foreground"}`}
                              />
                              <div className="flex-1 font-medium">
                                Credit / Debit Card
                              </div>
                            </label>

                            <label
                              className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${field.value === "cod" ? "border-primary bg-primary/5" : "border-border hover:bg-muted"}`}
                            >
                              <RadioGroupItem value="cod" id="payment-cod" />
                              <Banknote
                                className={`w-5 h-5 shrink-0 ${field.value === "cod" ? "text-primary" : "text-muted-foreground"}`}
                              />
                              <div className="flex-1">
                                <div className="font-medium">
                                  Cash on Delivery
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Pay when your order arrives
                                </div>
                              </div>
                            </label>
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* COD note */}
                  {paymentMethod === "cod" && (
                    <div className="mt-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 px-4 py-3 text-amber-800 dark:text-amber-400 text-xs font-medium">
                      Please keep exact change ready for the delivery partner.
                    </div>
                  )}

                  {/* Online payment not configured notice */}
                  {onlinePaymentUnavailable && (
                    <div className="mt-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 px-4 py-3 text-blue-800 dark:text-blue-400 text-sm flex gap-2.5">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold mb-0.5">
                          Online payment coming soon
                        </div>
                        <div className="text-xs opacity-80">
                          UPI and card payments will be available shortly. For
                          now, please select{" "}
                          <button
                            type="button"
                            className="underline font-semibold"
                            onClick={() => form.setValue("paymentMethod", "cod")}
                          >
                            Cash on Delivery
                          </button>
                          .
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </Form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-2 space-y-6 lg:sticky lg:top-24">
            <div className="bg-card p-6 rounded-3xl border border-border shadow-sm">
              <h3 className="text-xl font-serif font-bold mb-4">
                Order Summary
              </h3>

              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto pr-2 no-scrollbar">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-3 text-sm">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <img
                        src={item.product.imageUrl}
                        alt=""
                        className="w-8 h-8 object-contain mix-blend-multiply"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium line-clamp-1">
                        {item.product.name}
                      </div>
                      <div className="text-muted-foreground">
                        Qty: {item.quantity}
                      </div>
                    </div>
                    <div className="font-bold">₹{item.lineTotal}</div>
                  </div>
                ))}
              </div>

              {/* Coupon input */}
              <div className="mb-4">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 px-3 py-2.5">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <div>
                        <div className="text-xs font-bold">{appliedCoupon.code} applied</div>
                        <div className="text-xs opacity-80">{appliedCoupon.description}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAppliedCoupon(null)}
                      className="text-green-600 hover:text-green-800 dark:text-green-400 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input
                          value={couponInput}
                          onChange={(e) => {
                            setCouponInput(e.target.value.toUpperCase());
                            setCouponError("");
                          }}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyCoupon())}
                          placeholder="Coupon code"
                          className="pl-8 h-9 text-sm rounded-lg"
                          autoCapitalize="characters"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9 px-3 rounded-lg shrink-0"
                        onClick={applyCoupon}
                        disabled={couponLoading || !couponInput.trim()}
                      >
                        {couponLoading ? "..." : "Apply"}
                      </Button>
                    </div>
                    {couponError && (
                      <p className="text-xs text-destructive pl-1">{couponError}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2 text-sm border-t border-border pt-4 mb-4">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{cart.subtotal}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery</span>
                  <span>
                    {cart.deliveryFee === 0 ? "Free" : `₹${cart.deliveryFee}`}
                  </span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-700 dark:text-green-400 font-medium">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>−₹{appliedCoupon.discountAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 mt-2 border-t border-border">
                  <span>Total to pay</span>
                  <span className="text-primary">
                    ₹{(appliedCoupon ? appliedCoupon.finalAmount : cart.total).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                form="checkout-form"
                size="lg"
                className="w-full rounded-full h-14 text-lg shadow-lg"
                disabled={busy || onlinePaymentUnavailable}
              >
                {busy
                  ? paymentMethod === "cod"
                    ? "Placing Order..."
                    : "Opening Payment..."
                  : paymentMethod === "cod"
                    ? `Place Order — Pay ₹${cart.total} on Delivery`
                    : onlinePaymentUnavailable
                      ? "Select Cash on Delivery to continue"
                      : `Pay ₹${cart.total} via ${paymentMethod === "upi" ? "UPI" : "Card"}`}
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-muted/50 rounded-xl p-3 flex flex-col items-center justify-center text-center gap-1 border border-border">
                <ShieldCheck className="w-5 h-5 text-green-600" />
                <span className="text-[10px] font-medium leading-tight">
                  Secure Payment
                </span>
              </div>
              <div className="bg-muted/50 rounded-xl p-3 flex flex-col items-center justify-center text-center gap-1 border border-border">
                <Leaf className="w-5 h-5 text-secondary" />
                <span className="text-[10px] font-medium leading-tight">
                  Freshness Guaranteed
                </span>
              </div>
              <div className="bg-muted/50 rounded-xl p-3 flex flex-col items-center justify-center text-center gap-1 border border-border">
                <Truck className="w-5 h-5 text-primary" />
                <span className="text-[10px] font-medium leading-tight">
                  24h Delivery
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
