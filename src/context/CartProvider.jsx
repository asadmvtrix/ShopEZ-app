import { useCallback, useEffect, useMemo, useState } from "react";
import { CartContext } from "./cart-context";
import { useCatalog } from "./catalog-context";
import { MAX_QUANTITY_PER_ITEM } from "../config/store";
import { readJSON, writeJSON } from "../lib/storage";

const CART_KEY = "shopez.cart";

function clampQuantity(quantity) {
  return Math.min(Math.max(quantity, 1), MAX_QUANTITY_PER_ITEM);
}

function loadCart() {
  const stored = readJSON(CART_KEY, []);
  if (!Array.isArray(stored)) return [];

  return stored
    .filter((entry) => entry && entry.id != null)
    .map((entry) => ({ id: Number(entry.id), quantity: clampQuantity(Number(entry.quantity) || 1) }));
}

export default function CartProvider({ children }) {
  const { getProductById, loading: catalogLoading } = useCatalog();
  const [entries, setEntries] = useState(loadCart);

  useEffect(() => {
    writeJSON(CART_KEY, entries);
  }, [entries]);

  useEffect(() => {
    if (catalogLoading) return;
    setEntries((current) => {
      const next = current.filter((entry) => getProductById(entry.id));
      return next.length === current.length ? current : next;
    });
  }, [catalogLoading, getProductById]);

  const addToCart = useCallback((productId, quantity = 1) => {
    setEntries((current) => {
      const id = Number(productId);
      const existing = current.find((entry) => entry.id === id);
      if (!existing) {
        return [...current, { id, quantity: clampQuantity(quantity) }];
      }
      return current.map((entry) =>
        entry.id === id
          ? { ...entry, quantity: clampQuantity(entry.quantity + quantity) }
          : entry
      );
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    const id = Number(productId);
    setEntries((current) => current.filter((entry) => entry.id !== id));
  }, []);

  const updateQuantity = useCallback(
    (productId, quantity) => {
      const id = Number(productId);
      if (quantity <= 0) {
        removeFromCart(id);
        return;
      }
      setEntries((current) =>
        current.map((entry) =>
          entry.id === id ? { ...entry, quantity: clampQuantity(quantity) } : entry
        )
      );
    },
    [removeFromCart]
  );

  const clearCart = useCallback(() => setEntries([]), []);

  const value = useMemo(() => {
    const items = entries
      .map((entry) => ({ ...entry, product: getProductById(entry.id) }))
      .filter((item) => item.product);

    return {
      items,
      itemCount: items.reduce((count, item) => count + item.quantity, 0),
      subtotal: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
      quantityOf: (productId) => items.find((item) => item.id === Number(productId))?.quantity ?? 0,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    };
  }, [entries, getProductById, addToCart, removeFromCart, updateQuantity, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
