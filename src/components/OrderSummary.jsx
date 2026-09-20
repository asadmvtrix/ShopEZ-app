import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD, TAX_RATE, calculateTotals, formatPrice } from "../config/store";

function Row({ label, value, strong }) {
  return (
    <div className="flex justify-between gap-4">
      <span
        className={cn(
          strong ? "text-base font-semibold text-foreground" : "text-sm text-muted-foreground"
        )}
      >
        {label}
      </span>
      <span className={cn("font-mono", strong ? "text-base font-semibold" : "text-sm")}>
        {value}
      </span>
    </div>
  );
}

export default function OrderSummary({ items, itemised = false, children }) {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const { shipping, tax, total } = calculateTotals(subtotal);
  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;
  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div className="rounded-[var(--radius)] border border-border bg-card p-6">
      <h2 className="mb-2 text-xl font-semibold tracking-tight sm:text-[1.375rem]">
        Order summary
      </h2>

      {itemised && (
        <>
          <ul className="my-4 space-y-2">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between gap-4 text-sm">
                <span className="text-muted-foreground">
                  {item.product.name}
                  <span className="text-muted-foreground/60"> &times;{item.quantity}</span>
                </span>
                <span className="font-mono">
                  {formatPrice(item.product.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <Separator />
        </>
      )}

      <div className="my-4 space-y-2.5">
        <Row label="Subtotal" value={formatPrice(subtotal)} />
        <Row label="Shipping" value={shipping === 0 ? "Free" : formatPrice(shipping)} />
        <Row
          label={`Estimated tax (${Math.round(TAX_RATE * 100)}%)`}
          value={formatPrice(tax)}
        />
      </div>

      <Separator />

      <div className="my-4">
        <Row label="Total" value={formatPrice(total)} strong />
      </div>

      {remainingForFreeShipping > 0 && (
        <div className="mb-4">
          <p className="text-xs text-muted-foreground">
            Add {formatPrice(remainingForFreeShipping)} more for free delivery
          </p>
          <div
            className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(freeShippingProgress)}
            aria-label="Progress toward free delivery"
          >
            <div
              className="h-full rounded-full bg-secondary transition-[width] duration-200"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
