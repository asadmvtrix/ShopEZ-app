import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter, Search, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import PageContainer from "../components/PageContainer";
import ProductCard from "../components/ProductCard";
import { ProductGridSkeleton } from "../components/Skeletons";
import { useCatalog } from "../context/CatalogProvider";
import { formatPrice } from "../config/store";
import { consumeAppEnter, useWarmReveal } from "../hooks/useWarmReveal";

const SEARCH_DEBOUNCE_MS = 500;

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name-asc", label: "Name: A to Z" },
];

const PRICE_RANGES = [
  { id: "all", label: "Any price", min: 0, max: Infinity },
  { id: "under-100", label: "Under $100", min: 0, max: 100 },
  { id: "100-250", label: "$100 to $250", min: 100, max: 250 },
  { id: "250-500", label: "$250 to $500", min: 250, max: 500 },
  { id: "500-1000", label: "$500 to $1,000", min: 500, max: 1000 },
  { id: "over-1000", label: "Over $1,000", min: 1000, max: Infinity },
];

const comparators = {
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  "name-asc": (a, b) => a.name.localeCompare(b.name),
};

const COLUMN_CLASSES = {
  2: "md:grid-cols-2 lg:grid-cols-2",
  3: "md:grid-cols-3 lg:grid-cols-3",
  4: "md:grid-cols-3 lg:grid-cols-4",
};

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

