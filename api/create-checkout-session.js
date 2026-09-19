import Stripe from "stripe";
import { getAdminClient, requireUser, readJson, sendJson, siteOrigin } from "./_lib/http.js";

function toCents(amount) {
  return Math.round(Number(amount) * 100);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    sendJson(res, 503, { error: "Stripe is not configured on the server." });
    return;
  }

  try {
    const { user } = await requireUser(req);
    const body = await readJson(req);
    const orderId = body?.orderId;
    if (!orderId) {
      sendJson(res, 400, { error: "Missing orderId." });
      return;
    }

    const admin = getAdminClient();
    const { data: order, error: orderError } = await admin
      .from("orders")
      .select(
        `
        id,
        user_id,
        status,
        subtotal,
        shipping,
        tax,
        total,
        order_items (
          product_name,
          unit_price,
          quantity
        )
      `
      )
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      sendJson(res, 404, { error: "Order not found." });
      return;
    }

    if (order.user_id !== user.id) {
      sendJson(res, 403, { error: "You don’t own this order." });
      return;
    }

    if (order.status !== "pending") {
      sendJson(res, 409, { error: "This order is no longer awaiting payment." });
      return;
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const origin = siteOrigin(req);

    const lineItems = (order.order_items ?? []).map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: "usd",
        unit_amount: toCents(item.unit_price),
        product_data: { name: item.product_name },
      },
    }));

    if (Number(order.shipping) > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: toCents(order.shipping),
          product_data: { name: "Shipping" },
        },
      });
    }

    if (Number(order.tax) > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: toCents(order.tax),
          product_data: { name: "Tax" },
        },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email,
      line_items: lineItems,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?canceled=1`,
      client_reference_id: order.id,
      metadata: {
        order_id: order.id,
        user_id: user.id,
      },
      payment_intent_data: {
        metadata: {
          order_id: order.id,
          user_id: user.id,
        },
      },
    });

    await admin
      .from("orders")
      .update({ payment_reference: session.id })
      .eq("id", order.id);

    sendJson(res, 200, { url: session.url, sessionId: session.id });
  } catch (error) {
    sendJson(res, error.status || 500, {
      error: error.message || "Could not start checkout.",
    });
  }
}
