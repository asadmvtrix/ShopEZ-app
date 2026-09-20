import { useMemo, useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import CategoryTiles from "../components/CategoryTiles";
import HomeSkeleton from "../components/Skeletons";
import PageContainer from "../components/PageContainer";
import ProductCard from "../components/ProductCard";
import ProductGrid from "../components/ProductGrid";
import SectionHeader from "../components/SectionHeader";
import StorefrontMasthead from "../components/StorefrontMasthead";
import { useCatalog } from "../context/CatalogProvider";
import { consumeAppEnter, useWarmReveal } from "../hooks/useWarmReveal";

const CARD_SCROLL_STEP = 344;

function pickFrom(products, getProductById, ids, count) {
  const chosen = ids.map((id) => getProductById(id)).filter(Boolean);
  if (chosen.length >= count) return chosen.slice(0, count);
  const filler = products.filter((product) => !chosen.includes(product));
  return [...chosen, ...filler.slice(0, count - chosen.length)];
}

function ColumnToggle({ value, onChange, className }) {
  return (
    <div
      role="group"
      aria-label="Products per row"
      className={cn("inline-flex overflow-hidden rounded-[var(--radius)] border border-border", className)}
    >
      {[2, 3, 4].map((count) => (
        <button
          key={count}
          type="button"
          aria-label={`${count} columns`}
          aria-pressed={value === count}
          onClick={() => onChange(count)}
          className={cn(
            "min-h-10 min-w-10 px-3 text-sm font-medium transition-colors sm:min-h-8 sm:min-w-8",
            "focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring",
            value === count
              ? "bg-primary text-primary-foreground"
              : "bg-card text-foreground hover:bg-muted"
          )}
        >
          {count}
        </button>
      ))}
    </div>
  );
}

export default function Home() {
  const { products, categories, getProductById, loading } = useCatalog();
  const scrollerRef = useRef(null);
  const [columns, setColumns] = useState(4);
  const [fromAuth] = useState(() => consumeAppEnter());
  const ready = useWarmReveal({ fromAuth });

  const { spotlight, quickPicks, popular, remaining } = useMemo(() => {
    const spotlightItems = pickFrom(products, getProductById, [3, 40, 4], 3);
    const quickPickItems = pickFrom(products, getProductById, [11, 31, 24], 3);
    const mastheadIds = new Set(
      [...spotlightItems, ...quickPickItems].map((product) => product.id)
    );
    const popularItems = products.filter((product) => !mastheadIds.has(product.id)).slice(0, 8);
    const popularIds = new Set(popularItems.map((product) => product.id));
    const remainingItems = products.filter(
      (product) => !mastheadIds.has(product.id) && !popularIds.has(product.id)
    );
    return {
      spotlight: spotlightItems,
      quickPicks: quickPickItems,
      popular: popularItems,
      remaining: remainingItems,
    };
  }, [products, getProductById]);

  function scrollBy(direction) {
    scrollerRef.current?.scrollBy({
      left: direction * CARD_SCROLL_STEP,
      behavior: "smooth",
    });
  }

  if (!ready || loading) {
    return <HomeSkeleton />;
  }

  return (
    <>
      <StorefrontMasthead spotlight={spotlight} quickPicks={quickPicks} />

      <PageContainer className="py-8 md:py-12">
        <div className="flex flex-col gap-10 md:gap-14">
          <section>
            <SectionHeader
              title="Popular right now"
              subtitle="The parts moving fastest out of the warehouse this week"
              action={
                <div className="hidden items-center gap-2 sm:flex">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => scrollBy(-1)}
                    aria-label="Scroll left"
                    className="size-10"
                  >
                    <ChevronLeft />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => scrollBy(1)}
                    aria-label="Scroll right"
                    className="size-10"
                  >
                    <ChevronRight />
                  </Button>
                </div>
              }
            />
            <div
              ref={scrollerRef}
              className={cn(
                "grid auto-cols-[78%] grid-flow-col gap-5 overflow-x-auto scroll-smooth pb-3 sm:auto-cols-[44%] md:auto-cols-[26%]",
                "snap-x snap-mandatory [&>*]:snap-start"
              )}
            >
              {popular.map((product) => (
                <ProductCard key={product.id} product={product} imageHeight={170} />
              ))}
            </div>
          </section>

          <section>
            <SectionHeader title="Shop by category" />
            <CategoryTiles />
          </section>

          <section>
            <SectionHeader
              title="More to explore"
              subtitle={`${remaining.length} more products in the catalogue`}
              action={
                <ColumnToggle
                  value={columns}
                  onChange={setColumns}
                  className="hidden md:inline-flex"
                />
              }
            />
            <ProductGrid products={remaining} columns={columns} />
          </section>

          <div className="flex flex-col items-stretch justify-between gap-4 rounded-[var(--radius)] border border-border bg-card p-5 sm:flex-row sm:items-center md:p-8">
            <div>
              <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
                Browse the full catalogue
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {products.length} products across {categories.length} categories, filterable by
                price and category.
              </p>
            </div>
            <RouterLink
              to="/browse"
              className={cn(buttonVariants({ size: "lg" }), "shrink-0 justify-center")}
            >
              View all products
            </RouterLink>
          </div>
        </div>
      </PageContainer>
    </>
  );
}