export default function Browse() {
  const {
    products: allProducts,
    categories,
    loading: catalogLoading,
    error: catalogError,
    refresh,
  } = useCatalog();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [columns, setColumns] = useState(3);
  const [fromAuth] = useState(() => consumeAppEnter());
  const ready = useWarmReveal({ fromAuth });

  const categoryCounts = useMemo(
    () =>
      categories.reduce((counts, category) => {
        counts[category] = allProducts.filter((product) => product.category === category).length;
        return counts;
      }, {}),
    [categories, allProducts]
  );

  const category = searchParams.get("category") ?? "All";
  const search = searchParams.get("q") ?? "";
  const sort = searchParams.get("sort") ?? "featured";
  const priceId = searchParams.get("price") ?? "all";
  const priceRange = PRICE_RANGES.find((range) => range.id === priceId) ?? PRICE_RANGES[0];

  const [searchDraft, setSearchDraft] = useState(search);

  useEffect(() => {
    setSearchDraft(search);
  }, [search]);

  useEffect(() => {
    if (searchDraft === search) return undefined;

    const timer = setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      const trimmed = searchDraft.trim();
      if (trimmed) {
        next.set("q", trimmed);
      } else {
        next.delete("q");
      }
      setSearchParams(next, { replace: true });
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchDraft, search, searchParams, setSearchParams]);

  function commitSearch(value = searchDraft) {
    const trimmed = value.trim();
    const next = new URLSearchParams(searchParams);
    if (trimmed) {
      next.set("q", trimmed);
    } else {
      next.delete("q");
    }
    setSearchDraft(trimmed);
    setSearchParams(next, { replace: true });
  }

  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value === null || value === "All" || value === "all" || value === "") {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next, { replace: true });
  }

  function resetFilters() {
    setSearchDraft("");
    setSearchParams({}, { replace: true });
  }

  const results = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = allProducts.filter((product) => {
      if (category !== "All" && product.category !== category) return false;
      if (product.price < priceRange.min || product.price >= priceRange.max) return false;
      if (!query) return true;
      return (
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      );
    });

    const comparator = comparators[sort];
    return comparator ? [...filtered].sort(comparator) : filtered;
  }, [allProducts, category, priceRange, search, sort]);

  const activeFilters = [
    category !== "All" && { key: "category", label: category },
    priceId !== "all" && { key: "price", label: priceRange.label },
    search && { key: "q", label: `"${search}"` },
  ].filter(Boolean);

  const clearAllButton = (
    <Button size="sm" variant="ghost" onClick={resetFilters} disabled={activeFilters.length === 0}>
      Clear all
    </Button>
  );

  const renderFilters = (showHeading) => (
    <div className={cn("flex flex-col gap-6", showHeading ? undefined : "p-4 md:p-0")}>
      {showHeading && (
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-muted-foreground">Filters</p>
          {clearAllButton}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="browse-search">Search products</Label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="browse-search"
            value={searchDraft}
            onChange={(event) => setSearchDraft(event.target.value)}
            onBlur={() => {
              if (searchDraft.trim() !== search) commitSearch();
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                commitSearch();
              }
            }}
            className="h-10 pl-8 md:h-8"
            placeholder="Search products"
          />
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">Category</p>
        <div className="flex flex-col gap-0.5">
          {["All", ...categories].map((option) => {
            const selected = category === option;
            return (
              <Button
                key={option}
                type="button"
                onClick={() => updateParam("category", option)}
                variant={selected ? "default" : "ghost"}
                size="sm"
                className="h-10 w-full justify-between font-medium sm:h-8"
              >
                <span>{option}</span>
                <span className="text-xs opacity-70">
                  {option === "All" ? allProducts.length : categoryCounts[option]}
                </span>
              </Button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground" id="price-filter-label">
          Price
        </p>
        <RadioGroup
          value={priceId}
          onValueChange={(value) => updateParam("price", value)}
          aria-labelledby="price-filter-label"
          className="gap-1"
        >
          {PRICE_RANGES.map((range) => (
            <div key={range.id} className="flex min-h-10 items-center gap-3 sm:min-h-8">
              <RadioGroupItem value={range.id} id={`price-${range.id}`} />
              <Label htmlFor={`price-${range.id}`} className="font-normal">
                {range.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );

  return (
    <PageContainer className="py-6 md:py-10">
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
        {category === "All" ? "All products" : category}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {results.length} {results.length === 1 ? "product" : "products"}
        {results.length > 0 &&
          ` from ${formatPrice(Math.min(...results.map((p) => p.price)))}`}
      </p>

      {activeFilters.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <Badge
              key={filter.key}
              variant="outline"
              className="h-7 gap-1 rounded-full pr-1 font-mono text-xs"
            >
              {filter.label}
              <button
                type="button"
                className="inline-flex size-6 items-center justify-center rounded-full hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
                aria-label={`Remove ${filter.label} filter`}
                onClick={() => {
                  if (filter.key === "q") setSearchDraft("");
                  updateParam(filter.key, null);
                }}
              >
                <X className="size-3.5" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 items-start gap-4 md:grid-cols-[minmax(0,240px)_minmax(0,1fr)] md:gap-8">
        <aside
          className={cn(
            "sticky top-[88px] hidden max-h-[calc(100dvh-104px)] w-full min-h-0 self-start overflow-y-auto overscroll-contain rounded-[var(--radius)] border border-border bg-card p-5 md:block",
            "[-webkit-overflow-scrolling:touch]"
          )}
        >
          {renderFilters(true)}
        </aside>

        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={() => setFiltersOpen(true)}
              className="md:hidden"
            >
              <Filter data-icon="inline-start" />
              Filters
              {activeFilters.length > 0 ? ` (${activeFilters.length})` : ""}
            </Button>

            <div className="hidden items-center gap-2 lg:flex">
              <span className="text-xs text-muted-foreground">Columns</span>
              <ColumnToggle value={columns} onChange={setColumns} />
            </div>

            <div className="ml-0 w-full sm:ml-auto sm:w-auto sm:min-w-[200px]">
              <Label htmlFor="sort-by" className="sr-only">
                Sort by
              </Label>
              <Select
                items={SORT_OPTIONS}
                value={sort}
                onValueChange={(value) => updateParam("sort", value ?? "featured")}
              >
                <SelectTrigger id="sort-by" className="h-10 w-full sm:h-8 sm:w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  <SelectGroup>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {!ready || catalogLoading ? (
            <ProductGridSkeleton count={9} columns={columns} />
          ) : catalogError && allProducts.length === 0 ? (
            <Alert variant="destructive">
              <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span>{catalogError}</span>
                <Button variant="outline" size="sm" onClick={() => void refresh()}>
                  Try again
                </Button>
              </AlertDescription>
            </Alert>
          ) : results.length === 0 ? (
            <div className="rounded-[var(--radius)] border border-border bg-card p-12 text-center">
              <h2 className="mb-2 text-xl font-semibold tracking-tight sm:text-2xl">
                Nothing matches those filters
              </h2>
              <p className="mb-5 text-sm text-muted-foreground">
                Try widening the price range or clearing the search term.
              </p>
              <Button onClick={resetFilters}>Clear filters</Button>
            </div>
          ) : (
            <div
              className={cn(
                "grid grid-cols-1 gap-5 sm:grid-cols-2",
                COLUMN_CLASSES[columns] ?? COLUMN_CLASSES[3]
              )}
            >
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="flex w-[300px] flex-col gap-0 p-0 sm:max-w-[300px]"
        >
          <SheetHeader className="flex-row items-center justify-between space-y-0 border-b border-border p-4">
            <SheetTitle className="text-lg font-semibold">Filters</SheetTitle>
            <div className="flex items-center gap-1">
              {clearAllButton}
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setFiltersOpen(false)}
                aria-label="Close filters"
                className="size-10"
              >
                <X />
              </Button>
            </div>
          </SheetHeader>

          <div className="flex-grow overflow-y-auto">{renderFilters(false)}</div>

          <SheetFooter className="border-t border-border p-4">
            <Button className="w-full" onClick={() => setFiltersOpen(false)}>
              Show {results.length} {results.length === 1 ? "product" : "products"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </PageContainer>
  );
}
