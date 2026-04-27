import { Skeleton } from "@/components/ui/skeleton";

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <Skeleton className="aspect-square rounded-2xl w-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-3/4 rounded-md" />
            <Skeleton className="h-4 w-1/2 rounded-md" />
          </div>
          <div className="flex justify-between items-center mt-2">
            <div>
              <Skeleton className="h-5 w-16 mb-1 rounded-md" />
              <Skeleton className="h-3 w-12 rounded-md" />
            </div>
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div className="space-y-4">
          <Skeleton className="aspect-square rounded-3xl w-full" />
          <div className="flex gap-4 overflow-hidden">
            <Skeleton className="w-20 h-20 rounded-xl shrink-0" />
            <Skeleton className="w-20 h-20 rounded-xl shrink-0" />
            <Skeleton className="w-20 h-20 rounded-xl shrink-0" />
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-1/3 rounded-md" />
            <Skeleton className="h-10 w-3/4 rounded-md" />
            <Skeleton className="h-6 w-full rounded-md" />
          </div>
          
          <Skeleton className="h-24 w-full rounded-2xl" />
          
          <div className="space-y-3">
            <Skeleton className="h-5 w-1/4 rounded-md" />
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-2/3 rounded-md" />
          </div>
          
          <Skeleton className="h-16 w-full rounded-full mt-8" />
        </div>
      </div>
    </div>
  );
}
