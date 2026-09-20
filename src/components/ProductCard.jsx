import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Check, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ProductImage from "./ProductImage";
import { useCart } from "../context/CartProvider";
import { formatPrice, MAX_QUANTITY_PER_ITEM } from "../config/store";
import { ANIMATE } from "../theme/motion";

export default function ProductCard({ product, imageHeight = 190 }) {
  const { addToCart, quantityOf } = useCart();
  const quantity = quantityOf(product.id);
  const atLimit = quantity >= MAX_QUANTITY_PER_ITEM;
  const [justAdded, setJustAdded] = useState(false);

  function handleAdd() {
    addToCart(product.id);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1100);
  }

  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-[var(--radius)] border border-border bg-card text-card-foreground",
        "transition-[border-color,box-shadow,transform] duration-160",
        "motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-primary motion-safe:hover:shadow-md",
        "[&_.product-card-image_img]:transition-transform [&_.product-card-image_img]:duration-160",
        "motion-safe:hover:[&_.product-card-image_img]:scale-[1.04]"
      )}
    >
      <RouterLink
        to={`/products/${product.id}`}
        className="block rounded-[inherit] text-inherit no-underline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
      >
        <div className="product-card-image">
          <ProductImage product={product} height={imageHeight} />
        </div>
        <div className="px-4 pt-3 pb-2">
          <p className="text-xs text-muted-foreground">{product.category}</p>
          <h3 className="mt-0.5 min-h-[2.7em] text-base leading-[1.35] font-semibold line-clamp-2">
            {product.name}
          </h3>
        </div>
      </RouterLink>

      <div className="flex-grow" />

      <div className="px-4 pb-2">
        <p className="font-mono text-lg font-semibold">{formatPrice(product.price)}</p>
      </div>

      <div className="flex gap-2 px-4 pt-0 pb-4">
        <Button
          variant="secondary"
          size="sm"
          className={cn("w-full", justAdded && ANIMATE.confirmPulse)}
          disabled={atLimit}
          onClick={handleAdd}
        >
          {justAdded ? <Check data-icon="inline-start" /> : <ShoppingCart data-icon="inline-start" />}
          {atLimit
            ? "Max reached"
            : justAdded
              ? "Added"
              : quantity > 0
                ? `In cart (${quantity})`
                : "Add to cart"}
        </Button>
      </div>
    </div>
  );
}
