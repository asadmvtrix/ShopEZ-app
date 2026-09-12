import { useCallback, useState } from "react";
import { submitPayment } from "../services/paymentService";
import { createOrder } from "../services/orders";
import { toUserMessage } from "../lib/errors";

export function usePayment() {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [receipt, setReceipt] = useState(null);

  const pay = useCallback(async ({ userId, items, orderPayload }) => {
    setStatus("processing");
    setError(null);

    try {
      const payment = await submitPayment(orderPayload);

      const saved = await createOrder({
        userId,
        items,
        payment: {
          reference: payment.reference,
          brand: payment.brand,
          last4: payment.last4,
        },
      });

      if (!saved.success) {
        setError(saved.error);
        setStatus("failed");
        return { success: false };
      }

      const receiptPayload = {
        ...payment,
        orderId: saved.order.id,
        amount: saved.order.amount,
      };

      setReceipt(receiptPayload);
      setStatus("succeeded");
      return { success: true, receipt: receiptPayload };
    } catch (cause) {
      setError(toUserMessage(cause, "Payment failed. Please try again."));
      setStatus("failed");
      return { success: false };
    }
  }, []);

  return {
    pay,
    error,
    receipt,
    isProcessing: status === "processing",
    isComplete: status === "succeeded",
  };
}
