import Stripe from "stripe";
import {
  getAdminClient,
  requireUser,
  readJson,
  sendJson,
  siteOrigin,
} from "./_lib/http.js";

const TAX_RATE = 0.08;
const SHIPPING_FEE = 9.99;
const FREE_SHIPPING_THRESHOLD = 99;

function toCents(amount) {
  return Math.round(Number(amount) * 100);
}

function calculateTotals(subtotal) {
  const shipping =
    subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FEE;
  const tax = subtotal * TAX_RATE;
  return {
    subtotal,
    shipping,
    tax,
    total: subtotal + shipping + tax,
  };
}

function normalizeItems(raw) {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  return raw
    .map((item) => {
      const product = item?.product || {};
      const productId = Number(item?.id ?? product.id);
      const name = String(product.name || item?.product_name || "").trim();
      const unitPrice = Number(product.price ?? item?.unit_price);
      const quantity = Number(item?.quantity);
      if (!name || !Number.isFinite(unitPrice) || unitPrice < 0) return null;
      if (!Number.isFinite(quantity) || quantity < 1) return null;
      return {
        product_id: Number.isFinite(productId) ? productId : null,
        product_name: name,
        unit_price: unitPrice,
        quantity: Math.min(Math.floor(quantity), 10),
        line_total: Number((unitPrice * Math.min(Math.floor(quantity), 10)).toFixed(2)),
      };
    })
    .filter(Boolean);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    sendJson(res, 503, { error: "Stripe secret key is missing on the server." });
    return;
  }

  try {
    const { user } = await requireUser(req);
    const body = await readJson(req);
    const lines = normalizeItems(body?.items);

    if (!lines.length) {
      sendJson(res, 400, { error: "Your cart is empty." });
      return;
    }

    const subtotal = lines.reduce((sum, line) => sum + line.line_total, 0);
    const totals = calculateTotals(subtotal);
    const admin = getAdminClient();

    const { data: order, error: orderError } = await admin
      .from("orders")
      .insert({
        user_id: user.id,
        status: "pending",
        subtotal: Number(totals.subtotal.toFixed(2)),
        shipping: Number(totals.shipping.toFixed(2)),
        tax: Number(totals.tax.toFixed(2)),
        total: Number(totals.total.toFixed(2)),
      })
      .select("id, user_id, status, subtotal, shipping, tax, total")
      .single();

    if (orderError || !order) {
      sendJson(res, 500, {
        error: orderError?.message || "Could not create the order.",
      });
      return;
    }

    const { error: itemsError } = await admin.from("order_items").insert(
      lines.map((line) => ({
        order_id: order.id,
        product_id: line.product_id,
        product_name: line.product_name,
        unit_price: line.unit_price,
        quantity: line.quantity,
        line_total: line.line_total,
      }))
    );

    if (itemsError) {
      await admin.from("orders").delete().eq("id", order.id);
      sendJson(res, 500, {
        error: itemsError.message || "Could not save order items.",
      });
      return;
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const origin = siteOrigin(req);

    const lineItems = lines.map((item) => ({
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
