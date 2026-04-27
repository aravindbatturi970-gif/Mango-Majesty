import { useEffect, type ReactNode } from "react";
import { useLocation, useRouter } from "wouter";
import { useAdminMe } from "../lib/use-admin";
import { Loader2 } from "lucide-react";

export function AdminGuard({ children }: { children: ReactNode }) {
  const { data, isLoading } = useAdminMe();
  const [, setLocation] = useLocation();
  const router = useRouter();
  const base = router.base ?? "";

  useEffect(() => {
    if (!isLoading && !data?.admin) {
      setLocation(`${base}/admin/login`);
    }
  }, [isLoading, data, setLocation, base]);

  if (isLoading || !data?.admin) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  return <>{children}</>;
}
