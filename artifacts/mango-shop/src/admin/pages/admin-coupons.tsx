import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { adminApi, formatINR, type AdminCoupon } from "../lib/api";

const EMPTY: Partial<AdminCoupon> = {
  code: "",
  description: "",
  discountType: "percent",
  discountValue: 10,
  minOrderValue: 0,
  usageLimit: null,
  expiresAt: null,
  isActive: true,
};

export default function AdminCoupons() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "coupons"],
    queryFn: () => adminApi.listCoupons(),
  });
  const [editing, setEditing] = useState<Partial<AdminCoupon> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const saveMut = useMutation({
    mutationFn: async (body: Partial<AdminCoupon>) => {
      if (body.id) return adminApi.updateCoupon(body.id, body);
      return adminApi.createCoupon(body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "coupons"] });
      toast.success("Coupon saved");
      setEditing(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminApi.updateCoupon(id, { isActive }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "coupons"] });
    },
  });

  const delMut = useMutation({
    mutationFn: (id: string) => adminApi.deleteCoupon(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "coupons"] });
      toast.success("Coupon deleted");
      setDeleteId(null);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Coupons</h1>
          <p className="text-sm text-slate-500 mt-1">
            Run promos and discount codes.
          </p>
        </div>
        <Button
          className="bg-emerald-600 hover:bg-emerald-700"
          onClick={() => setEditing(EMPTY)}
          data-testid="button-add-coupon"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          New coupon
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : (data ?? []).length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 py-16 text-center">
          <Ticket className="w-8 h-8 mx-auto text-slate-400 mb-2" />
          <p className="text-sm text-slate-500">No coupons yet. Create your first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(data ?? []).map((c) => {
            const expired = c.expiresAt && new Date(c.expiresAt) < new Date();
            return (
              <div
                key={c.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
                data-testid={`coupon-card-${c.id}`}
              >
                <div className="p-5 border-b border-dashed border-slate-200 dark:border-slate-800 bg-gradient-to-br from-emerald-50 to-amber-50 dark:from-emerald-950/30 dark:to-amber-950/20">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Code
                      </div>
                      <div className="text-xl font-mono font-bold tracking-wider mt-1">
                        {c.code}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500">Discount</div>
                      <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        {c.discountType === "percent"
                          ? `${c.discountValue}%`
                          : formatINR(c.discountValue)}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-3">
                    {c.description}
                  </div>
                </div>
                <div className="p-4 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Min. order</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {formatINR(c.minOrderValue)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Used</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {c.usageCount}
                      {c.usageLimit ? ` / ${c.usageLimit}` : ""}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Expires</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {c.expiresAt
                        ? new Date(c.expiresAt).toLocaleDateString("en-IN", { dateStyle: "medium" })
                        : "Never"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={c.isActive && !expired}
                        disabled={!!expired}
                        onCheckedChange={(v) =>
                          toggleActive.mutate({ id: c.id, isActive: v })
                        }
                        data-testid={`switch-active-${c.id}`}
                      />
                      {expired ? (
                        <Badge variant="outline" className="text-[10px] text-red-600">
                          Expired
                        </Badge>
                      ) : c.isActive ? (
                        <Badge className="bg-emerald-600 text-[10px]">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">Paused</Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setEditing(c)}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-600"
                        onClick={() => setDeleteId(c.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CouponDialog
        coupon={editing}
        onClose={() => setEditing(null)}
        onSave={(c) => saveMut.mutate(c)}
        saving={saveMut.isPending}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete coupon?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the coupon code.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteId && delMut.mutate(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CouponDialog({
  coupon,
  onClose,
  onSave,
  saving,
}: {
  coupon: Partial<AdminCoupon> | null;
  onClose: () => void;
  onSave: (c: Partial<AdminCoupon>) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<Partial<AdminCoupon>>(coupon ?? EMPTY);
  if (!coupon) return null;

  function update<K extends keyof AdminCoupon>(key: K, value: AdminCoupon[K] | null) {
    setForm((f) => ({ ...f, [key]: value as AdminCoupon[K] }));
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{form.id ? "Edit coupon" : "Create coupon"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Code</Label>
            <Input
              value={form.code ?? ""}
              onChange={(e) => update("code", e.target.value.toUpperCase())}
              placeholder="MANGO10"
              disabled={!!form.id}
              data-testid="input-coupon-code"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Input
              value={form.description ?? ""}
              onChange={(e) => update("description", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <select
                value={form.discountType ?? "percent"}
                onChange={(e) => update("discountType", e.target.value as "percent" | "fixed")}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="percent">Percent off</option>
                <option value="fixed">Fixed amount</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Value</Label>
              <Input
                type="number"
                value={form.discountValue ?? 0}
                onChange={(e) => update("discountValue", Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Min. order ₹</Label>
              <Input
                type="number"
                value={form.minOrderValue ?? 0}
                onChange={(e) => update("minOrderValue", Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Usage limit</Label>
              <Input
                type="number"
                value={form.usageLimit ?? ""}
                onChange={(e) =>
                  update("usageLimit", e.target.value ? Number(e.target.value) : null)
                }
                placeholder="Unlimited"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Expires on</Label>
            <Input
              type="date"
              value={form.expiresAt ? form.expiresAt.slice(0, 10) : ""}
              onChange={(e) =>
                update("expiresAt", e.target.value ? new Date(e.target.value).toISOString() : null)
              }
            />
          </div>
          <div className="flex items-center justify-between rounded-md border border-slate-200 dark:border-slate-800 p-3">
            <Label>Active</Label>
            <Switch
              checked={form.isActive ?? true}
              onCheckedChange={(v) => update("isActive", v)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => onSave(form)}
            disabled={saving}
            data-testid="button-save-coupon"
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
