import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Shop from "@/pages/shop";
import ProductDetail from "@/pages/product";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import OrderConfirm from "@/pages/order";
import Subscribe from "@/pages/subscribe";
import AdminLogin from "@/admin/pages/admin-login";
import AdminDashboard from "@/admin/pages/admin-dashboard";
import AdminProducts from "@/admin/pages/admin-products";
import AdminOrders from "@/admin/pages/admin-orders";
import AdminCustomers from "@/admin/pages/admin-customers";
import AdminCoupons from "@/admin/pages/admin-coupons";
import AdminAnalytics from "@/admin/pages/admin-analytics";
import { AdminLayout } from "@/admin/components/admin-layout";
import { AdminGuard } from "@/admin/components/admin-guard";
import { useEffect } from "react";

const queryClient = new QueryClient();

function ProtectedAdmin({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <AdminLayout>{children}</AdminLayout>
    </AdminGuard>
  );
}

function ResetThemeOnExit() {
  const [location] = useLocation();
  useEffect(() => {
    if (!location.startsWith("/admin")) {
      document.documentElement.classList.remove("dark");
    }
  }, [location]);
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin">
        <ProtectedAdmin>
          <AdminDashboard />
        </ProtectedAdmin>
      </Route>
      <Route path="/admin/products">
        <ProtectedAdmin>
          <AdminProducts />
        </ProtectedAdmin>
      </Route>
      <Route path="/admin/orders">
        <ProtectedAdmin>
          <AdminOrders />
        </ProtectedAdmin>
      </Route>
      <Route path="/admin/customers">
        <ProtectedAdmin>
          <AdminCustomers />
        </ProtectedAdmin>
      </Route>
      <Route path="/admin/coupons">
        <ProtectedAdmin>
          <AdminCoupons />
        </ProtectedAdmin>
      </Route>
      <Route path="/admin/analytics">
        <ProtectedAdmin>
          <AdminAnalytics />
        </ProtectedAdmin>
      </Route>
      <Route path="/" component={Home} />
      <Route path="/shop" component={Shop} />
      <Route path="/category/:slug" component={Shop} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/order/:id" component={OrderConfirm} />
      <Route path="/subscribe" component={Subscribe} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <ResetThemeOnExit />
          <Router />
        </WouterRouter>
        <Toaster position="bottom-center" />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
