import Stripe from "stripe";
import { getAdminClient, sendJson } from "./_lib/http.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    sendJson(res, 503, { error: "Stripe webhook is not configured." });
    return;
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const signature = req.headers["stripe-signature"];

  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    const rawBody = Buffer.concat(chunks);

    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const orderId = session.metadata?.order_id || session.client_reference_id;
      if (orderId) {
        const admin = getAdminClient();
        let brand = null;
        let last4 = null;

        if (session.payment_intent) {
          const intentId =
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent.id;
          const intent = await stripe.paymentIntents.retrieve(intentId, {
            expand: ["payment_method"],
          });
          const card = intent.payment_method?.card;
          brand = card?.brand ? String(card.brand).toUpperCase() : null;
          last4 = card?.last4 || null;
        }

        await admin
          .from("orders")
          .update({
            status: "paid",
            payment_reference: session.id,
            payment_brand: brand,
            payment_last4: last4,
          })
          .eq("id", orderId)
          .in("status", ["pending", "paid"]);
      }
    }

    sendJson(res, 200, { received: true });
  } catch (error) {
    sendJson(res, 400, { error: error.message || "Webhook error." });
  }
}
