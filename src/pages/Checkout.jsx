import { useState } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import { Loader2, Lock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import CheckoutProgress from "../components/CheckoutProgress";
import OrderSummary from "../components/OrderSummary";
import PageContainer from "../components/PageContainer";
import { useCart } from "../context/CartProvider";
import { useAuth } from "../context/AuthProvider";
import { isStripeConfigured, usePayment } from "../services/stripe";
import { calculateTotals, formatPrice } from "../config/store";

function SectionLabel({ children }) {
  return <p className="mb-3 text-sm font-medium text-muted-foreground">{children}</p>;
}

export default function Checkout() {
  const { items, subtotal } = useCart();
  const { user } = useAuth();
  const { payWithStripe, error, isProcessing } = usePayment();
  const [searchParams] = useSearchParams();
  const canceled = searchParams.get("canceled") === "1";
  const [localError, setLocalError] = useState(null);

  const { total } = calculateTotals(subtotal);
  const stripeReady = isStripeConfigured;

  async function handleStripePay() {
    setLocalError(null);
    const result = await payWithStripe({ userId: user.id, items });
    if (!result.success) {
      setLocalError(result.error || error);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-10 sm:px-6 md:py-16">
        <div className="rounded-[var(--radius)] border border-border bg-card px-8 py-12 text-center md:px-16 md:py-16">
          <h1 className="text-xl font-semibold tracking-tight sm:text-[1.375rem]">
            There is nothing to pay for
          </h1>
          <p className="mt-2 mb-6 text-sm text-muted-foreground">
            Add something to your cart before checking out.
          </p>
          <RouterLink to="/browse" className={cn(buttonVariants(), "inline-flex")}>
            Browse products
          </RouterLink>
        </div>
      </div>
    );
  }

  return (
    <PageContainer className="py-6 md:py-10">
      <h1 className="mb-2 text-3xl font-semibold tracking-tight md:text-4xl">Checkout</h1>

      <CheckoutProgress step={1} />

      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-[1fr_340px] md:gap-8">
        <div>
          {canceled && (
            <Alert className="mb-6 border-warning/40 text-warning *:data-[slot=alert-description]:text-warning/90">
              <AlertDescription>
                Payment was cancelled. Your cart is still here whenever you’re ready.
              </AlertDescription>
            </Alert>
          )}

          <SectionLabel>Contact</SectionLabel>
          <Field className="mb-6">
            <FieldLabel htmlFor="checkout-email">Email</FieldLabel>
            <Input
              id="checkout-email"
              value={user.email}
              readOnly
              aria-describedby="checkout-email-desc"
              className="h-10"
            />
            <FieldDescription id="checkout-email-desc">
              This email is used for your ShopEZ account and Stripe checkout.
            </FieldDescription>
          </Field>

          <SectionLabel>Payment</SectionLabel>
          <div className="rounded-[var(--radius)] border border-border bg-card p-4 sm:p-5">
            {!stripeReady ? (
              <Alert className="border-warning/40 text-warning *:data-[slot=alert-description]:text-warning/90">
                <AlertDescription>
                  Stripe isn’t configured. Add{" "}
                  <span className="font-mono">VITE_STRIPE_PUBLISHABLE_KEY</span> and the server
                  secrets listed in <span className="font-mono">.env.example</span>, then redeploy.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="mb-3 flex items-center gap-2">
                  <Lock className="size-4 text-muted-foreground" aria-hidden />
                  <h2 className="text-base font-semibold">Pay securely with Stripe</h2>
                </div>
                <p className="mb-5 text-sm text-muted-foreground">
                  You’ll finish on Stripe’s checkout page. In test mode use{" "}
                  <span className="font-mono">4242 4242 4242 4242</span>.
                </p>

                {(localError || error) && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{localError || error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  variant="secondary"
                  size="lg"
                  className="h-10 w-full"
                  disabled={isProcessing}
                  onClick={handleStripePay}
                >
                  {isProcessing ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  ) : (
                    <Lock className="size-4" aria-hidden />
                  )}
                  {isProcessing ? "Redirecting…" : `Pay ${formatPrice(total)}`}
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="md:sticky md:top-[88px] md:max-h-[calc(100vh-112px)] md:overflow-y-auto">
          <OrderSummary items={items} itemised>
            <RouterLink
              to="/cart"
              className={cn(buttonVariants({ variant: "outline" }), "inline-flex w-full")}
            >
              Back to cart
            </RouterLink>
          </OrderSummary>
        </div>
      </div>
    </PageContainer>
  );
}
