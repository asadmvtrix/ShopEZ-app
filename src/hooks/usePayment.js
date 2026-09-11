import { useCallback, useState } from "react";
import { submitPayment } from "../services/paymentService";
import { toUserMessage } from "../lib/errors";

export function usePayment() {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [receipt, setReceipt] = useState(null);

  const pay = useCallback(async (order) => {
    setStatus("processing");
    setError(null);

    try {
      const result = await submitPayment(order);
      setReceipt(result);
      setStatus("succeeded");
      return { success: true, receipt: result };
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
