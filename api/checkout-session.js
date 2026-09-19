import Stripe from "stripe";
import { getAdminClient, requireUser, sendJson } from "./_lib/http.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    sendJson(res, 503, { error: "Stripe is not configured on the server." });
    return;
  }

  try {
    const { user } = await requireUser(req);
    const url = new URL(req.url, "http://localhost");
    const sessionId = url.searchParams.get("session_id");
    if (!sessionId) {
      sendJson(res, 400, { error: "Missing session_id." });
      return;
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const orderId = session.metadata?.order_id || session.client_reference_id;

    if (!orderId) {
      sendJson(res, 404, { error: "No order linked to this payment." });
      return;
    }

    const admin = getAdminClient();
    const { data: order, error } = await admin
      .from("orders")
      .select(
        `
        id,
        user_id,
        status,
        total,
        payment_reference,
        payment_brand,
        payment_last4,
        created_at
      `
      )
      .eq("id", orderId)
      .single();

    if (error || !order || order.user_id !== user.id) {
      sendJson(res, 404, { error: "Order not found." });
      return;
    }

    if (session.payment_status === "paid" && order.status === "pending") {
      await admin
        .from("orders")
        .update({
          status: "paid",
          payment_reference: session.id,
        })
        .eq("id", order.id);
      order.status = "paid";
      order.payment_reference = session.id;
    }

    sendJson(res, 200, {
      order: {
        id: order.id,
        status: order.status,
        amount: Number(order.total),
        reference: order.payment_reference || session.id,
        brand: order.payment_brand,
        last4: order.payment_last4,
        paidAt: order.created_at,
      },
      paymentStatus: session.payment_status,
    });
  } catch (error) {
    sendJson(res, error.status || 500, {
      error: error.message || "Could not load payment.",
    });
  }
}
