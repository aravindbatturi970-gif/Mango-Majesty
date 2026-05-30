import { Layout } from "@/components/layout";
import { useGetOrder } from "@workspace/api-client-react";
import { CheckCircle2, MessageCircle, MapPin, Truck, Calendar, Banknote, CreditCard, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function OrderConfirm({ params }: { params: { id: string } }) {
  const { data: order, isLoading } = useGetOrder(params.id);

  if (isLoading) {
    return <Layout><div className="p-8 text-center">Loading your order...</div></Layout>;
  }

  if (!order) {
    return <Layout><div className="p-8 text-center">Order not found.</div></Layout>;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="bg-card rounded-3xl p-8 md:p-12 border border-border shadow-md text-center mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-accent"></div>
          
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-4">
            Order Confirmed!
          </h1>
          <p className="text-muted-foreground text-lg mb-2">
            Thank you for shopping with Aamras, {order.customerName.split(' ')[0]}.
          </p>
          <p className="font-medium px-4 py-2 bg-muted inline-block rounded-full mb-8">
            Order #{order.orderNumber}
          </p>
          
          <div className="grid md:grid-cols-2 gap-4 text-left bg-background p-6 rounded-2xl border border-border text-sm">
            <div className="flex gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground shrink-0" />
              <div>
                <div className="font-medium text-muted-foreground mb-1">Estimated Delivery</div>
                <div className="font-bold text-base">{new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
                <div className="text-primary font-medium mt-1 text-xs">Usually arrives in under 24 hours</div>
              </div>
            </div>
            <div className="flex gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground shrink-0" />
              <div>
                <div className="font-medium text-muted-foreground mb-1">Delivery Address</div>
                <div className="font-medium">{order.addressLine1}</div>
                {order.addressLine2 && <div className="text-muted-foreground">{order.addressLine2}</div>}
                <div className="text-muted-foreground">{order.city}, {order.pincode}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-sm mb-8">
          <h2 className="text-2xl font-serif font-bold mb-6">Items Ordered</h2>
          <div className="space-y-4 mb-6">
            {order.items.map(item => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="w-16 h-16 bg-muted rounded-xl p-2 shrink-0">
                  <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-contain mix-blend-multiply" />
                </div>
                <div className="flex-1">
                  <div className="font-bold">{item.productName}</div>
                  <div className="text-sm text-muted-foreground">Qty: {item.quantity} × ₹{item.unitPrice}</div>
                </div>
                <div className="font-bold text-lg">₹{item.lineTotal}</div>
              </div>
            ))}
          </div>
          
          <div className="border-t border-border pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery</span>
              <span>{order.deliveryFee === 0 ? "Free" : `₹${order.deliveryFee}`}</span>
            </div>
            <div className="flex items-center justify-between font-bold text-xl pt-2 mt-2 border-t border-border">
              <div className="flex items-center gap-2">
                {order.paymentMethod === "cod" ? (
                  <Banknote className="w-5 h-5 text-amber-600" />
                ) : order.paymentMethod === "card" ? (
                  <CreditCard className="w-5 h-5 text-primary" />
                ) : (
                  <Wallet className="w-5 h-5 text-primary" />
                )}
                <span>
                  {order.paymentMethod === "cod" ? "Pay on Delivery" : "Total Paid"}
                </span>
              </div>
              <span className="text-primary">₹{order.total}</span>
            </div>
            {order.paymentMethod === "cod" && (
              <div className="mt-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 px-4 py-3 text-amber-800 dark:text-amber-400 text-xs font-medium">
                Please keep ₹{order.total} ready to hand over to our delivery partner.
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="rounded-full h-14">
            <Link href={`/track?order=${order.orderNumber}`}>
              <Truck className="w-5 h-5 mr-2" />
              Track My Order
            </Link>
          </Button>
          <Button asChild size="lg" className="rounded-full h-14 bg-[#25D366] hover:bg-[#1DA851] text-white">
            <a href={`https://wa.me/919999999999?text=Hi,%20I%20want%20to%20track%20my%20order%20${order.orderNumber}`} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-5 h-5 mr-2" />
              WhatsApp
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full h-14">
            <Link href="/">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
}
