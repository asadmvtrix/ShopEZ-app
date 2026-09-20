import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, Navigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  Package,
  ShoppingCart,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import PageContainer from "../components/PageContainer";
import ProductImage from "../components/ProductImage";
import ProductGrid from "../components/ProductGrid";
import SectionHeader from "../components/SectionHeader";
import { useCart } from "../context/CartProvider";
import { useCatalog } from "../context/CatalogProvider";
import { setFlash } from "../lib/flash";
import {
  FREE_SHIPPING_THRESHOLD,
  MAX_QUANTITY_PER_ITEM,
  POLICIES,
  formatPrice,
  formatPriceShort,
} from "../config/store";

function SpecRow({ label, value }) {
  return (
    <div className="flex flex-col justify-between gap-0 py-2 sm:flex-row sm:gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="font-mono text-sm font-medium break-words sm:text-right">{value}</dd>
    </div>
  );
}

function ServiceRow(props) {
  const Icon = props.icon;
  const { title, body } = props;

  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}

function MissingProduct() {
  useEffect(() => {
    setFlash("That product isn’t available.", "error");
  }, []);

  return <Navigate to="/browse" replace />;
}

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart, quantityOf } = useCart();
  const { getProductById, products, getBrand, getHighlights, getSku, loading } = useCatalog();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const product = useMemo(() => getProductById(id), [getProductById, id]);

  const related = useMemo(() => {
    if (!product) return [];
    return products
      .filter((item) => item.category === product.category && item.id !== product.id)
      .slice(0, 4);
  }, [product, products]);

  if (loading) {
    return null;
  }

  if (!product) {
    return <MissingProduct />;
  }

  const brand = getBrand(product);
  const highlights = getHighlights(product);
  const sku = getSku(product);
  const inCart = quantityOf(product.id);
  const remaining = MAX_QUANTITY_PER_ITEM - inCart;
  const categoryPath = `/browse?category=${encodeURIComponent(product.category)}`;
  const selectedQty = Math.min(quantity, Math.max(remaining, 1));
  const qtyItems = Array.from({ length: Math.max(remaining, 1) }, (_, index) => {
    const n = index + 1;
    return { label: String(n), value: String(n) };
  });

  function handleAddToCart() {
    addToCart(product.id, quantity);
    setAdded(true);
  }

  return (
    <PageContainer className="py-5 md:py-10">
      <RouterLink
        to={categoryPath}
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "-ml-2 mb-4 text-muted-foreground"
        )}
      >
        <ArrowLeft data-icon="inline-start" />
        All {product.category}
      </RouterLink>

      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2 md:gap-12">
        <div className="overflow-hidden rounded-[var(--radius)] border border-border bg-card md:sticky md:top-[88px]">
          <ProductImage product={product} height={{ xs: 260, sm: 360, md: 420 }} />
        </div>

        <div>
          <RouterLink
            to={categoryPath}
            className="text-xs font-semibold tracking-wide text-muted-foreground uppercase no-underline hover:underline"
          >
            {product.category}
          </RouterLink>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">
            {product.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="font-mono text-sm text-muted-foreground">{sku}</span>
            <Badge
              variant="outline"
              className="border-success text-success"
            >
              In stock
            </Badge>
          </div>

          <p className="mt-5 font-mono text-2xl font-semibold tracking-tight sm:text-[1.5rem] md:text-[1.75rem]">
            {formatPrice(product.price)}
          </p>
          <p className="text-xs text-muted-foreground">
            {product.price >= FREE_SHIPPING_THRESHOLD
              ? "Qualifies for free delivery"
              : `Free delivery on orders over ${formatPriceShort(FREE_SHIPPING_THRESHOLD)}`}
          </p>

          {highlights.length > 0 && (
            <div className="mt-6 space-y-2">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Key features
              </p>
              <ul className="space-y-2">
                {highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-2.5">
                    <CheckCircle
                      className="mt-0.5 size-4 shrink-0 text-secondary"
                      aria-hidden
                    />
                    <span className="text-sm">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="w-full shrink-0 sm:w-24">
              <Label htmlFor="product-qty" className="mb-1.5">
                Qty
              </Label>
              <Select
                items={qtyItems}
                value={String(selectedQty)}
                onValueChange={(value) => setQuantity(Number(value))}
                disabled={remaining <= 0}
              >
                <SelectTrigger id="product-qty" className="h-10 w-full sm:h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  <SelectGroup>
                    {qtyItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="secondary"
              size="lg"
              onClick={handleAddToCart}
              disabled={remaining <= 0}
              className="w-full flex-grow sm:mt-6 sm:w-auto"
            >
              <ShoppingCart data-icon="inline-start" />
              {remaining <= 0 ? "Maximum quantity in cart" : "Add to cart"}
            </Button>
          </div>

          {added && remaining > 0 && (
            <div
              role="status"
              className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius)] border border-success/30 bg-success/10 px-3 py-2.5 text-sm text-success motion-safe:animate-content-enter"
            >
              <span>Added to your cart.</span>
              <RouterLink
                to="/cart"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "text-success hover:bg-success/15 hover:text-success"
                )}
              >
                View cart
              </RouterLink>
            </div>
          )}

          <div className="mt-6 space-y-3.5 rounded-[var(--radius)] border border-border bg-card p-4">
            <ServiceRow icon={Truck} title="Delivery" body={POLICIES.shipping} />
            <ServiceRow icon={Package} title="Returns" body={POLICIES.returns} />
            <ServiceRow icon={ShieldCheck} title="Warranty" body={POLICIES.warranty} />
          </div>

          <Separator className="my-6" />

          <h2 className="mb-2 text-xl font-semibold tracking-tight sm:text-[1.375rem]">
            Specifications
          </h2>
          <dl className="divide-y divide-border">
            {brand && <SpecRow label="Brand" value={brand} />}
            <SpecRow label="Category" value={product.category} />
            <SpecRow label="Stock code" value={sku} />
            <SpecRow label="Availability" value="In stock" />
            <SpecRow label="Warranty" value={POLICIES.warranty} />
            <SpecRow label="Delivery" value={POLICIES.shipping} />
          </dl>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-10 md:mt-16">
          <SectionHeader title={`More in ${product.category}`} />
          <ProductGrid products={related} columns={4} />
        </div>
      )}
    </PageContainer>
  );
}
