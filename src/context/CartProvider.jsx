import { useCallback, useEffect, useMemo, useState } from "react";
import { CartContext } from "./cart-context";
import { getProductById } from "../data/products";
import { MAX_QUANTITY_PER_ITEM } from "../config/store";
import { readJSON, writeJSON } from "../lib/storage";

const CART_KEY = "shopez.cart";

function clampQuantity(quantity) {
  return Math.min(Math.max(quantity, 1), MAX_QUANTITY_PER_ITEM);
}

function loadCart() {
  const stored = readJSON(CART_KEY, []);
  if (!Array.isArray(stored)) return [];

  // Drop entries whose product has since left the catalogue.
  return stored
    .filter((entry) => entry && getProductById(entry.id))
    .map((entry) => ({ id: entry.id, quantity: clampQuantity(Number(entry.quantity) || 1) }));
}

export default function CartProvider({ children }) {
  const [entries, setEntries] = useState(loadCart);

  useEffect(() => {
    writeJSON(CART_KEY, entries);
  }, [entries]);

  const addToCart = useCallback((productId, quantity = 1) => {
    setEntries((current) => {
      const existing = current.find((entry) => entry.id === productId);
      if (!existing) {
        return [...current, { id: productId, quantity: clampQuantity(quantity) }];
      }
      return current.map((entry) =>
        entry.id === productId
          ? { ...entry, quantity: clampQuantity(entry.quantity + quantity) }
          : entry
      );
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setEntries((current) => current.filter((entry) => entry.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setEntries((current) =>
      current.map((entry) =>
        entry.id === productId ? { ...entry, quantity: clampQuantity(quantity) } : entry
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => setEntries([]), []);

  const value = useMemo(() => {
    const items = entries
      .map((entry) => ({ ...entry, product: getProductById(entry.id) }))
      .filter((item) => item.product);

    return {
      items,
      itemCount: items.reduce((count, item) => count + item.quantity, 0),
      subtotal: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
      quantityOf: (productId) =>
        items.find((item) => item.id === productId)?.quantity ?? 0,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    };
  }, [entries, addToCart, removeFromCart, updateQuantity, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
