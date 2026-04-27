import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Search, Eye, Package, Truck, CheckCircle2, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { adminApi, formatINR, type AdminOrder } from "../lib/api";
import { StatusPill } from "../components/status-pill";

const STATUSES = [
  { key: "all", label: "All" },
  { key: "confirmed", label: "Confirmed" },
  { key: "packed", label: "Packed" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

const NEXT_STATUS: Record<string, { next: string; label: string; icon: typeof Package }[]> = {
  confirmed: [
    { next: "packed", label: "Mark Packed", icon: Package },
    { next: "cancelled", label: "Cancel", icon: XCircle },
  ],
  packed: [
    { next: "shipped", label: "Mark Shipped", icon: Truck },
    { next: "cancelled", label: "Cancel", icon: XCircle },
  ],
  shipped: [{ next: "delivered", label: "Mark Delivered", icon: CheckCircle2 }],
  delivered: [],
  cancelled: [],
};

export default function AdminOrders() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () => adminApi.listOrders(),
  });

  const filtered = useMemo(() => {
    let list = data ?? [];
    if (filter !== "all") list = list.filter((o) => o.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.email.toLowerCase().includes(q) ||
          o.phone.includes(q),
      );
    }
    return list;
  }, [data, filter, search]);

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.updateOrderStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
      qc.invalidateQueries({ queryKey: ["admin", "analytics"] });
      qc.invalidateQueries({ queryKey: ["admin", "order"] });
      toast.success("Order status updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
        <p className="text-sm text-slate-500 mt-1">Track, fulfil and update orders.</p>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search order #, customer, email..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-order-search"
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            {STATUSES.map((s) => (
              <button
                key={s.key}
                onClick={() => setFilter(s.key)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                  filter === s.key
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
                data-testid={`filter-${s.key}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-500">
            No orders found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Order #</th>
                  <th className="text-left px-4 py-3 font-medium">Customer</th>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                  <th className="text-left px-4 py-3 font-medium">Payment</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-right px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-mono text-xs">{o.orderNumber}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{o.customerName}</div>
                      <div className="text-xs text-slate-500">{o.email}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {new Date(o.createdAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-4 py-3 uppercase text-xs text-slate-600 dark:text-slate-400">
                      {o.paymentMethod}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={o.status} />
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      {formatINR(o.total)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setOpenId(o.id)}
                        data-testid={`button-view-${o.id}`}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <OrderDetailDrawer
        orderId={openId}
        onClose={() => setOpenId(null)}
        onUpdateStatus={(id, status) => updateStatus.mutate({ id, status })}
        updating={updateStatus.isPending}
      />
    </div>
  );
}

function OrderDetailDrawer({
  orderId,
  onClose,
  onUpdateStatus,
  updating,
}: {
  orderId: string | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string) => void;
  updating: boolean;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "order", orderId],
    queryFn: () => adminApi.getOrder(orderId!),
    enabled: !!orderId,
  });

  return (
    <Sheet open={!!orderId} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Order details</SheetTitle>
        </SheetHeader>
        {isLoading || !data ? (
          <div className="space-y-3 mt-6">
            <Skeleton className="h-20" />
            <Skeleton className="h-40" />
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono text-xs text-slate-500">
                    {data.orderNumber}
                  </div>
                  <div className="font-semibold mt-1">{data.customerName}</div>
                </div>
                <StatusPill status={data.status} />
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs mt-4">
                <div>
                  <div className="text-slate-500">Email</div>
                  <div className="font-medium truncate">{data.email}</div>
                </div>
                <div>
                  <div className="text-slate-500">Phone</div>
                  <div className="font-medium">{data.phone}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-slate-500">Address</div>
                  <div className="font-medium">
                    {data.addressLine1}
                    {data.addressLine2 ? `, ${data.addressLine2}` : ""}, {data.city}, {data.state} {data.pincode}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">Payment</div>
                  <div className="font-medium uppercase">{data.paymentMethod}</div>
                </div>
                <div>
                  <div className="text-slate-500">ETA</div>
                  <div className="font-medium">
                    {new Date(data.estimatedDelivery).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                Items
              </div>
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {data.items.map((it) => (
                  <div key={it.id} className="flex items-center gap-3 p-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                      {it.productImageUrl && (
                        <img src={it.productImageUrl} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{it.productName}</div>
                      <div className="text-xs text-slate-500">
                        {it.quantity} × {formatINR(it.unitPrice)}
                      </div>
                    </div>
                    <div className="text-sm font-semibold tabular-nums">
                      {formatINR(it.lineTotal)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-200 dark:border-slate-800 p-4 space-y-1.5 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{formatINR(data.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Delivery</span>
                  <span className="tabular-nums">{formatINR(data.deliveryFee)}</span>
                </div>
                <div className="flex justify-between font-semibold pt-1.5 border-t border-slate-200 dark:border-slate-800">
                  <span>Total</span>
                  <span className="tabular-nums">{formatINR(data.total)}</span>
                </div>
              </div>
            </div>

            {NEXT_STATUS[data.status] && NEXT_STATUS[data.status]!.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Update status
                </div>
                <div className="flex gap-2 flex-wrap">
                  {NEXT_STATUS[data.status]!.map((a) => {
                    const Icon = a.icon;
                    return (
                      <Button
                        key={a.next}
                        variant={a.next === "cancelled" ? "outline" : "default"}
                        className={
                          a.next === "cancelled"
                            ? "text-red-600 border-red-200"
                            : "bg-emerald-600 hover:bg-emerald-700"
                        }
                        disabled={updating}
                        onClick={() => onUpdateStatus(data.id, a.next)}
                        data-testid={`button-status-${a.next}`}
                      >
                        <Icon className="w-3.5 h-3.5 mr-1.5" />
                        {a.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
