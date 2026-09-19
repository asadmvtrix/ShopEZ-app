import { supabase } from "../lib/supabase";
import { toUserMessage } from "../lib/errors";
import { calculateTotals } from "../config/store";

function fail(error, fallback = "Couldn’t save your order. Please try again.") {
  return { success: false, error: toUserMessage(error, fallback) };
}

export async function createOrder({ userId, items, payment, status = "pending" }) {
  if (!supabase) {
    return fail("Supabase is not configured.");
  }
  if (!userId) {
    return fail("You must be signed in to place an order.");
  }
  if (!items?.length) {
    return fail("Your cart is empty.");
  }

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );
  const totals = calculateTotals(subtotal);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      status,
      subtotal: Number(totals.subtotal.toFixed(2)),
      shipping: Number(totals.shipping.toFixed(2)),
      tax: Number(totals.tax.toFixed(2)),
      total: Number(totals.total.toFixed(2)),
      payment_reference: payment?.reference ?? null,
      payment_brand: payment?.brand ?? null,
      payment_last4: payment?.last4 ?? null,
    })
    .select("id, created_at, total, payment_reference, payment_brand, payment_last4, status")
    .single();

  if (orderError) return fail(orderError);

  const lines = items.map((item) => ({
    order_id: order.id,
    product_id: item.id,
    product_name: item.product.name,
    unit_price: Number(item.product.price),
    quantity: item.quantity,
    line_total: Number((item.product.price * item.quantity).toFixed(2)),
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(lines);
  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order.id);
    return fail(itemsError);
  }

  return {
    success: true,
    order: {
      id: order.id,
      reference: order.payment_reference,
      amount: Number(order.total),
      brand: order.payment_brand,
      last4: order.payment_last4,
      paidAt: order.created_at,
      status: order.status,
    },
  };
}

export async function listOrders() {
  if (!supabase) {
    return { success: false, error: "Supabase is not configured.", orders: [] };
  }

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      status,
      subtotal,
      shipping,
      tax,
      total,
      payment_reference,
      payment_brand,
      payment_last4,
      created_at,
      order_items (
        id,
        product_id,
        product_name,
        unit_price,
        quantity,
        line_total
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    return { success: false, error: toUserMessage(error, "Couldn’t load orders."), orders: [] };
  }

  const orders = (data ?? []).map((row) => ({
    id: row.id,
    status: row.status,
    subtotal: Number(row.subtotal),
    shipping: Number(row.shipping),
    tax: Number(row.tax),
    total: Number(row.total),
    reference: row.payment_reference,
    brand: row.payment_brand,
    last4: row.payment_last4,
    createdAt: row.created_at,
    items: (row.order_items ?? []).map((item) => ({
      id: item.id,
      productId: item.product_id,
      name: item.product_name,
      unitPrice: Number(item.unit_price),
      quantity: item.quantity,
      lineTotal: Number(item.line_total),
    })),
  }));

  return { success: true, orders, error: null };
}

export function formatOrderStatus(status) {
  switch (status) {
    case "paid":
      return "Paid";
    case "pending":
      return "Awaiting payment";
    case "failed":
      return "Failed";
    case "paid_sandbox":
      return "Paid";
    default:
      return status || "Unknown";
  }
}
