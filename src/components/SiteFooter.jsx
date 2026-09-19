import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import BrandMark from "./BrandMark";
import { useCatalog } from "../context/catalog-context";
import { POLICIES } from "../config/store";

export default function SiteFooter() {
  const { categories } = useCatalog();

  return (
    <Box
      component="footer"
      sx={{
        mt: 8,
        py: 5,
        borderTop: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={4}
          sx={{ justifyContent: "space-between" }}
        >
          <Box sx={{ maxWidth: 280 }}>
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "center", color: "primary.main" }}
            >
              <BrandMark sx={{ fontSize: 26 }} />
              <Typography variant="h6">ShopEZ</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
              Computer hardware, peripherals and audio gear, shipped from verified suppliers.
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Shop
            </Typography>
            <Stack spacing={0.75}>
              {categories.slice(0, 5).map((category) => (
                <Link
                  key={category}
                  component={RouterLink}
                  to={`/browse?category=${encodeURIComponent(category)}`}
                  variant="body2"
                  color="text.primary"
                >
                  {category}
                </Link>
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Buying from us
            </Typography>
            <Stack spacing={0.75}>
              <Typography variant="body2" color="text.secondary">
                {POLICIES.shipping}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {POLICIES.returns}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {POLICIES.warranty}
              </Typography>
            </Stack>
          </Box>
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Typography variant="caption" color="text.secondary">
          © {new Date().getFullYear()} ShopEZ. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}
