import { useState } from "react";
import { submitPayment } from "../services/paymentService";

export function usePayment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(null);

  async function processPayment(payload) {
    setPaymentError("");
    setPaymentSuccess(null);
    setIsProcessing(true);

    try {
      const result = await submitPayment(payload);
      setPaymentSuccess(result);
      return { success: true, result };
    } catch (error) {
      setPaymentError(error.message || "Payment failed.");
      return { success: false };
    } finally {
      setIsProcessing(false);
    }
  }

  function resetPaymentState() {
    setPaymentError("");
    setPaymentSuccess(null);
  }

  return {
    isProcessing,
    paymentError,
    paymentSuccess,
    processPayment,
    resetPaymentState,
  };
}
