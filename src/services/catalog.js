import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { toUserMessage } from "../lib/errors";
import { getProducts as getSeedProducts } from "../data/products";

function mapRow(row) {
  return {
    id: Number(row.id),
    name: row.name,
    category: row.category,
    price: Number(row.price),
    image: row.image,
    description: row.description ?? "",
    stock: row.stock == null ? null : Number(row.stock),
  };
}

export async function fetchCatalog() {
  if (!isSupabaseConfigured || !supabase) {
    return { products: getSeedProducts(), source: "seed", error: null };
  }

  try {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, category, price, image, description, stock")
      .order("id", { ascending: true });

    if (error) {
      return {
        products: getSeedProducts(),
        source: "seed",
        error: toUserMessage(error, "Couldn’t load the catalogue."),
      };
    }

    if (!data?.length) {
      return {
        products: getSeedProducts(),
        source: "seed",
        error: null,
      };
    }

    return { products: data.map(mapRow), source: "supabase", error: null };
  } catch (error) {
    return {
      products: getSeedProducts(),
      source: "seed",
      error: toUserMessage(error, "Couldn’t load the catalogue."),
    };
  }
}
