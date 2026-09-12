import { useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import LinearProgress from "@mui/material/LinearProgress";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import ProductGridSkeleton from "./ProductGridSkeleton";

function BrowseFallback() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Skeleton animation="wave" width="42%" height={40} sx={{ mb: 1 }} />
      <Skeleton animation="wave" width="28%" height={18} sx={{ mb: 3 }} />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "minmax(0, 240px) minmax(0, 1fr)" },
          gap: { xs: 2, md: 4 },
          alignItems: "start",
        }}
      >
        <Box sx={{ display: { xs: "none", md: "block" } }}>
          <Skeleton animation="wave" variant="rounded" height={420} />
        </Box>
        <Box>
          <Skeleton animation="wave" variant="rounded" height={40} sx={{ mb: 2.5, maxWidth: 280 }} />
          <ProductGridSkeleton count={9} columns={3} />
        </Box>
      </Box>
    </Container>
  );
}

function ProductDetailsFallback() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Skeleton animation="wave" width={160} height={20} sx={{ mb: 3 }} />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: { xs: 3, md: 5 },
        }}
      >
        <Skeleton animation="wave" variant="rounded" sx={{ minHeight: { xs: 280, md: 420 } }} />
        <Stack spacing={1.5}>
          <Skeleton animation="wave" width="30%" height={16} />
          <Skeleton animation="wave" width="88%" height={36} />
          <Skeleton animation="wave" width="55%" height={36} />
          <Stack direction="row" spacing={1} sx={{ py: 1 }}>
            <Skeleton animation="wave" variant="rounded" width={72} height={28} />
            <Skeleton animation="wave" variant="rounded" width={88} height={28} />
          </Stack>
          <Skeleton animation="wave" width="40%" height={32} sx={{ mt: 1 }} />
          <Skeleton animation="wave" height={18} />
          <Skeleton animation="wave" height={18} width="90%" />
          <Skeleton animation="wave" height={18} width="70%" />
          <Stack direction="row" spacing={1.5} sx={{ pt: 2 }}>
            <Skeleton animation="wave" variant="rounded" width={96} height={48} />
            <Skeleton animation="wave" variant="rounded" height={48} sx={{ flexGrow: 1 }} />
          </Stack>
        </Stack>
      </Box>
    </Container>
  );
}

function SimplePageFallback() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Skeleton animation="wave" width="36%" height={40} sx={{ mb: 1 }} />
      <Skeleton animation="wave" width="24%" height={18} sx={{ mb: 3 }} />
      <Stack spacing={2}>
        <Skeleton animation="wave" variant="rounded" height={88} />
        <Skeleton animation="wave" variant="rounded" height={88} />
        <Skeleton animation="wave" variant="rounded" height={160} />
      </Stack>
    </Container>
  );
}


export default function RouteFallback() {
  const { pathname } = useLocation();

  return (
    <Box>
      <LinearProgress aria-label="Loading page" />
      {pathname.startsWith("/browse") ? (
        <BrowseFallback />
      ) : pathname.startsWith("/products/") ? (
        <ProductDetailsFallback />
      ) : (
        <SimplePageFallback />
      )}
    </Box>
  );
}
