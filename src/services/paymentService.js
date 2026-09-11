const ENDPOINT =
  import.meta.env.VITE_PAYMENT_API_URL ?? "https://jsonplaceholder.typicode.com/posts";
const REQUEST_TIMEOUT_MS = 8000;

export class PaymentError extends Error {
  constructor(message, code) {
    super(message);
    this.name = "PaymentError";
    this.code = code;
  }
}

// No real acquirer is wired up, so authorisation is decided here. Card numbers ending
// in these values let us exercise the failure paths without a gateway account.
const DECLINE_CODES = {
  "0000": ["card_declined", "Your card was declined. Try a different payment method."],
  "1111": ["insufficient_funds", "There are not enough funds on this card."],
};

function authorise(last4) {
  const decline = DECLINE_CODES[last4];
  if (decline) {
    throw new PaymentError(decline[1], decline[0]);
  }
}

function reference() {
  const random = crypto.getRandomValues(new Uint32Array(1))[0];
  return `PAY-${Date.now().toString(36)}-${random.toString(36)}`.toUpperCase();
}

export async function submitPayment(order) {
  const last4 = order.card?.last4 ?? "";
  authorise(last4);

  // The order is posted so the flow exercises a real request/response cycle; card
  // numbers and CVVs never leave the browser, only the brand and last four digits.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new PaymentError(
        "The payment service rejected the request. Please try again.",
        `http_${response.status}`
      );
    }

    await response.json();
  } catch (error) {
    if (error instanceof PaymentError) throw error;
    if (error.name === "AbortError") {
      throw new PaymentError("The payment timed out. Check your connection and retry.", "timeout");
    }
    throw new PaymentError("Could not reach the payment service. Please try again.", "network");
  } finally {
    clearTimeout(timeout);
  }

  return {
    reference: reference(),
    status: "approved",
    amount: order.amount,
    brand: order.card?.brand ?? "Card",
    last4,
    paidAt: new Date().toISOString(),
  };
}
