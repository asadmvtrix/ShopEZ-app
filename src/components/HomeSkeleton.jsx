import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import ProductCardSkeleton from "./ProductCardSkeleton";
import ProductGridSkeleton from "./ProductGridSkeleton";

export default function HomeSkeleton() {
  return (
    <Box aria-busy="true" aria-label="Loading storefront">
      <Box sx={{ bgcolor: "action.hover", px: { xs: 2, md: 0 }, py: { xs: 3, md: 5 } }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1.4fr 1fr" },
              gap: 3,
            }}
          >
            <Skeleton animation="wave" variant="rounded" sx={{ minHeight: { xs: 220, md: 360 } }} />
            <Stack spacing={1.5}>
              <Skeleton animation="wave" variant="rounded" height={110} />
              <Skeleton animation="wave" variant="rounded" height={110} />
              <Skeleton animation="wave" variant="rounded" height={110} />
            </Stack>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Skeleton animation="wave" width="40%" height={32} sx={{ mb: 1 }} />
        <Skeleton animation="wave" width="55%" height={18} sx={{ mb: 3 }} />
        <Box
          sx={{
            display: "grid",
            gridAutoFlow: "column",
            gridAutoColumns: { xs: "78%", sm: "44%", md: "26%" },
            gap: 2.5,
            overflow: "hidden",
            mb: 6,
          }}
        >
          {Array.from({ length: 4 }, (_, index) => (
            <ProductCardSkeleton key={index} imageHeight={170} />
          ))}
        </Box>

        <Skeleton animation="wave" width="34%" height={32} sx={{ mb: 2.5 }} />
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" },
            mb: 6,
          }}
        >
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} animation="wave" variant="rounded" height={88} />
          ))}
        </Box>

        <Skeleton animation="wave" width="36%" height={32} sx={{ mb: 1 }} />
        <Skeleton animation="wave" width="48%" height={18} sx={{ mb: 3 }} />
        <ProductGridSkeleton count={8} columns={4} />
      </Container>
    </Box>
  );
}
