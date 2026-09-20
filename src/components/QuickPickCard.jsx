import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Check, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ProductImage from "./ProductImage";
import { useCart } from "../context/CartProvider";
import { MAX_QUANTITY_PER_ITEM, formatPrice } from "../config/store";
import { ANIMATE } from "../theme/motion";

export default function QuickPickCard({ product }) {
  const { addToCart, quantityOf } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const inCart = quantityOf(product.id);
  const headroom = MAX_QUANTITY_PER_ITEM - inCart;
  const canAdd = headroom > 0;

  const capped = Math.min(quantity, Math.max(headroom, 1));

  function handleAdd() {
    addToCart(product.id, capped);
    setQuantity(1);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1100);
  }

  return (
    <div className="flex items-center gap-3 rounded-[var(--radius)] border border-border bg-card p-3">
      <RouterLink
        to={`/products/${product.id}`}
        className="shrink-0 overflow-hidden rounded-[var(--radius)] border border-border"
      >
        <ProductImage
          product={product}
          height={72}
          imagePadding={0.75}
          className="w-[72px]"
        />
      </RouterLink>

      <div className="min-w-0 flex-grow">
        <RouterLink
          to={`/products/${product.id}`}
          className="line-clamp-2 text-sm font-semibold text-foreground no-underline hover:underline"
        >
          {product.name}
        </RouterLink>
        <p className="mt-0.5 font-mono text-xl font-semibold text-secondary">
          {formatPrice(product.price)}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center rounded-[var(--radius)] border border-border">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setQuantity((n) => Math.max(1, n - 1))}
              disabled={capped <= 1}
              aria-label={`Decrease quantity of ${product.name}`}
              className="size-10 sm:size-7"
            >
              <Minus />
            </Button>
            <span className="min-w-5 text-center text-sm tabular-nums">{capped}</span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setQuantity((n) => Math.min(headroom, n + 1))}
              disabled={!canAdd || capped >= headroom}
              aria-label={`Increase quantity of ${product.name}`}
              className="size-10 sm:size-7"
            >
              <Plus />
            </Button>
          </div>

          <Button
            variant="secondary"
            size="sm"
            disabled={!canAdd}
            onClick={handleAdd}
            className={cn(justAdded && ANIMATE.confirmPulse)}
          >
            {justAdded ? <Check data-icon="inline-start" /> : null}
            {!canAdd ? "Max reached" : justAdded ? "Added" : "Add to cart"}
          </Button>
        </div>
      </div>
    </div>
  );
}
