import { cn } from "@/lib/utils";
import ProductCard from "./ProductCard";

const COLUMN_CLASSES = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
};

const MD_COLUMN_CLASSES = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-3",
};

export default function ProductGrid({ products, columns = 4 }) {
  const cols = Math.min(Math.max(columns, 1), 4);

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-5 sm:grid-cols-2",
        MD_COLUMN_CLASSES[cols],
        COLUMN_CLASSES[cols]
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
