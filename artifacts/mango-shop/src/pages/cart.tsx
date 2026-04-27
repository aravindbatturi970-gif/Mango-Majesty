import { Layout } from "@/components/layout";
import { useCart } from "@/hooks/use-cart";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/quantity-stepper";
import { ShoppingBag, ArrowRight, Trash2, ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Cart() {
  const { cart, isLoading, updateItemQuantity, removeItem } = useCart();

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-8 text-foreground">Your Cart</h1>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        ) : isEmpty ? (
          <div className="text-center py-24 bg-card rounded-3xl border border-border shadow-sm">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-serif font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Looks like you haven't added any fresh mangoes yet. Discover our seasonal harvest and treat yourself!
            </p>
            <Button asChild size="lg" className="rounded-full px-8">
              <Link href="/shop">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm relative group">
                  <div className="w-24 h-24 bg-muted/50 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                    <img 
                      src={item.product.imageUrl} 
                      alt={item.product.name} 
                      className="w-full h-full object-contain mix-blend-multiply p-2"
                    />
                  </div>
                  
                  <div className="flex flex-col flex-1 py-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold font-serif text-lg leading-tight mb-1">
                          <Link href={`/product/${item.product.id}`} className="hover:text-primary transition-colors">
                            {item.product.name}
                          </Link>
                        </h3>
                        <p className="text-sm text-muted-foreground">{item.product.unit}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">₹{item.lineTotal}</div>
                        <div className="text-xs text-muted-foreground">₹{item.product.price} each</div>
                      </div>
                    </div>
                    
                    <div className="mt-auto flex items-center justify-between">
                      <QuantityStepper 
                        value={item.quantity} 
                        onChange={(val) => updateItemQuantity(item.id, val)}
                        max={item.product.stock}
                      />
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-muted-foreground hover:text-destructive p-2 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-card p-6 rounded-3xl border border-border shadow-sm sticky top-24">
              <h3 className="text-xl font-serif font-bold mb-6">Order Summary</h3>
              
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({cart.itemCount} items)</span>
                  <span className="font-medium">₹{cart.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="font-medium">
                    {cart.deliveryFee === 0 ? <span className="text-green-600">Free</span> : `₹${cart.deliveryFee}`}
                  </span>
                </div>
                <div className="border-t border-border pt-3 mt-3 flex justify-between items-center">
                  <span className="font-bold text-base">Total</span>
                  <span className="font-bold text-2xl text-primary">₹{cart.total}</span>
                </div>
              </div>
              
              <Button asChild size="lg" className="w-full rounded-full h-14 text-lg shadow-md">
                <Link href="/checkout">
                  Proceed to Checkout <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="w-4 h-4" />
                <span>Secure SSL checkout</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
