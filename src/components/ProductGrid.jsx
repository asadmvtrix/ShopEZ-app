import Box from "@mui/material/Box";
import ProductCard from "./ProductCard";

export default function ProductGrid({ products, columns = 4 }) {
  return (
    <Box
      sx={{
        display: "grid",
        gap: 2.5,
        gridTemplateColumns: {
          xs: "repeat(1, 1fr)",
          sm: "repeat(2, 1fr)",
          md: `repeat(${Math.min(columns, 3)}, 1fr)`,
          lg: `repeat(${columns}, 1fr)`,
        },
      }}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </Box>
  );
}
