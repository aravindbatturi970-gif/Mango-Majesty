import { useEffect, useState } from "react";
import { useLocation, useRouter } from "wouter";
import { Leaf, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminLogin, useAdminMe } from "../lib/use-admin";

export default function AdminLogin() {
  const [email, setEmail] = useState("admin@aamras.com");
  const [password, setPassword] = useState("admin123");
  const login = useAdminLogin();
  const { data } = useAdminMe();
  const [, setLocation] = useLocation();
  const router = useRouter();
  const base = router.base ?? "";

  useEffect(() => {
    if (data?.admin) setLocation(`${base}/admin`);
  }, [data, setLocation, base]);

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-emerald-50 via-white to-amber-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="grid place-items-center w-10 h-10 rounded-xl bg-emerald-600 text-white shadow-lg">
            <Leaf className="w-5 h-5" />
          </span>
          <div>
            <div className="text-lg font-semibold tracking-tight">Village Organic Mangos</div>
            <div className="text-xs text-slate-500 -mt-0.5">Admin Console</div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <h1 className="text-xl font-semibold">Welcome back</h1>
          <p className="text-sm text-slate-500 mt-1">
            Sign in to manage products, orders & customers.
          </p>

          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              login.mutate({ email, password });
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="input-admin-email"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="input-admin-password"
              />
            </div>

            {login.isError && (
              <div className="text-xs text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 rounded-md px-3 py-2">
                {(login.error as Error).message}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              disabled={login.isPending}
              data-testid="button-admin-signin"
            >
              {login.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500">
              <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Demo accounts
              </div>
              <div>admin@aamras.com / admin123</div>
              <div>staff@aamras.com / staff123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
