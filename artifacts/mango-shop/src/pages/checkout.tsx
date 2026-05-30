import { useState } from "react";
import { Layout } from "@/components/layout";
import { useCart } from "@/hooks/use-cart";
import { useCreateOrder, CreateOrderBody } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { getSessionId } from "@/lib/session";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ShieldCheck, Leaf, Truck, CreditCard, Wallet, Banknote } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  addressLine1: z.string().min(5, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(6, "Valid pincode is required"),
  paymentMethod: z.enum(["upi", "card", "cod"]),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const { cart, isLoading } = useCart();
  const createOrder = useCreateOrder();
  const [, setLocation] = useLocation();

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      email: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      paymentMethod: "upi",
    },
  });

  const onSubmit = (data: CheckoutFormValues) => {
    if (!cart || cart.items.length === 0) return;
    
    const orderData: CreateOrderBody = {
      sessionId: getSessionId(),
      ...data,
    };

    createOrder.mutate({ data: orderData }, {
      onSuccess: (order) => {
        setLocation(`/order/${order.id}`);
      }
    });
  };

  if (isLoading) return <Layout><div className="container p-8">Loading...</div></Layout>;
  
  if (!cart || cart.items.length === 0) {
    setLocation("/cart");
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-8 text-foreground">Checkout</h1>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-3 space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" id="checkout-form">
                
                {/* Contact Info */}
                <div className="bg-card p-6 rounded-3xl border border-border shadow-sm">
                  <h2 className="text-xl font-bold font-serif mb-4">Contact Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="customerName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl><Input placeholder="Raj Patel" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl><Input placeholder="+91 99999 99999" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Email Address</FormLabel>
                        <FormControl><Input type="email" placeholder="raj@example.com" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-card p-6 rounded-3xl border border-border shadow-sm">
                  <h2 className="text-xl font-bold font-serif mb-4">Delivery Address</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="addressLine1" render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Address Line 1</FormLabel>
                        <FormControl><Input placeholder="House/Flat No., Building Name" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="addressLine2" render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Landmark / Area (Optional)</FormLabel>
                        <FormControl><Input placeholder="Near Metro Station" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="city" render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl><Input placeholder="Mumbai" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="state" render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl><Input placeholder="Maharashtra" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="pincode" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pincode</FormLabel>
                        <FormControl><Input placeholder="400001" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-card p-6 rounded-3xl border border-border shadow-sm">
                  <h2 className="text-xl font-bold font-serif mb-4">Payment Method</h2>
                  <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          className="flex flex-col gap-3"
                        >
                          <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${field.value === 'upi' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'}`}>
                            <RadioGroupItem value="upi" id="payment-upi" />
                            <Wallet className={`w-5 h-5 ${field.value === 'upi' ? 'text-primary' : 'text-muted-foreground'}`} />
                            <div className="flex-1 font-medium">UPI (GPay, PhonePe, Paytm)</div>
                          </label>
                          <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${field.value === 'card' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'}`}>
                            <RadioGroupItem value="card" id="payment-card" />
                            <CreditCard className={`w-5 h-5 ${field.value === 'card' ? 'text-primary' : 'text-muted-foreground'}`} />
                            <div className="flex-1 font-medium">Credit / Debit Card</div>
                          </label>
                          <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${field.value === 'cod' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'}`}>
                            <RadioGroupItem value="cod" id="payment-cod" />
                            <Banknote className={`w-5 h-5 ${field.value === 'cod' ? 'text-primary' : 'text-muted-foreground'}`} />
                            <div className="flex-1">
                              <div className="font-medium">Cash on Delivery</div>
                              <div className="text-xs text-muted-foreground">Pay when your order arrives</div>
                            </div>
                          </label>
                          {field.value === "cod" && (
                            <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 px-4 py-3 text-amber-800 dark:text-amber-400 text-xs font-medium">
                              Please keep exact change ready for the delivery partner.
                            </div>
                          )}
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )} />
                </div>
              </form>
            </Form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-2 space-y-6 lg:sticky lg:top-24">
            <div className="bg-card p-6 rounded-3xl border border-border shadow-sm">
              <h3 className="text-xl font-serif font-bold mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto pr-2 no-scrollbar">
                {cart.items.map(item => (
                  <div key={item.id} className="flex gap-3 text-sm">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <img src={item.product.imageUrl} alt="" className="w-8 h-8 object-contain mix-blend-multiply" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium line-clamp-1">{item.product.name}</div>
                      <div className="text-muted-foreground">Qty: {item.quantity}</div>
                    </div>
                    <div className="font-bold">₹{item.lineTotal}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-sm border-t border-border pt-4 mb-4">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{cart.subtotal}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery</span>
                  <span>{cart.deliveryFee === 0 ? "Free" : `₹${cart.deliveryFee}`}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 mt-2 border-t border-border">
                  <span>Total to pay</span>
                  <span className="text-primary">₹{cart.total}</span>
                </div>
              </div>

              <Button 
                type="submit" 
                form="checkout-form" 
                size="lg" 
                className="w-full rounded-full h-14 text-lg shadow-lg"
                disabled={createOrder.isPending}
              >
                {createOrder.isPending
                  ? "Placing Order..."
                  : form.watch("paymentMethod") === "cod"
                  ? `Place Order — ₹${cart.total} on Delivery`
                  : `Pay ₹${cart.total}`}
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-muted/50 rounded-xl p-3 flex flex-col items-center justify-center text-center gap-1 border border-border">
                <ShieldCheck className="w-5 h-5 text-green-600" />
                <span className="text-[10px] font-medium leading-tight">Secure Payment</span>
              </div>
              <div className="bg-muted/50 rounded-xl p-3 flex flex-col items-center justify-center text-center gap-1 border border-border">
                <Leaf className="w-5 h-5 text-secondary" />
                <span className="text-[10px] font-medium leading-tight">Freshness Guaranteed</span>
              </div>
              <div className="bg-muted/50 rounded-xl p-3 flex flex-col items-center justify-center text-center gap-1 border border-border">
                <Truck className="w-5 h-5 text-primary" />
                <span className="text-[10px] font-medium leading-tight">24h Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
