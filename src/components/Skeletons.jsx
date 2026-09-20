import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import PageContainer from "./PageContainer";

export function ProductCardSkeleton({ imageHeight = 190 }) {
  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card"
      aria-hidden
    >
      <Skeleton className="w-full shrink-0 rounded-none" style={{ height: imageHeight }} />
      <div className="flex flex-grow flex-col gap-2 p-4">
        <Skeleton className="h-3.5 w-[40%]" />
        <Skeleton className="h-[18px] w-[92%]" />
        <Skeleton className="h-[18px] w-[70%]" />
        <div className="flex-grow" />
        <Skeleton className="mt-1 h-6 w-[36%]" />
        <Skeleton className="mt-0.5 h-8 w-full rounded-md" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8, columns = 4, imageHeight = 190 }) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3",
        columns >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
      )}
      aria-busy="true"
      aria-label="Loading products"
    >
      {Array.from({ length: count }, (_, index) => (
        <ProductCardSkeleton key={index} imageHeight={imageHeight} />
      ))}
    </div>
  );
}

export default function HomeSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading storefront">
      <div className="bg-muted px-4 py-6 md:px-0 md:py-10">
        <PageContainer>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[1.4fr_1fr]">
            <Skeleton className="min-h-[220px] rounded-lg md:min-h-[360px]" />
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-[110px] rounded-lg" />
              <Skeleton className="h-[110px] rounded-lg" />
              <Skeleton className="h-[110px] rounded-lg" />
            </div>
          </div>
        </PageContainer>
      </div>

      <PageContainer className="py-8 md:py-12">
        <Skeleton className="mb-1 h-8 w-[40%]" />
        <Skeleton className="mb-6 h-[18px] w-[55%]" />
        <div className="mb-12 flex gap-2.5 overflow-hidden">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="w-[78%] shrink-0 sm:w-[44%] md:w-[26%]"
            >
              <ProductCardSkeleton imageHeight={170} />
            </div>
          ))}
        </div>

        <Skeleton className="mb-2.5 h-8 w-[34%]" />
        <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-[88px] rounded-lg" />
          ))}
        </div>

        <Skeleton className="mb-1 h-8 w-[36%]" />
        <Skeleton className="mb-6 h-[18px] w-[48%]" />
        <ProductGridSkeleton count={8} columns={4} />
      </PageContainer>
    </div>
  );
}
