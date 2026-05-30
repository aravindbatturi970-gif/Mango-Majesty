import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation, useRouter } from "wouter";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Ticket,
  BarChart3,
  Settings,
  Bell,
  Search,
  Moon,
  Sun,
  LogOut,
  Menu,
  ChevronLeft,
  Leaf,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdminLogout, useAdminMe } from "../lib/use-admin";
import {
  applyAdminTheme,
  getInitialAdminTheme,
} from "../lib/admin-theme";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
};

const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function useBasePath() {
  const router = useRouter();
  return router.base ?? "";
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(getInitialAdminTheme());
  const [location] = useLocation();
  const base = useBasePath();
  const { data } = useAdminMe();
  const logout = useAdminLogout();

  useEffect(() => {
    applyAdminTheme(theme);
  }, [theme]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  function isActive(href: string) {
    if (href === "/admin") return location === "/admin" || location === "/admin/";
    return location.startsWith(href);
  }

  function withBase(href: string) {
    return `${base}${href}`;
  }

  const sidebarWidth = collapsed ? "w-[68px]" : "w-[240px]";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
          data-testid="admin-overlay"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 ${sidebarWidth} border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
        data-testid="admin-sidebar"
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
          <Link href={withBase("/admin")}>
            <a className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold tracking-tight">
              <span className="grid place-items-center w-8 h-8 rounded-lg bg-emerald-600 text-white shadow-sm">
                <Leaf className="w-4 h-4" />
              </span>
              {!collapsed && <span className="text-base">Aamras Admin</span>}
            </a>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:inline-flex h-7 w-7 text-slate-500"
            onClick={() => setCollapsed((c) => !c)}
            data-testid="button-toggle-collapse"
          >
            <ChevronLeft
              className={`w-4 h-4 transition-transform ${collapsed ? "rotate-180" : ""}`}
            />
          </Button>
        </div>

        <nav className="flex flex-col gap-1 p-3">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={withBase(item.href)}>
                <a
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </a>
              </Link>
            );
          })}
        </nav>

        {!collapsed && (
          <div className="absolute bottom-4 left-3 right-3">
            <div className="rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/30 p-3">
              <div className="text-xs font-semibold text-amber-900 dark:text-amber-300">
                Mango Season Live
              </div>
              <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                Peak harvest week — push fresh stock daily.
              </div>
            </div>
          </div>
        )}
      </aside>

      <div className={`md:pl-[${collapsed ? "68" : "240"}px] transition-all`} style={{
        paddingLeft: undefined,
      }}>
        <div className={`${collapsed ? "md:pl-[68px]" : "md:pl-[240px]"}`}>
          <header className="sticky top-0 z-30 h-16 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur flex items-center gap-3 px-4 md:px-6">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-8 w-8"
              onClick={() => setMobileOpen(true)}
              data-testid="button-mobile-menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search products, orders, customers..."
                className="pl-9 h-9 bg-slate-100 dark:bg-slate-800 border-transparent focus-visible:bg-white dark:focus-visible:bg-slate-900"
                data-testid="input-admin-search"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              data-testid="button-theme-toggle"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 relative"
              data-testid="button-notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-amber-500" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg px-2 py-1.5 transition-colors"
                  data-testid="button-profile"
                >
                  <Avatar className="w-7 h-7">
                    <AvatarFallback className="bg-emerald-600 text-white text-xs">
                      {data?.admin?.name?.[0] ?? "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-semibold leading-tight">
                      {data?.admin?.name ?? "Admin"}
                    </div>
                    <div className="text-[10px] text-slate-500 leading-tight capitalize">
                      {data?.admin?.role?.replace("_", " ") ?? "admin"}
                    </div>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>{data?.admin?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={withBase("/admin/settings")}>
                    <a className="flex items-center w-full">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logout.mutate()}
                  data-testid="menu-logout"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          <main className="p-4 md:p-6 max-w-[1400px] mx-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
