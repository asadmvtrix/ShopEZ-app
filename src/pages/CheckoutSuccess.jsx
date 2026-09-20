import { useEffect, useState } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import CheckoutProgress from "../components/CheckoutProgress";
import PageContainer from "../components/PageContainer";
import { useCart } from "../context/CartProvider";
import { fetchCheckoutSession } from "../services/stripe";
import { formatPrice } from "../config/store";

function SectionLabel({ children }) {
  return <p className="mb-3 text-sm font-medium text-muted-foreground">{children}</p>;
}

function DetailRow({ label, value, strong = false }) {
  return (
    <div className="flex justify-between gap-4">
      <span className={cn(strong ? "text-base font-semibold" : "text-sm text-muted-foreground")}>
        {label}
      </span>
      <span
        className={cn(
          "text-right break-words",
          strong ? "font-mono text-base font-semibold" : "text-sm"
        )}
      >
        {value}
      </span>
    </div>
  );
}

function shortOrderId(id) {
  if (!id) return "—";
  return String(id).replace(/-/g, "").slice(0, 8).toUpperCase();
}

function formatPaidWith(order) {
  if (order.brand && order.last4) {
    const brand = String(order.brand)
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return `${brand} ·••${order.last4}`;
  }
  if (order.status === "paid") return "Card via Stripe";
  return "Processing";
}

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { clearCart } = useCart();
  const [state, setState] = useState({ loading: true, error: null, order: null });

  useEffect(() => {
    let active = true;

    async function load() {
      if (!sessionId) {
        setState({ loading: false, error: "Missing payment session.", order: null });
        return;
      }

      const result = await fetchCheckoutSession(sessionId);
      if (!active) return;

      if (!result.success) {
        setState({ loading: false, error: result.error, order: null });
        return;
      }

      clearCart();
      setState({ loading: false, error: null, order: result.order });
    }

    void load();
    return () => {
      active = false;
    };
  }, [sessionId, clearCart]);

  if (state.loading) {
    return (
      <PageContainer className="py-6 md:py-10">
        <h1 className="mb-2 text-3xl font-semibold tracking-tight md:text-4xl">Confirmation</h1>
        <CheckoutProgress step={2} />
        <div className="py-12 text-center">
          <Loader2 className="mx-auto size-7 animate-spin text-muted-foreground" aria-hidden />
          <p className="mt-4 text-sm text-muted-foreground">Confirming your payment…</p>
        </div>
      </PageContainer>
    );
  }

  if (state.error || !state.order) {
    return (
      <PageContainer className="py-6 md:py-10">
        <h1 className="mb-2 text-3xl font-semibold tracking-tight md:text-4xl">Confirmation</h1>
        <CheckoutProgress step={2} />
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-[1fr_340px] md:gap-8">
          <div className="rounded-[var(--radius)] border border-border bg-card p-4 sm:p-5">
            <Alert variant="destructive" className="mb-5">
              <AlertDescription>
                {state.error || "Couldn’t confirm this payment."}
              </AlertDescription>
            </Alert>
            <div className="flex flex-col gap-3 sm:flex-row">
              <RouterLink
                to="/account?section=orders"
                className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "inline-flex h-10")}
              >
                Check order history
              </RouterLink>
              <RouterLink
                to="/checkout"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "inline-flex h-10")}
              >
                Back to checkout
              </RouterLink>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  const order = state.order;
  const confirmed = order.status === "paid";
  const placed = order.paidAt
    ? new Date(order.paidAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

  return (
    <PageContainer className="py-6 md:py-10">
      <h1 className="mb-2 text-3xl font-semibold tracking-tight md:text-4xl">
        {confirmed ? "Order confirmed" : "Payment received"}
      </h1>

      <CheckoutProgress step={2} />

      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-[1fr_340px] md:gap-8">
        <div>
          <SectionLabel>Order details</SectionLabel>
          <div className="rounded-[var(--radius)] border border-border bg-card p-4 sm:p-5">
            <p className="mb-5 text-sm text-muted-foreground">
              {confirmed
                ? "Payment went through. Your order is saved in Account → Orders."
                : "Stripe accepted the payment. Status may take a moment to update in your account."}
            </p>

            <div className="flex flex-col gap-3">
              <DetailRow label="Order" value={`#${shortOrderId(order.id)}`} />
              <DetailRow label="Paid with" value={formatPaidWith(order)} />
              <DetailRow label="Placed" value={placed} />
            </div>

            {order.status === "pending" && (
              <Alert className="mt-5">
                <AlertDescription>
                  Final order status may take a moment to update.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        <div className="md:sticky md:top-[88px]">
          <div className="rounded-[var(--radius)] border border-border bg-card p-6">
            <h2 className="text-xl font-semibold tracking-tight sm:text-[1.375rem]">Summary</h2>
            <div className="my-4">
              <DetailRow label="Total paid" value={formatPrice(order.amount)} strong />
            </div>
            <Separator className="mb-4" />
            <div className="flex flex-col gap-3">
              <RouterLink
                to="/account?section=orders"
                className={cn(
                  buttonVariants({ variant: "secondary", size: "lg" }),
                  "inline-flex h-10 w-full"
                )}
              >
                View order history
              </RouterLink>
              <RouterLink
                to="/browse"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "inline-flex h-10 w-full"
                )}
              >
                Continue shopping
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
