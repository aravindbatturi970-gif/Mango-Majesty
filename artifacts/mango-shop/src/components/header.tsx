import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, Mic, ShoppingBag, Menu } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function Header() {
  const { cart } = useCart();
  const itemCount = cart?.itemCount || 0;
  const [query, setQuery] = useState("");
  const [, navigate] = useLocation();

  function submitSearch(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    navigate(`/shop?q=${encodeURIComponent(trimmed)}`);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") submitSearch(query);
  }

  const handleVoiceSearch = () => {
    toast("Listening...", {
      description: "Say 'Find Alphonso mangoes'",
      icon: <Mic className="w-4 h-4 text-primary" />,
      duration: 3000,
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-serif font-bold text-primary">Aamras</span>
          </Link>
        </div>

        <div className="flex-1 max-w-md hidden md:flex items-center relative">
          <Search
            className="w-4 h-4 absolute left-3 text-muted-foreground cursor-pointer"
            onClick={() => submitSearch(query)}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search mangoes..."
            className="w-full bg-muted border-none rounded-full pl-10 pr-10 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
          <button
            onClick={handleVoiceSearch}
            className="absolute right-3 text-muted-foreground hover:text-primary transition-colors"
          >
            <Mic className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleVoiceSearch}
            className="md:hidden p-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <Mic className="w-5 h-5" />
          </button>
          
          <Link href="/cart" className="relative p-2 text-foreground hover:text-primary transition-colors hidden md:flex items-center gap-2">
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </div>
            <span className="font-medium text-sm hidden lg:block">Cart</span>
          </Link>
        </div>
      </div>
      
      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search for Alphonso..."
            className="w-full bg-muted border-none rounded-full pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
      </div>
    </header>
  );
}
