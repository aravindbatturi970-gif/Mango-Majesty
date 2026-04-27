import { Layout } from "@/components/layout";
import { useListSubscriptionPlans, useCreateSubscription, CreateSubscriptionBody } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Leaf, Box } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

const subSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
});

export default function Subscribe() {
  const { data: plans, isLoading } = useListSubscriptionPlans();
  const createSub = useCreateSubscription();
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [, setLocation] = useLocation();

  const form = useForm<z.infer<typeof subSchema>>({
    resolver: zodResolver(subSchema),
    defaultValues: { customerName: "", email: "", phone: "" },
  });

  const onSubmit = (data: z.infer<typeof subSchema>) => {
    if (!selectedPlanId) {
      toast.error("Please select a subscription plan first");
      return;
    }

    createSub.mutate(
      { data: { planId: selectedPlanId, ...data } },
      {
        onSuccess: () => {
          toast.success("Subscription activated", {
            description: "We'll contact you shortly with your delivery schedule.",
          });
          setLocation("/");
        }
      }
    );
  };

  return (
    <Layout>
      <div className="bg-primary text-primary-foreground py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('/images/organic-box.png')] bg-cover bg-center mix-blend-overlay"></div>
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <span className="inline-block bg-background text-primary px-3 py-1 rounded-full text-sm font-bold mb-6">
            Aamras Club
          </span>
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">A summer without limits.</h1>
          <p className="text-lg md:text-xl text-primary-foreground/90">
            Subscribe to get hand-picked, premium mangoes delivered automatically every week. Peak freshness, zero hassle.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          
          {/* Plans */}
          <div className="space-y-6">
            <h2 className="text-2xl font-serif font-bold mb-2">Choose your plan</h2>
            <p className="text-muted-foreground mb-6">Billed weekly. Pause or cancel anytime.</p>
            
            {isLoading ? (
              <div className="space-y-4">
                <div className="h-48 bg-muted animate-pulse rounded-3xl"></div>
                <div className="h-48 bg-muted animate-pulse rounded-3xl"></div>
              </div>
            ) : (
              <div className="grid gap-6">
                {plans?.map((plan) => (
                  <div 
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`cursor-pointer relative bg-card rounded-3xl p-6 border-2 transition-all duration-300 ${
                      selectedPlanId === plan.id 
                        ? 'border-primary shadow-md scale-[1.02]' 
                        : 'border-border shadow-sm hover:border-primary/40 hover:shadow-md'
                    }`}
                  >
                    {selectedPlanId === plan.id && (
                      <div className="absolute top-4 right-4 text-primary">
                        <CheckCircle2 className="w-6 h-6 fill-primary/10" />
                      </div>
                    )}
                    
                    <div className="flex gap-4">
                      <div className="w-20 h-20 bg-muted/50 rounded-2xl overflow-hidden shrink-0">
                        <img src={plan.imageUrl} alt={plan.name} className="w-full h-full object-cover mix-blend-multiply" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold font-serif">{plan.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{plan.tagline}</p>
                        <div className="text-2xl font-bold text-primary">₹{plan.weeklyPrice}<span className="text-sm font-normal text-muted-foreground">/wk</span></div>
                      </div>
                    </div>
                    
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Box className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{plan.boxesPerWeek} box(es) per week</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        {plan.varieties.map((v, i) => (
                          <span key={i} className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-md font-medium">
                            {v}
                          </span>
                        ))}
                      </div>
                      
                      <div className="pt-3 mt-3 border-t border-border space-y-2">
                        {plan.perks.map((perk, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Leaf className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                            <span>{perk}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form */}
          <div className="bg-card p-8 rounded-3xl border border-border shadow-sm lg:sticky lg:top-24">
            <h2 className="text-2xl font-serif font-bold mb-6">Delivery Details</h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField control={form.control} name="customerName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input placeholder="Priya Sharma" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" placeholder="priya@example.com" {...field} /></FormControl>
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
                
                <div className="pt-4">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full h-14 rounded-full text-lg shadow-lg"
                    disabled={createSub.isPending || !selectedPlanId}
                  >
                    {createSub.isPending ? "Setting up..." : "Subscribe Now"}
                  </Button>
                  {!selectedPlanId && (
                    <p className="text-xs text-center text-destructive mt-3">Please select a plan first</p>
                  )}
                </div>
              </form>
            </Form>
          </div>

        </div>
      </div>
    </Layout>
  );
}
