import { useCallback, useState } from "react";
import { createOrder } from "../services/orders";
import { startStripeCheckout } from "../services/stripe";
import { toUserMessage } from "../lib/errors";

export function usePayment() {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const payWithStripe = useCallback(async ({ userId, items }) => {
    setStatus("processing");
    setError(null);

    try {
      const pending = await createOrder({
        userId,
        items,
        status: "pending",
      });

      if (!pending.success) {
        setError(pending.error);
        setStatus("failed");
        return { success: false };
      }

      const session = await startStripeCheckout(pending.order.id);
      if (!session.success) {
        setError(session.error);
        setStatus("failed");
        return { success: false };
      }

      window.location.assign(session.url);
      return { success: true, redirected: true };
    } catch (cause) {
      setError(toUserMessage(cause, "Couldn’t start Stripe Checkout."));
      setStatus("failed");
      return { success: false };
    }
  }, []);

  return {
    payWithStripe,
    error,
    isProcessing: status === "processing",
  };
}
