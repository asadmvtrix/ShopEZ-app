import { useLocation } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import PageContainer from "./PageContainer";

export function ProductCardSkeleton() {
  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-[var(--radius)] border border-border bg-card"
      aria-hidden
    >
      <Skeleton className="aspect-[4/3] w-full shrink-0 rounded-none" />
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

export function ProductGridSkeleton({ count = 8, columns = 4 }) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3",
        columns >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
      )}
      aria-busy="true"
      aria-label="Loading products"
    >
      {Array.from({ length: count }, (_, index) => (
        <ProductCardSkeleton key={index} />
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
        <div className="mb-12 flex gap-5 overflow-hidden">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="w-[78%] shrink-0 sm:w-[44%] md:w-[26%]"
            >
              <ProductCardSkeleton />
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

function BrowseFallback() {
  return (
    <PageContainer className="py-6 md:py-10">
      <Skeleton className="mb-1 h-10 w-[42%]" />
      <Skeleton className="mb-6 h-[18px] w-[28%]" />
      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-[minmax(0,240px)_minmax(0,1fr)] md:gap-8">
        <div className="hidden md:block">
          <Skeleton className="h-[420px] rounded-lg" />
        </div>
        <div>
          <Skeleton className="mb-2.5 h-10 max-w-[280px] rounded-lg" />
          <ProductGridSkeleton count={9} columns={3} />
        </div>
      </div>
    </PageContainer>
  );
}

function ProductDetailsFallback() {
  return (
    <PageContainer className="py-6 md:py-10">
      <Skeleton className="mb-6 h-5 w-40" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-10">
        <Skeleton className="min-h-[280px] rounded-lg md:min-h-[420px]" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-[30%]" />
          <Skeleton className="h-9 w-[88%]" />
          <Skeleton className="h-9 w-[55%]" />
          <div className="flex flex-row gap-2 py-2">
            <Skeleton className="h-7 w-[72px] rounded-md" />
            <Skeleton className="h-7 w-[88px] rounded-md" />
          </div>
          <Skeleton className="mt-2 h-8 w-[40%]" />
          <Skeleton className="h-[18px] w-full" />
          <Skeleton className="h-[18px] w-[90%]" />
          <Skeleton className="h-[18px] w-[70%]" />
          <div className="flex flex-row gap-1.5 pt-4">
            <Skeleton className="h-12 w-24 rounded-md" />
            <Skeleton className="h-12 flex-grow rounded-md" />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function SimplePageFallback() {
  return (
    <PageContainer className="py-6 md:py-10">
      <Skeleton className="mb-1 h-10 w-[36%]" />
      <Skeleton className="mb-6 h-[18px] w-[24%]" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-[88px] rounded-lg" />
        <Skeleton className="h-[88px] rounded-lg" />
        <Skeleton className="h-40 rounded-lg" />
      </div>
    </PageContainer>
  );
}

export function RouteFallback() {
  const { pathname } = useLocation();

  return (
    <div>
      <div
        role="progressbar"
        aria-label="Loading page"
        className="h-0.5 w-full overflow-hidden bg-muted"
      >
        <div className="h-full w-full animate-pulse bg-primary/70" />
      </div>
      {pathname.startsWith("/browse") ? (
        <BrowseFallback />
      ) : pathname.startsWith("/products/") ? (
        <ProductDetailsFallback />
      ) : (
        <SimplePageFallback />
      )}
    </div>
  );
}
