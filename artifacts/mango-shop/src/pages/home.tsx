import { useListProducts, useListBestSellers, useGetStatsSummary, useListReviews } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { ProductCard } from "@/components/product-card";
import { ProductGridSkeleton } from "@/components/skeletons";
import { Link } from "wouter";
import { ArrowRight, Leaf, ShieldCheck, Truck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: products, isLoading: isLoadingProducts } = useListProducts();
  const { data: bestSellers, isLoading: isLoadingBestSellers } = useListBestSellers();
  const { data: stats } = useGetStatsSummary();
  const { data: reviews } = useListReviews();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-accent/30 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/hero-orchard.png" 
            alt="Mango Orchard" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        </div>
        
        <div className="container mx-auto px-4 pt-12 pb-24 relative z-10">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary font-medium text-sm mb-2 border border-primary/20">
              Season's First Harvest
            </span>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-foreground leading-tight">
              Sun-drenched <span className="text-primary">Mangoes</span> delivered to your door
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Premium, hand-picked Alphonso and Kesar mangoes from the finest orchards in Ratnagiri and Devgad.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button asChild size="lg" className="rounded-full w-full sm:w-auto px-8 text-lg h-14 shadow-lg hover:shadow-xl transition-all">
                <Link href="/shop">Shop Fresh Harvest</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full w-full sm:w-auto px-8 text-lg h-14 bg-background/50 backdrop-blur border-primary/20 hover:bg-background/80">
                <Link href="/subscribe">Subscribe Weekly</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="border-y border-border bg-card/50">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-border">
            <div className="flex flex-col items-center gap-2 p-4">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mb-2">
                <Leaf className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg">Farm Fresh</h3>
              <p className="text-sm text-muted-foreground">Plucked at perfect maturity, never artificially ripened.</p>
            </div>
            <div className="flex flex-col items-center gap-2 p-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg">24h Delivery</h3>
              <p className="text-sm text-muted-foreground">From orchard to your doorstep in under 24 hours.</p>
            </div>
            <div className="flex flex-col items-center gap-2 p-4">
              <div className="w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center mb-2">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg">Quality Guarantee</h3>
              <p className="text-sm text-muted-foreground">100% replacement for any damaged or spoiled fruit.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">Best Sellers</h2>
              <p className="text-muted-foreground">The crowd favorites, loved by thousands.</p>
            </div>
            <Link href="/shop" className="hidden md:flex items-center gap-1 text-primary font-medium hover:underline">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {isLoadingBestSellers ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {bestSellers?.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          
          <div className="mt-8 text-center md:hidden">
            <Button asChild variant="outline" className="rounded-full w-full">
              <Link href="/shop">View all mangoes</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* All Products / New Arrivals */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">Fresh from the Farm</h2>
              <p className="text-muted-foreground">Every variety we carry, available now.</p>
            </div>
            <Link href="/shop" className="hidden md:flex items-center gap-1 text-primary font-medium hover:underline">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoadingProducts ? (
            <ProductGridSkeleton count={8} />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products?.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <Button asChild variant="outline" className="rounded-full px-8">
              <Link href="/shop">Browse all mangoes</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Subscription Teaser */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('/images/organic-box.png')] bg-cover bg-center mix-blend-overlay"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-5xl font-serif font-bold">Never run out of mangoes.</h2>
            <p className="text-lg md:text-xl text-primary-foreground/90">
              Get a curated box of the freshest seasonal varieties delivered to your door every week. Cancel anytime.
            </p>
            <div className="pt-4">
              <Button asChild size="lg" variant="secondary" className="rounded-full px-8 text-lg h-14 bg-background text-foreground hover:bg-background/90 shadow-xl">
                <Link href="/subscribe">Explore Subscriptions</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-12">Loved by mango enthusiasts</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {reviews?.slice(0, 3).map((review) => (
              <div key={review.id} className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                <div className="flex gap-1 mb-4 text-primary">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-muted'}`} />
                  ))}
                </div>
                <h4 className="font-bold text-lg mb-2 line-clamp-1">{review.title}</h4>
                <p className="text-muted-foreground text-sm mb-6 line-clamp-4">{review.body}</p>
                <div className="flex items-center gap-3 mt-auto">
                  <div className="w-10 h-10 rounded-full bg-accent overflow-hidden shrink-0">
                    <img src={review.avatarUrl} alt={review.authorName} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{review.authorName}</div>
                    <div className="text-xs text-muted-foreground">{review.authorLocation}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      {stats && (
        <section className="border-t border-border py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-border">
              <div className="flex flex-col gap-1">
                <span className="text-3xl md:text-4xl font-serif font-bold text-primary">{stats.happyCustomers.toLocaleString()}+</span>
                <span className="text-sm text-muted-foreground">Happy Customers</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-3xl md:text-4xl font-serif font-bold text-primary">{stats.farmsPartnered}</span>
                <span className="text-sm text-muted-foreground">Partner Farms</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-3xl md:text-4xl font-serif font-bold text-primary">{stats.varietiesCount}</span>
                <span className="text-sm text-muted-foreground">Mango Varieties</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-3xl md:text-4xl font-serif font-bold text-primary">&lt;{stats.averageDeliveryHours}h</span>
                <span className="text-sm text-muted-foreground">Average Delivery</span>
              </div>
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}
