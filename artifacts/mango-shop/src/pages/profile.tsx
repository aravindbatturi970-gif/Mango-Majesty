import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { useUserAuth } from "@/contexts/user-auth";
import { useLocation } from "wouter";
import { User, Package, LogOut, ChevronRight, Phone, Edit2, CheckCircle } from "lucide-react";
import { Link } from "wouter";

interface OrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: { productName: string; quantity: number }[];
}

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  shipped: "bg-cyan-100 text-cyan-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function Profile() {
  const { user, logout, openLoginModal } = useUserAuth();
  const [, setLocation] = useLocation();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name ?? "");
  const { login } = useUserAuth();

  useEffect(() => {
    if (!user) return;
    setLoadingOrders(true);
    fetch(
      `${import.meta.env.BASE_URL}api/orders/by-phone?phone=${encodeURIComponent(user.phone)}`,
      { credentials: "include" }
    )
      .then((r) => (r.ok ? r.json() : []))
      .then((data: OrderSummary[]) => setOrders(data))
      .catch(() => setOrders([]))
      .finally(() => setLoadingOrders(false));
  }, [user]);

  function handleLogout() {
    logout();
    setLocation("/");
  }

  function saveName() {
    if (!newName.trim() || !user) return;
    login({ ...user, name: newName.trim() });
    setEditingName(false);
  }

  if (!user) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center flex-1 px-6 py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center mb-5">
            <User className="w-9 h-9 text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Sign in to your account</h2>
          <p className="text-sm text-gray-500 mb-8 max-w-xs">
            View your orders, track deliveries and save your details for faster checkout.
          </p>
          <button
            onClick={openLoginModal}
            className="bg-amber-400 hover:bg-amber-500 text-white font-semibold px-10 py-3 rounded-2xl transition-colors"
          >
            Login / Sign up
          </button>
        </div>
      </Layout>
    );
  }

  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Layout>
      <div className="max-w-lg mx-auto w-full px-4 py-6 space-y-5">
        {/* Profile card */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-amber-400 flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-lg">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              {editingName ? (
                <div className="flex gap-2 items-center">
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveName()}
                    autoFocus
                    className="flex-1 border-b border-amber-400 bg-transparent outline-none text-gray-800 font-semibold text-base"
                  />
                  <button onClick={saveName} className="text-green-600">
                    <CheckCircle className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-gray-800 text-base truncate">{user.name}</span>
                  <button
                    onClick={() => { setEditingName(true); setNewName(user.name); }}
                    className="text-gray-400 hover:text-amber-500 shrink-0"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-1.5 mt-1">
                <Phone className="w-3 h-3 text-gray-400" />
                <span className="text-sm text-gray-500">+91 {user.phone.replace(/(\d{5})(\d{5})/, "$1 $2")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Orders section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-500" /> My Orders
            </h3>
            <Link href="/track" className="text-xs text-amber-600 font-medium">
              Track order
            </Link>
          </div>

          {loadingOrders ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
              <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No orders yet</p>
              <Link href="/shop" className="text-xs text-amber-600 font-medium mt-1 inline-block">
                Start shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/order/${order.id}`}
                  className="block bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-gray-800 truncate">
                        #{order.orderNumber}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 truncate">
                        {order.items.map((i) => `${i.productName} ×${i.quantity}`).join(", ")}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLOR[order.status] ?? "bg-gray-100 text-gray-600"}`}
                      >
                        {order.status}
                      </span>
                      <span className="text-sm font-bold text-amber-600">
                        ₹{order.total.toLocaleString("en-IN")}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-red-100 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </Layout>
  );
}
