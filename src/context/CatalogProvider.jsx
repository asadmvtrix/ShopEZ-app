import { useCallback, useEffect, useMemo, useState } from "react";
import { CatalogContext } from "./catalog-context";
import { fetchCatalog } from "../services/catalog";
import {
  getBrand,
  getCategories,
  getCategorySummaries,
  getHighlights,
  getSku,
} from "../data/products";

export default function CatalogProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [source, setSource] = useState("loading");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await fetchCatalog();
    setProducts(result.products);
    setSource(result.source);
    setError(result.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const value = useMemo(() => {
    const byId = new Map(products.map((product) => [product.id, product]));

    return {
      products,
      categories: getCategories(products),
      categorySummaries: getCategorySummaries(products),
      loading,
      error,
      source,
      refresh: load,
      getProductById: (id) => byId.get(Number(id)),
      getSku,
      getBrand,
      getHighlights,
    };
  }, [products, loading, error, source, load]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}
