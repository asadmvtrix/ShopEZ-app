import { useLocation } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import PageContainer from "./PageContainer";
import { ProductGridSkeleton } from "./Skeletons";

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

export default function RouteFallback() {
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
