import { Link } from "wouter";
import { Product } from "@workspace/api-client-react";
import { Star, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, isAdding } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product.id, 1);
  };

  return (
    <Link href={`/product/${product.id}`} className="group relative flex flex-col bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-card-border hover:border-primary/20">
      {product.badge && (
        <Badge className="absolute top-3 left-3 z-10 bg-primary text-primary-foreground pointer-events-none px-2.5 py-0.5 font-medium shadow-sm">
          {product.badge}
        </Badge>
      )}
      
      <div className="relative aspect-square overflow-hidden bg-muted/50 p-4">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" 
          loading="lazy"
        />
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute bottom-2 left-2 right-2 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-destructive bg-background/90 backdrop-blur px-2 py-1 rounded-full shadow-sm">
              Only {product.stock} left
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-1 gap-2">
          <h3 className="font-serif font-bold text-lg leading-tight line-clamp-2 text-card-foreground group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-1 bg-accent/50 px-1.5 py-0.5 rounded text-xs font-medium text-accent-foreground shrink-0">
            <Star className="w-3 h-3 fill-current" />
            <span>{product.rating.toFixed(1)}</span>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
          {product.tagline}
        </p>

        <div className="mt-auto flex items-end justify-between">
          <div>
            <div className="text-lg font-bold text-card-foreground">₹{product.price}</div>
            <div className="text-xs text-muted-foreground">{product.unit}</div>
          </div>
          
          <Button 
            size="icon" 
            className="rounded-full h-10 w-10 shadow-sm hover:shadow-md transition-all active:scale-95 z-20"
            onClick={handleAddToCart}
            disabled={isAdding || product.stock === 0}
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="sr-only">Add to cart</span>
          </Button>
        </div>
      </div>
    </Link>
  );
}
