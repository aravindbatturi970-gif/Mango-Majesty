import { useQuery } from "@tanstack/react-query";
import { Link, useRouter } from "wouter";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Package,
  CreditCard,
  Bell,
} from "lucide-react";
import { adminApi, formatINR } from "../lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusPill } from "../components/status-pill";

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: typeof TrendingUp;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover-elevate transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            {label}
          </div>
          <div className="text-2xl font-semibold mt-2 tracking-tight">{value}</div>
          {hint && <div className="text-xs text-slate-500 mt-1">{hint}</div>}
        </div>
        <div className={`grid place-items-center w-10 h-10 rounded-lg ${accent}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const base = router.base ?? "";
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: () => adminApi.analytics(),
  });
  const { data: notifData } = useQuery({
    queryKey: ["admin", "notifications"],
    queryFn: () => adminApi.notifications(),
    refetchInterval: 60_000,
    retry: false,
  });
  const criticalStock = (notifData?.items ?? []).filter(
    (n) => n.type === "stock",
  );
  const pendingOrders = (notifData?.items ?? []).filter(
    (n) => n.type === "order",
  );

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome back. Here's what's ripening today.
          </p>
        </div>
      </div>

      {(criticalStock.length > 0 || pendingOrders.length > 0) && (
        <div className="flex flex-col gap-2">
          {pendingOrders.length > 0 && (
            <Link href={`${base}/admin/orders`}>
              <a className="flex items-center gap-3 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors cursor-pointer">
                <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                  {pendingOrders.length} order{pendingOrders.length > 1 ? "s" : ""} waiting to be processed
                </span>
                <span className="ml-auto text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  View orders →
                </span>
              </a>
            </Link>
          )}
          {criticalStock.length > 0 && (
            <Link href={`${base}/admin/products`}>
              <a className="flex items-center gap-3 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors cursor-pointer">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  {criticalStock.length} product{criticalStock.length > 1 ? "s" : ""} running low on stock
                </span>
                <span className="ml-auto text-xs text-amber-600 dark:text-amber-400 font-medium">
                  Update stock →
                </span>
              </a>
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Sales today"
          value={formatINR(data.salesToday)}
          hint={`${data.ordersToday} orders today`}
          icon={TrendingUp}
          accent="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
        />
        <StatCard
          label="Sales this week"
          value={formatINR(data.salesWeek)}
          hint={`${data.ordersWeek} orders`}
          icon={ShoppingBag}
          accent="bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
        />
        <StatCard
          label="Sales this month"
          value={formatINR(data.salesMonth)}
          hint={`${data.ordersMonth} orders`}
          icon={CreditCard}
          accent="bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400"
        />
        <StatCard
          label="Avg. order value"
          value={formatINR(data.averageOrderValue)}
          hint={`${data.totalOrders} total orders`}
          icon={Users}
          accent="bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Revenue (last 30 days)</h3>
              <p className="text-xs text-slate-500">Daily revenue across all orders</p>
            </div>
          </div>
          <div className="h-64" data-testid="chart-revenue">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueSeries}>
                <defs>
                  <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.08} />
                <XAxis
                  dataKey="date"
                  fontSize={11}
                  tickFormatter={(d: string) => d.slice(5)}
                  stroke="currentColor"
                  opacity={0.5}
                />
                <YAxis fontSize={11} stroke="currentColor" opacity={0.5} />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover, #fff)",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [formatINR(v), "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#revGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Top mango varieties</h3>
            <Link href={`${base}/admin/products`}>
              <a className="text-xs text-emerald-600 hover:underline flex items-center gap-1">
                All <ArrowUpRight className="w-3 h-3" />
              </a>
            </Link>
          </div>
          {data.topProducts.length === 0 ? (
            <div className="text-sm text-slate-500 py-8 text-center">
              No sales data yet.
            </div>
          ) : (
            <div className="space-y-3">
              {data.topProducts.map((p, idx) => (
                <div key={p.productId} className="flex items-center gap-3">
                  <div className="text-xs font-semibold text-slate-400 w-4">
                    {idx + 1}
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                    {p.productImageUrl && (
                      <img
                        src={p.productImageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{p.productName}</div>
                    <div className="text-xs text-slate-500">
                      {p.quantitySold} sold
                    </div>
                  </div>
                  <div className="text-sm font-semibold tabular-nums">
                    {formatINR(p.revenue)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-semibold">Recent orders</h3>
            <Link href={`${base}/admin/orders`}>
              <a className="text-xs text-emerald-600 hover:underline flex items-center gap-1">
                View all <ArrowUpRight className="w-3 h-3" />
              </a>
            </Link>
          </div>
          {data.recentOrders.length === 0 ? (
            <div className="text-sm text-slate-500 py-12 text-center">
              No orders yet. They'll show up here as they come in.
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {data.recentOrders.map((o) => (
                <Link key={o.id} href={`${base}/admin/orders`}>
                  <a
                    className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    data-testid={`row-recent-order-${o.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{o.customerName}</div>
                      <div className="text-xs text-slate-500">
                        {o.orderNumber} · {o.paymentMethod.toUpperCase()}
                      </div>
                    </div>
                    <StatusPill status={o.status} />
                    <div className="text-sm font-semibold tabular-nums w-20 text-right">
                      {formatINR(o.total)}
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20">
          <div className="flex items-center gap-2 p-5 border-b border-amber-200 dark:border-amber-900/40">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="font-semibold text-amber-900 dark:text-amber-300">
              Low stock alerts
            </h3>
          </div>
          {data.lowStock.length === 0 ? (
            <div className="text-sm text-slate-500 py-12 text-center">
              <Package className="w-6 h-6 mx-auto mb-2 opacity-50" />
              All stocked up.
            </div>
          ) : (
            <div className="divide-y divide-amber-200 dark:divide-amber-900/40">
              {data.lowStock.map((p) => (
                <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-9 h-9 rounded-lg bg-white dark:bg-slate-800 overflow-hidden shrink-0">
                    {p.imageUrl && (
                      <img
                        src={p.imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{p.name}</div>
                    <div className="text-xs text-slate-500">{p.variety}</div>
                  </div>
                  <div className="text-sm font-semibold text-amber-700 dark:text-amber-400 tabular-nums">
                    {p.stock}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
