import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Headphones,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ProductImage from "./ProductImage";
import QuickPickCard from "./QuickPickCard";
import PageContainer from "./PageContainer";
import { getHighlights } from "../data/products";
import { FREE_SHIPPING_THRESHOLD, formatPrice, formatPriceShort } from "../config/store";
import { ANIMATE } from "../theme/motion";

const services = [
  {
    icon: Truck,
    text: `Free delivery over ${formatPriceShort(FREE_SHIPPING_THRESHOLD)}`,
  },
  { icon: ShieldCheck, text: "Authorised distributors only" },
  { icon: Headphones, text: "Build advice within one business day" },
];

function ServiceStrip() {
  return (
    <div className="border-b border-border bg-card">
      <PageContainer>
        <div className="flex flex-wrap justify-start gap-x-4 gap-y-1 py-2.5 sm:gap-x-8 md:justify-center">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.text}
                className="flex items-center gap-1.5 text-muted-foreground"
              >
                <Icon className="size-[18px] shrink-0" aria-hidden />
                <span className="text-xs">{service.text}</span>
              </div>
            );
          })}
        </div>
      </PageContainer>
    </div>
  );
}

export default function StorefrontMasthead({ spotlight, quickPicks }) {
  const [index, setIndex] = useState(0);

  if (!spotlight?.length) return <ServiceStrip />;

  const slideCount = spotlight.length;
  const active = spotlight[Math.min(index, slideCount - 1)];
  const step = (delta) => setIndex((current) => (current + delta + slideCount) % slideCount);

  const strapline = getHighlights(active)[0];

  return (
    <section>
      <ServiceStrip />

      <PageContainer className="pt-2.5 md:pt-4">
          <div className="relative rounded-[var(--radius)] border border-border bg-card px-2.5 pt-3.5 pb-5 sm:px-12 sm:pt-5 sm:pb-6 md:px-16 md:pt-5 md:pb-6">
          <div
            key={active.id}
            className={cn(
              "grid grid-cols-1 items-center gap-6 md:grid-cols-[1.1fr_0.9fr] md:gap-10",
              ANIMATE.contentEnter
            )}
          >
            <div>
              <p className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {active.category}
              </p>
              <h1 className="text-[1.85rem] leading-tight font-semibold tracking-tight sm:text-[2.35rem] md:text-[2.8rem]">
                {active.name}
              </h1>
              {strapline ? (
                <p className="mt-4 max-w-[460px] text-muted-foreground">{strapline}.</p>
              ) : null}
              <div className="mt-6 flex flex-row flex-wrap items-center gap-x-4 gap-y-1.5">
                <RouterLink
                  to={`/products/${active.id}`}
                  className={cn(buttonVariants({ variant: "secondary", size: "lg" }))}
                >
                  Shop now
                </RouterLink>
                <p className="font-mono text-xl font-semibold md:text-[1.375rem]">
                  {formatPrice(active.price)}
                </p>
              </div>
            </div>

            <ProductImage
              product={active}
              height={null}
              className="aspect-[4/3] w-full rounded-[var(--radius)]"
            />
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => step(-1)}
            aria-label="Previous product"
            className="absolute top-1/2 left-2.5 hidden size-10 -translate-y-1/2 bg-card md:left-4 sm:inline-flex"
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => step(1)}
            aria-label="Next product"
            className="absolute top-1/2 right-2.5 hidden size-10 -translate-y-1/2 bg-card md:right-4 sm:inline-flex"
          >
            <ChevronRight />
          </Button>

          <div className="absolute right-0 bottom-4 left-0 flex justify-center gap-2">
            {spotlight.map((product, slide) => (
              <button
                key={product.id}
                type="button"
                onClick={() => setIndex(slide)}
                aria-label={`Show ${product.name}`}
                aria-current={slide === index ? "true" : undefined}
                className={cn(
                  "h-1.5 rounded-full transition-[width,background-color] duration-150",
                  slide === index ? "w-[26px] bg-secondary" : "w-3.5 bg-border"
                )}
              />
            ))}
          </div>
        </div>

        <div className="mt-1.5 grid grid-cols-1 gap-1.5 sm:mt-2 sm:gap-4 md:grid-cols-3">
          {quickPicks.map((product) => (
            <QuickPickCard key={product.id} product={product} />
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
