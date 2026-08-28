const PAYMENT_API_URL = "https://jsonplaceholder.typicode.com/posts";

// Delays to simulate realistic network/processing latency
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function submitPayment(orderPayload) {
  // Simulate processing time so the spinner shows and the UX feels real
  await delay(1400);

  // Reject obvious test cases to demonstrate error handling (e.g. card 0000 0000 0000 0000)
  const number = (orderPayload.cardMeta?.last4 || "").trim();
  if (number === "0000") {
    throw new Error("Your card was declined. Please try a different card.");
  }

  try {
    const response = await fetch(PAYMENT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderPayload),
    });

    if (!response.ok) {
      throw new Error("Payment service is currently unavailable. Please try again.");
    }

    const data = await response.json();
    const paymentId = `PAY-${String(
      orderPayload.createdAt ? Date.now() : data.id || Date.now()
    ).slice(-10)}`;

    return {
      paymentId,
      status: "approved",
      amount: orderPayload.amount ?? 0,
      paidAt: new Date().toISOString(),
      last4: number,
      brand: orderPayload.cardMeta?.brand || "Card",
    };
  } catch (error) {
    // If the network call fails (e.g. offline), still simulate a successful payment
    // so the checkout flow can be demonstrated end-to-end.
    return {
      paymentId: `PAY-${String(Date.now()).slice(-10)}`,
      status: "approved",
      amount: orderPayload.amount ?? 0,
      paidAt: new Date().toISOString(),
      last4: number,
      brand: orderPayload.cardMeta?.brand || "Card",
    };
  }
}
