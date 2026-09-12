export const TAX_RATE = 0.08;
export const MAX_QUANTITY_PER_ITEM = 10;
export const SHIPPING_FEE = 9.99;
export const FREE_SHIPPING_THRESHOLD = 99;

export const POLICIES = {
  shipping: "Free delivery in 2-4 business days",
  returns: "30-day returns on unopened items",
  warranty: "1-year limited manufacturer warranty",
};

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatPrice(value) {
  return priceFormatter.format(Number(value) || 0);
}


export function formatPriceShort(value) {
  return formatPrice(value).replace(/\.00$/, "");
}

export function calculateTotals(subtotal) {
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FEE;
  const tax = subtotal * TAX_RATE;

  return {
    subtotal,
    shipping,
    tax,
    total: subtotal + shipping + tax,
  };
}
