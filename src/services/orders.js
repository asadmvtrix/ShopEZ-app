import { supabase } from "../lib/supabase";
import { toUserMessage } from "../lib/errors";

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
