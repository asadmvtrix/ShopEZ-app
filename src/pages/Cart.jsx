import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import OrderSummary from "../components/OrderSummary";
import PageContainer from "../components/PageContainer";
import ProductImage from "../components/ProductImage";
import { useCart } from "../context/CartProvider";
import { MAX_QUANTITY_PER_ITEM, formatPrice } from "../config/store";

function EmptyCart() {
  return (
    <div className="rounded-[var(--radius)] border border-border bg-card px-8 py-12 text-center md:px-16 md:py-16">
      <ShoppingCart className="mx-auto size-12 text-muted-foreground/40" aria-hidden />
      <h2 className="mt-3 text-xl font-semibold tracking-tight sm:text-[1.375rem]">
        Your cart is empty
      </h2>
      <p className="mt-2 mb-6 text-sm text-muted-foreground">
        Once you add something it will stay here, even if you close the tab.
      </p>
      <RouterLink
        to="/browse"
        className={cn(buttonVariants({ size: "lg" }), "inline-flex")}
      >
        Browse products
      </RouterLink>
    </div>
  );
}

export default function Cart() {
  const { items, itemCount, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  return (
    <PageContainer className="py-6 md:py-10">
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Your cart</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        {itemCount === 0
          ? "No items yet"
          : `${itemCount} ${itemCount === 1 ? "item" : "items"}`}
      </p>

      {items.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-[1fr_340px] md:gap-8">
          <ul className="flex flex-col gap-4">
            {items.map((item) => (
              <li
                key={item.id}
                className="grid grid-cols-[88px_1fr] items-center gap-4 rounded-[var(--radius)] border border-border bg-card p-4 transition-colors hover:border-primary/40 sm:grid-cols-[112px_1fr_auto]"
              >
                <RouterLink
                  to={`/products/${item.id}`}
                  className="overflow-hidden rounded-[var(--radius)] border border-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <ProductImage
                    product={item.product}
                    height={null}
                    className="aspect-square w-full"
                    imagePadding={0.75}
                  />
                </RouterLink>

                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{item.product.category}</p>
                  <RouterLink
                    to={`/products/${item.id}`}
                    className="block text-base font-semibold text-foreground no-underline hover:underline"
                  >
                    {item.product.name}
                  </RouterLink>
                  <p className="mt-1 font-mono text-sm text-muted-foreground">
                    {formatPrice(item.product.price)} each
                  </p>

                  <div className="mt-3 flex items-center gap-2">
                    <div className="inline-flex items-center rounded-[var(--radius)] border border-border">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        aria-label={`Decrease quantity of ${item.product.name}`}
                        className="size-10 sm:size-7"
                      >
                        <Minus />
                      </Button>
                      <span className="min-w-7 text-center tabular-nums">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= MAX_QUANTITY_PER_ITEM}
                        aria-label={`Increase quantity of ${item.product.name}`}
                        className="size-10 sm:size-7"
                      >
                        <Plus />
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeFromCart(item.id)}
                      aria-label={`Remove ${item.product.name} from cart`}
                      className="size-10 sm:size-7"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>

                <p className="hidden text-right font-mono text-base font-semibold sm:block">
                  {formatPrice(item.product.price * item.quantity)}
                </p>
              </li>
            ))}
          </ul>

          <div className="md:sticky md:top-[88px] md:max-h-[calc(100vh-112px)] md:overflow-y-auto">
            <OrderSummary items={items}>
              <div className="flex flex-col gap-3">
                <Button size="lg" className="w-full" onClick={() => navigate("/checkout")}>
                  Proceed to checkout
                </Button>
                <RouterLink
                  to="/browse"
                  className={cn(buttonVariants({ variant: "outline" }), "w-full")}
                >
                  Continue shopping
                </RouterLink>
              </div>
            </OrderSummary>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
