import { useCallback, useState } from "react";
import { startStripeCheckout } from "../services/stripe";
import { toUserMessage } from "../lib/errors";

export function usePayment() {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const payWithStripe = useCallback(async ({ items }) => {
    setStatus("processing");
    setError(null);

    try {
      const session = await startStripeCheckout(items);
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
