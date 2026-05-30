import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { ProductCard } from "@/components/product-card";
import { ProductGridSkeleton } from "@/components/skeletons";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ShopProps {
  params?: {
    slug?: string;
  };
}

function getQueryParam(key: string): string {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get(key) ?? "";
}

export default function Shop({ params }: ShopProps) {
  const [location] = useLocation();
  const initialQ = getQueryParam("q");
  const [search, setSearch] = useState(initialQ);
  const [debouncedSearch, setDebouncedSearch] = useState(initialQ);
  const prevLocation = useRef(location);

  useEffect(() => {
    if (location !== prevLocation.current) {
      prevLocation.current = location;
      const q = getQueryParam("q");
      setSearch(q);
      setDebouncedSearch(q);
    }
  }, [location]);

  const categorySlug = params?.slug;

  const { data: products, isLoading: isLoadingProducts } = useListProducts({
    category: categorySlug,
    search: debouncedSearch || undefined,
  });

  const { data: categories } = useListCategories();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    // Simple debounce inline for demo purposes
    setTimeout(() => setDebouncedSearch(e.target.value), 500);
  };

  const clearSearch = () => {
    setSearch("");
    setDebouncedSearch("");
  };

  return (
    <Layout>
      <div className="bg-muted/30 py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-4">
            {categorySlug 
              ? categories?.find(c => c.slug === categorySlug)?.name || "Category"
              : "All Mangoes"}
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            {categorySlug 
              ? categories?.find(c => c.slug === categorySlug)?.description
              : "Explore our full collection of farm-fresh, hand-picked mangoes delivered directly to your doorstep."}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6 mb-8 items-start md:items-center justify-between">
          <div className="flex-1 w-full md:max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              value={search}
              onChange={handleSearch}
              placeholder="Search mangoes by name or variety..." 
              className="pl-10 pr-10 rounded-full bg-muted border-transparent focus-visible:ring-primary/20"
            />
            {search && (
              <button 
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto snap-x no-scrollbar">
            <Button 
              asChild 
              variant={!categorySlug ? "default" : "outline"} 
              className="rounded-full snap-start whitespace-nowrap shrink-0"
            >
              <a href="/shop">All</a>
            </Button>
            {categories?.map((cat) => (
              <Button 
                key={cat.id} 
                asChild 
                variant={categorySlug === cat.slug ? "default" : "outline"} 
                className="rounded-full snap-start whitespace-nowrap shrink-0"
              >
                <a href={`/category/${cat.slug}`}>{cat.name}</a>
              </Button>
            ))}
          </div>
        </div>

        {isLoadingProducts ? (
          <ProductGridSkeleton count={8} />
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-card rounded-2xl border border-border shadow-sm">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold font-serif mb-2">No mangoes found</h3>
            <p className="text-muted-foreground mb-6">
              We couldn't find any mangoes matching your current filters.
            </p>
            <Button onClick={clearSearch} variant="outline" className="rounded-full">
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
