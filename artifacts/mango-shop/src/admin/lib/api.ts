const BASE = `${import.meta.env.BASE_URL}api`;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) msg = data.error;
    } catch {}
    throw new Error(msg);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const adminApi = {
  login: (email: string, password: string) =>
    request<{ admin: AdminMe }>("/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  logout: () => request<{ ok: true }>("/admin/logout", { method: "POST" }),
  me: () => request<{ admin: AdminMe }>("/admin/me"),

  listProducts: () => request<AdminProduct[]>("/admin/products"),
  getProduct: (id: string) => request<AdminProduct>(`/admin/products/${id}`),
  createProduct: (body: Partial<AdminProduct>) =>
    request<AdminProduct>("/admin/products", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateProduct: (id: string, body: Partial<AdminProduct>) =>
    request<AdminProduct>(`/admin/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  deleteProduct: (id: string) =>
    request<{ ok: true }>(`/admin/products/${id}`, { method: "DELETE" }),

  listOrders: () => request<AdminOrder[]>("/admin/orders"),
  getOrder: (id: string) =>
    request<AdminOrder & { items: AdminOrderItem[] }>(`/admin/orders/${id}`),
  updateOrderStatus: (id: string, status: string) =>
    request<AdminOrder>(`/admin/orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  listCustomers: () => request<AdminCustomer[]>("/admin/customers"),
  customerOrders: (email: string) =>
    request<AdminOrder[]>(`/admin/customers/${encodeURIComponent(email)}/orders`),

  listCoupons: () => request<AdminCoupon[]>("/admin/coupons"),
  createCoupon: (body: Partial<AdminCoupon>) =>
    request<AdminCoupon>("/admin/coupons", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateCoupon: (id: string, body: Partial<AdminCoupon>) =>
    request<AdminCoupon>(`/admin/coupons/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  deleteCoupon: (id: string) =>
    request<{ ok: true }>(`/admin/coupons/${id}`, { method: "DELETE" }),

  analytics: () => request<AdminAnalytics>("/admin/analytics/overview"),
};

export type AdminMe = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  variety: string;
  tagline: string;
  description: string;
  price: number;
  unit: string;
  imageUrl: string;
  gallery: string[];
  origin: string;
  sweetness: number;
  rating: number;
  reviewCount: number;
  stock: number;
  deliveryEtaHours: number;
  badge: string | null;
  categorySlug: string;
  isBestSeller: boolean;
  isOrganic: boolean;
  popularity: number;
  tags: string[];
  isActive: boolean;
};

export type AdminOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  pincode: string;
  paymentMethod: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: string;
  estimatedDelivery: string;
  createdAt: string;
};

export type AdminOrderItem = {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImageUrl: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type AdminCustomer = {
  email: string;
  name: string;
  phone: string;
  city: string;
  state: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string;
  lastOrderId: string;
};

export type AdminCoupon = {
  id: string;
  code: string;
  description: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  minOrderValue: number;
  usageLimit: number | null;
  usageCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
};

export type AdminAnalytics = {
  salesToday: number;
  salesWeek: number;
  salesMonth: number;
  ordersToday: number;
  ordersWeek: number;
  ordersMonth: number;
  totalOrders: number;
  averageOrderValue: number;
  revenueSeries: { date: string; revenue: number; orders: number }[];
  topProducts: {
    productId: string;
    productName: string;
    productImageUrl: string;
    quantitySold: number;
    revenue: number;
  }[];
  lowStock: {
    id: string;
    name: string;
    imageUrl: string;
    stock: number;
    variety: string;
  }[];
  recentOrders: {
    id: string;
    orderNumber: string;
    customerName: string;
    total: number;
    status: string;
    paymentMethod: string;
    createdAt: string;
  }[];
  paymentBreakdown: { method: string; count: number; total: number }[];
};

export function formatINR(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}
