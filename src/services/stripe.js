import { supabase } from "../lib/supabase";
import { toUserMessage } from "../lib/errors";

export const isStripeConfigured = Boolean(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.trim());

async function authHeaders() {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) {
    throw new Error("Sign in required.");
  }
  return {
    Authorization: `Bearer ${data.session.access_token}`,
    "Content-Type": "application/json",
  };
}

export async function startStripeCheckout(orderId) {
  try {
    const headers = await authHeaders();
    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers,
      body: JSON.stringify({ orderId }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        success: false,
        error: toUserMessage(payload.error, "Couldn’t start Stripe Checkout."),
      };
    }
    if (!payload.url) {
      return { success: false, error: "Stripe did not return a checkout URL." };
    }
    return { success: true, url: payload.url };
  } catch (error) {
    return { success: false, error: toUserMessage(error, "Couldn’t start Stripe Checkout.") };
  }
}

export async function fetchCheckoutSession(sessionId) {
  try {
    const headers = await authHeaders();
    const response = await fetch(
      `/api/checkout-session?session_id=${encodeURIComponent(sessionId)}`,
      { headers }
    );
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        success: false,
        error: toUserMessage(payload.error, "Couldn’t confirm payment."),
      };
    }
    return { success: true, ...payload };
  } catch (error) {
    return { success: false, error: toUserMessage(error, "Couldn’t confirm payment.") };
  }
}
