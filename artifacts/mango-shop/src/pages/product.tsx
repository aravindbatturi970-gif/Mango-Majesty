import { useState } from "react";
import { Layout } from "@/components/layout";
import { useGetProduct, useGetProductRecommendations } from "@workspace/api-client-react";
import { ProductDetailSkeleton } from "@/components/skeletons";
import { QuantityStepper } from "@/components/quantity-stepper";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/product-card";
import { Star, Truck, MapPin, ShieldCheck, Flame, Info } from "lucide-react";
import { useLocation } from "wouter";

interface ProductPageProps {
  params: {
    id: string;
  };
}

export default function ProductDetail({ params }: ProductPageProps) {
  const { id } = params;
  const [, setLocation] = useLocation();
  const { data: product, isLoading } = useGetProduct(id);
  const { data: recommendations } = useGetProductRecommendations(id);
  const { addItem, isAdding } = useCart();
  
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (isLoading) {
    return (
      <Layout>
        <ProductDetailSkeleton />
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h2 className="text-2xl font-serif font-bold mb-4">Product not found</h2>
          <Button asChild className="rounded-full"><a href="/shop">Back to Shop</a></Button>
        </div>
      </Layout>
    );
  }

  const allImages = [product.imageUrl, ...(product.gallery || [])];

  const handleAddToCart = () => {
    addItem(product.id, quantity);
  };

  const handleBuyNow = () => {
    addItem(product.id, quantity);
    setLocation("/checkout");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted/50 rounded-3xl overflow-hidden border border-border relative">
              {product.badge && (
                <Badge className="absolute top-4 left-4 z-10 bg-primary text-primary-foreground px-3 py-1 shadow-md">
                  {product.badge}
                </Badge>
              )}
              <img 
                src={allImages[activeImageIndex]} 
                alt={product.name} 
                className="w-full h-full object-contain mix-blend-multiply p-8"
              />
            </div>
            
            {allImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 snap-x no-scrollbar">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 snap-start transition-all bg-muted/50 p-2 ${
                      i === activeImageIndex ? 'border-primary shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-contain mix-blend-multiply" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {product.categorySlug}
                </span>
                <div className="flex items-center gap-1 bg-accent px-2 py-0.5 rounded-md text-xs font-bold text-accent-foreground">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{product.rating.toFixed(1)}</span>
                  <span className="text-accent-foreground/70 font-medium">({product.reviewCount})</span>
                </div>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground leading-tight mb-2">
                {product.name}
              </h1>
              <p className="text-xl text-muted-foreground font-medium">
                {product.tagline}
              </p>
            </div>

            <div className="mb-8">
              <div className="flex items-end gap-3 mb-1">
                <span className="text-3xl font-bold text-foreground">₹{product.price}</span>
                <span className="text-muted-foreground mb-1">/ {product.unit}</span>
              </div>
              <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                Inclusive of all taxes
              </p>
            </div>

            {product.stock <= 10 && product.stock > 0 && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 mb-6 flex items-start gap-3">
                <Flame className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-destructive">Selling Fast!</p>
                  <p className="text-xs text-destructive/80">Only {product.stock} units left in stock. Order soon.</p>
                </div>
              </div>
            )}

            <div className="bg-card border border-border rounded-2xl p-6 mb-8 shadow-sm">
              <p className="text-foreground leading-relaxed mb-6">
                {product.description}
              </p>

              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Origin
                  </div>
                  <div className="font-medium">{product.origin}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Truck className="w-3 h-3" /> Delivery
                  </div>
                  <div className="font-medium">Under {product.deliveryEtaHours} hours</div>
                </div>
                <div className="col-span-2 mt-2">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Sweetness Profile</span>
                    <span className="font-bold text-primary">{product.sweetness}/10</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-400 to-primary rounded-full" 
                      style={{ width: `${product.sweetness * 10}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto">
              <div className="flex items-center gap-4 mb-6">
                <div className="font-medium">Quantity</div>
                <QuantityStepper 
                  value={quantity} 
                  onChange={setQuantity} 
                  max={Math.min(product.stock, 10)} 
                  disabled={product.stock === 0}
                />
              </div>

              {/* Action Buttons - Sticky on mobile */}
              <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-xl border-t border-border z-40 md:relative md:p-0 md:bg-transparent md:border-none md:z-auto flex gap-3">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="flex-1 h-14 rounded-full border-primary text-primary hover:bg-primary/5"
                  onClick={handleAddToCart}
                  disabled={isAdding || product.stock === 0}
                >
                  Add to Cart
                </Button>
                <Button 
                  size="lg" 
                  className="flex-1 h-14 rounded-full shadow-lg"
                  onClick={handleBuyNow}
                  disabled={isAdding || product.stock === 0}
                >
                  Buy Now
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <section className="pt-12 border-t border-border">
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-8">You may also like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {recommendations.map(rec => (
                <ProductCard key={rec.id} product={rec} />
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
