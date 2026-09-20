import { Link as RouterLink } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import ProductImage from "./ProductImage";
import { useCatalog } from "../context/CatalogProvider";
import { formatPriceShort } from "../config/store";

export default function CategoryTiles() {
  const { categorySummaries } = useCatalog();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
      {categorySummaries.map((summary) => (
        <RouterLink
          key={summary.category}
          to={`/browse?category=${encodeURIComponent(summary.category)}`}
          className={cn(
            "group flex items-center gap-3 rounded-[var(--radius)] border border-border bg-card p-3 text-inherit no-underline",
            "transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          )}
        >
          <ProductImage
            product={{ image: summary.image, name: summary.category }}
            height={60}
            imagePadding={0.75}
            className="w-[60px] shrink-0 rounded-[var(--radius)] border border-border"
          />
          <div className="min-w-0 flex-grow">
            <p className="truncate text-base font-semibold">{summary.category}</p>
            <p className="block truncate text-xs text-muted-foreground">
              {summary.count} {summary.count === 1 ? "product" : "products"}
            </p>
            <p className="block truncate text-xs text-muted-foreground">
              from {formatPriceShort(summary.from)}
            </p>
          </div>
          <ChevronRight
            className={cn(
              "size-4 shrink-0 text-muted-foreground/60 transition-transform duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
              "motion-safe:group-hover:translate-x-1"
            )}
            aria-hidden
          />
        </RouterLink>
      ))}
    </div>
  );
}
