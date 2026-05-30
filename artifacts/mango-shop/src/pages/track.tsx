import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  PackageCheck,
  PackageOpen,
  Truck,
  CheckCircle2,
  XCircle,
  MapPin,
  Calendar,
  CreditCard,
} from "lucide-react";

type TrackingItem = {
  productName: string;
  productImageUrl: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

type TrackingResult = {
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  status: string;
  paymentMethod: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  estimatedDelivery: string;
  createdAt: string;
  items: TrackingItem[];
};

const STEPS = [
  { key: "confirmed", label: "Order Confirmed", icon: PackageCheck },
  { key: "packed",    label: "Packed",          icon: PackageOpen },
  { key: "shipped",   label: "Out for Delivery", icon: Truck },
  { key: "delivered", label: "Delivered",        icon: CheckCircle2 },
];

function StatusTimeline({ status }: { status: string }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-3 py-4 text-red-600 dark:text-red-400">
        <XCircle className="w-6 h-6 shrink-0" />
        <div>
          <div className="font-semibold">Order Cancelled</div>
          <div className="text-sm text-muted-foreground">
            This order has been cancelled.
          </div>
        </div>
      </div>
    );
  }

  const currentIdx = STEPS.findIndex((s) => s.key === status);

  return (
    <div className="relative">
      <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-border" />
      <div className="space-y-6">
        {STEPS.map((step, i) => {
          const done = i <= currentIdx;
          const active = i === currentIdx;
          const Icon = step.icon;
          return (
            <div key={step.key} className="flex items-center gap-4 relative">
              <div
                className={`z-10 grid place-items-center w-10 h-10 rounded-full border-2 shrink-0 transition-colors ${
                  done
                    ? active
                      ? "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/30"
                      : "bg-primary/10 border-primary text-primary"
                    : "bg-background border-border text-muted-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <div
                  className={`text-sm font-semibold ${done ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {step.label}
                </div>
                {active && (
                  <div className="text-xs text-primary font-medium mt-0.5">
                    Current status
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TrackOrder() {
  const prefilledOrder = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("order") ?? ""
    : "";
  const [input, setInput] = useState(prefilledOrder);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [error, setError] = useState("");

  async function fetchTrack(orderNumber: string) {
    const num = orderNumber.trim().toUpperCase();
    if (!num) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(
        `${import.meta.env.BASE_URL}api/orders/track/${encodeURIComponent(num)}`,
        { credentials: "include" },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Could not connect. Please check your internet and try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (prefilledOrder) fetchTrack(prefilledOrder);
  }, []);

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    fetchTrack(input);
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center mb-10">
          <div className="inline-grid place-items-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
            <Truck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">
            Track Your Order
          </h1>
          <p className="text-muted-foreground">
            Enter your order number to see real-time delivery status.
          </p>
        </div>

        <form
          onSubmit={handleTrack}
          className="flex gap-2 mb-8"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. AAM-MOH7VOP9-4YD6"
              className="pl-10 rounded-full h-12 text-base"
              autoCapitalize="characters"
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-full h-12 px-6"
          >
            {loading ? "Checking..." : "Track"}
          </Button>
        </form>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/40 text-red-700 dark:text-red-400 px-5 py-4 text-sm mb-6">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
                    Order number
                  </div>
                  <div className="text-xl font-bold font-mono tracking-tight">
                    {result.orderNumber}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {result.customerName}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
                    Placed on
                  </div>
                  <div className="text-sm font-medium">
                    {new Date(result.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>

              <StatusTimeline status={result.status} />
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                <div className="flex gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <div className="text-muted-foreground mb-0.5">
                      Expected delivery
                    </div>
                    <div className="font-semibold">
                      {new Date(result.estimatedDelivery).toLocaleDateString(
                        "en-IN",
                        { weekday: "short", day: "numeric", month: "short" },
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <div className="text-muted-foreground mb-0.5">
                      Delivering to
                    </div>
                    <div className="font-semibold">
                      {result.city}, {result.state}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CreditCard className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <div className="text-muted-foreground mb-0.5">Payment</div>
                    <div className="font-semibold uppercase text-xs">
                      {result.paymentMethod}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="font-semibold text-base mb-4">Items in this order</h2>
              <div className="space-y-3 mb-4">
                {result.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-muted p-1.5 shrink-0">
                      <img
                        src={item.productImageUrl}
                        alt={item.productName}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {item.productName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Qty {item.quantity} × ₹{item.unitPrice.toLocaleString("en-IN")}
                      </div>
                    </div>
                    <div className="text-sm font-semibold shrink-0">
                      ₹{item.lineTotal.toLocaleString("en-IN")}
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-3 space-y-1 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{result.subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery</span>
                  <span>
                    {result.deliveryFee === 0
                      ? "Free"
                      : `₹${result.deliveryFee.toLocaleString("en-IN")}`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-base pt-2 border-t border-border mt-2">
                  <span>Total</span>
                  <span className="text-primary">
                    ₹{result.total.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
