import Box from "@mui/material/Box";
import ProductCardSkeleton from "./ProductCardSkeleton";

export default function ProductGridSkeleton({ count = 8, columns = 4, imageHeight = 190 }) {
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
      aria-busy="true"
      aria-label="Loading products"
    >
      {Array.from({ length: count }, (_, index) => (
        <ProductCardSkeleton key={index} imageHeight={imageHeight} />
      ))}
    </Box>
  );
}
