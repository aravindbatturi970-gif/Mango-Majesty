import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Image as ImageIcon,
  X,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi, formatINR, type AdminProduct } from "../lib/api";

const EMPTY: Partial<AdminProduct> = {
  name: "",
  variety: "",
  tagline: "",
  description: "",
  price: 0,
  unit: "per kg",
  imageUrl: "",
  gallery: [],
  origin: "",
  sweetness: 8,
  stock: 0,
  badge: "",
  categorySlug: "alphonso",
  isBestSeller: false,
  isOrganic: false,
  tags: [],
  isActive: true,
};

export default function AdminProducts() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: () => adminApi.listProducts(),
  });
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Partial<AdminProduct> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const list = data ?? [];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.variety.toLowerCase().includes(q) ||
        p.origin.toLowerCase().includes(q),
    );
  }, [data, search]);

  const saveMut = useMutation({
    mutationFn: async (body: Partial<AdminProduct>) => {
      if (body.id) return adminApi.updateProduct(body.id, body);
      return adminApi.createProduct(body);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      qc.invalidateQueries({ queryKey: ["admin", "analytics"] });
      toast.success(vars.id ? "Product updated" : "Product created");
      setEditing(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => adminApi.deleteProduct(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      qc.invalidateQueries({ queryKey: ["admin", "analytics"] });
      toast.success("Product deleted");
      setDeleteId(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage mango varieties, prices and stock.
          </p>
        </div>
        <Button
          className="bg-emerald-600 hover:bg-emerald-700"
          onClick={() => setEditing(EMPTY)}
          data-testid="button-add-product"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add product
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by name, variety, origin..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-product-search"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-500">
            No products match your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Product</th>
                  <th className="text-left px-4 py-3 font-medium">Variety</th>
                  <th className="text-right px-4 py-3 font-medium">Price</th>
                  <th className="text-right px-4 py-3 font-medium">Stock</th>
                  <th className="text-left px-4 py-3 font-medium">Tags</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full grid place-items-center text-slate-400">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium truncate">{p.name}</div>
                          <div className="text-xs text-slate-500 truncate">{p.origin}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{p.variety}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium">
                      {formatINR(p.price)}
                      <div className="text-[10px] text-slate-400 font-normal">{p.unit}</div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      <span
                        className={
                          p.stock < 20
                            ? "text-amber-600 font-semibold"
                            : "text-slate-600 dark:text-slate-400"
                        }
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {p.isBestSeller && (
                          <Badge variant="secondary" className="text-[10px]">Best Seller</Badge>
                        )}
                        {p.isOrganic && (
                          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-[10px]">
                            Organic
                          </Badge>
                        )}
                        {p.tags.slice(0, 2).map((t) => (
                          <Badge key={t} variant="outline" className="text-[10px]">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {p.isActive ? (
                        <Badge variant="outline" className="text-[10px] text-emerald-700 border-emerald-300">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-slate-500">
                          Hidden
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditing(p)}
                          data-testid={`button-edit-${p.id}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700"
                          onClick={() => setDeleteId(p.id)}
                          data-testid={`button-delete-${p.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ProductFormDialog
        product={editing}
        onClose={() => setEditing(null)}
        onSave={(p) => saveMut.mutate(p)}
        saving={saveMut.isPending}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the product. Past orders are not affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteId && delMut.mutate(deleteId)}
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ProductFormDialog({
  product,
  onClose,
  onSave,
  saving,
}: {
  product: Partial<AdminProduct> | null;
  onClose: () => void;
  onSave: (p: Partial<AdminProduct>) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<Partial<AdminProduct>>(product ?? EMPTY);
  const [tagInput, setTagInput] = useState("");
  const [galleryInput, setGalleryInput] = useState("");

  if (!product) return null;

  function update<K extends keyof AdminProduct>(key: K, value: AdminProduct[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function addTag() {
    const t = tagInput.trim();
    if (!t) return;
    if ((form.tags ?? []).includes(t)) return;
    update("tags", [...(form.tags ?? []), t]);
    setTagInput("");
  }

  function addGallery() {
    const u = galleryInput.trim();
    if (!u) return;
    update("gallery", [...(form.gallery ?? []), u]);
    setGalleryInput("");
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{form.id ? "Edit product" : "Add new mango product"}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="space-y-1.5 col-span-2">
            <Label>Name</Label>
            <Input
              value={form.name ?? ""}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Ratnagiri Alphonso"
              data-testid="input-form-name"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Variety</Label>
            <Input
              value={form.variety ?? ""}
              onChange={(e) => update("variety", e.target.value)}
              placeholder="Alphonso"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <select
              value={form.categorySlug ?? "alphonso"}
              onChange={(e) => update("categorySlug", e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="alphonso">Alphonso</option>
              <option value="banganapalli">Banganapalli</option>
              <option value="kesar">Kesar</option>
              <option value="organic">Organic</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Price (₹)</Label>
            <Input
              type="number"
              value={form.price ?? 0}
              onChange={(e) => update("price", Number(e.target.value))}
              data-testid="input-form-price"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Unit</Label>
            <Input
              value={form.unit ?? ""}
              onChange={(e) => update("unit", e.target.value)}
              placeholder="per kg"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Stock quantity</Label>
            <Input
              type="number"
              value={form.stock ?? 0}
              onChange={(e) => update("stock", Number(e.target.value))}
              data-testid="input-form-stock"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Origin</Label>
            <Input
              value={form.origin ?? ""}
              onChange={(e) => update("origin", e.target.value)}
              placeholder="Devgad, Maharashtra"
            />
          </div>

          <div className="space-y-1.5 col-span-2">
            <Label>Tagline</Label>
            <Input
              value={form.tagline ?? ""}
              onChange={(e) => update("tagline", e.target.value)}
              placeholder="The original king. Buttery, fragrant, unforgettable."
            />
          </div>

          <div className="space-y-1.5 col-span-2">
            <Label>Description</Label>
            <Textarea
              value={form.description ?? ""}
              onChange={(e) => update("description", e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-1.5 col-span-2">
            <Label>Sweetness: {form.sweetness ?? 8} / 10</Label>
            <Slider
              value={[form.sweetness ?? 8]}
              min={1}
              max={10}
              step={1}
              onValueChange={(v) => update("sweetness", v[0]!)}
            />
          </div>

          <div className="space-y-1.5 col-span-2">
            <Label>Main image URL</Label>
            <Input
              value={form.imageUrl ?? ""}
              onChange={(e) => update("imageUrl", e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-1.5 col-span-2">
            <Label>Gallery images</Label>
            <div className="flex gap-2">
              <Input
                value={galleryInput}
                onChange={(e) => setGalleryInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addGallery())}
                placeholder="Paste image URL and press Enter"
              />
              <Button type="button" variant="outline" onClick={addGallery}>
                <Upload className="w-4 h-4" />
              </Button>
            </div>
            {(form.gallery ?? []).length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {(form.gallery ?? []).map((url, idx) => (
                  <div key={idx} className="relative aspect-square rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white grid place-items-center"
                      onClick={() =>
                        update(
                          "gallery",
                          (form.gallery ?? []).filter((_, i) => i !== idx),
                        )
                      }
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5 col-span-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="Best Seller, Organic, Limited Stock..."
              />
              <Button type="button" variant="outline" onClick={addTag}>
                Add
              </Button>
            </div>
            {(form.tags ?? []).length > 0 && (
              <div className="flex gap-1.5 flex-wrap mt-2">
                {(form.tags ?? []).map((t) => (
                  <Badge key={t} variant="secondary" className="gap-1">
                    {t}
                    <button
                      type="button"
                      onClick={() => update("tags", (form.tags ?? []).filter((x) => x !== t))}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between rounded-md border border-slate-200 dark:border-slate-800 p-3">
            <div>
              <Label className="text-sm">Best Seller</Label>
              <div className="text-xs text-slate-500">Highlight on homepage</div>
            </div>
            <Switch
              checked={form.isBestSeller ?? false}
              onCheckedChange={(v) => update("isBestSeller", v)}
            />
          </div>
          <div className="flex items-center justify-between rounded-md border border-slate-200 dark:border-slate-800 p-3">
            <div>
              <Label className="text-sm">Organic</Label>
              <div className="text-xs text-slate-500">Show organic badge</div>
            </div>
            <Switch
              checked={form.isOrganic ?? false}
              onCheckedChange={(v) => update("isOrganic", v)}
            />
          </div>
          <div className="flex items-center justify-between rounded-md border border-slate-200 dark:border-slate-800 p-3 col-span-2">
            <div>
              <Label className="text-sm">Active</Label>
              <div className="text-xs text-slate-500">When off, product is hidden from the storefront</div>
            </div>
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
            disabled={saving}
            onClick={() => onSave(form)}
            data-testid="button-save-product"
          >
            {saving ? "Saving..." : form.id ? "Save changes" : "Create product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
