import { useMemo } from "react";

export function useProductInfo(product) {
  return useMemo(() => {
    if (!product) {
      return null;
    }

    const rating = (4.2 + (product.id % 5) * 0.1).toFixed(1);
    const reviewCount = 60 + product.id * 17;

    return {
      category: product.category,
      sku: `SE-${String(product.id).padStart(4, "0")}`,
      stockText: "In stock",
      rating,
      reviewCount,
      shipping: "Free delivery in 2-4 business days",
      returns: "30-day return policy",
      warranty: "1-year limited warranty",
    };
  }, [product]);
}
