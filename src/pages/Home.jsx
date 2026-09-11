import { useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CategoryTiles from "../components/CategoryTiles";
import HomeSkeleton from "../components/HomeSkeleton";
import ProductCard from "../components/ProductCard";
import ProductGrid from "../components/ProductGrid";
import SectionHeader from "../components/SectionHeader";
import StorefrontMasthead from "../components/StorefrontMasthead";
import { consumeAppEnter, useWarmReveal } from "../hooks/useWarmReveal";
import { getCategories, getProductById, getProducts } from "../data/products";

const products = getProducts();
const categories = getCategories();

// Chosen for strong product photography. Topping up from the catalogue keeps the
// layout intact if any of these ids are ever removed.
function pick(ids, count) {
  const chosen = ids.map(getProductById).filter(Boolean);
  if (chosen.length >= count) return chosen.slice(0, count);
  const filler = products.filter((product) => !chosen.includes(product));
  return [...chosen, ...filler.slice(0, count - chosen.length)];
}

const spotlight = pick([3, 40, 4], 3);
const quickPicks = pick([11, 31, 24], 3);

const mastheadIds = new Set([...spotlight, ...quickPicks].map((product) => product.id));
const popular = products.filter((product) => !mastheadIds.has(product.id)).slice(0, 8);

const popularIds = new Set(popular.map((product) => product.id));
const remaining = products.filter(
  (product) => !mastheadIds.has(product.id) && !popularIds.has(product.id)
);

const CARD_SCROLL_STEP = 344;

export default function Home() {
  const scrollerRef = useRef(null);
  const [columns, setColumns] = useState(4);
  const [fromAuth] = useState(() => consumeAppEnter());
  const ready = useWarmReveal({ fromAuth });

  function scrollBy(direction) {
    scrollerRef.current?.scrollBy({
      left: direction * CARD_SCROLL_STEP,
      behavior: "smooth",
    });
  }

  if (!ready) {
    return <HomeSkeleton />;
  }

  return (
    <>
      <StorefrontMasthead spotlight={spotlight} quickPicks={quickPicks} />

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Stack spacing={{ xs: 5, md: 7 }}>
          <Box component="section">
            <SectionHeader
              title="Popular right now"
              subtitle="The parts moving fastest out of the warehouse this week"
              action={
                <Stack direction="row" spacing={1} sx={{ display: { xs: "none", sm: "flex" } }}>
                  <IconButton onClick={() => scrollBy(-1)} aria-label="Scroll left" size="small">
                    <ChevronLeftIcon />
                  </IconButton>
                  <IconButton onClick={() => scrollBy(1)} aria-label="Scroll right" size="small">
                    <ChevronRightIcon />
                  </IconButton>
                </Stack>
              }
            />
            <Box
              ref={scrollerRef}
              sx={{
                display: "grid",
                gridAutoFlow: "column",
                gridAutoColumns: { xs: "78%", sm: "44%", md: "26%" },
                gap: 2.5,
                overflowX: "auto",
                scrollSnapType: "x mandatory",
                pb: 1.5,
                "& > *": { scrollSnapAlign: "start" },
              }}
            >
              {popular.map((product) => (
                <ProductCard key={product.id} product={product} imageHeight={170} />
              ))}
            </Box>
          </Box>

          <Box component="section">
            <SectionHeader title="Shop by category" />
            <CategoryTiles />
          </Box>

          <Box component="section">
            <SectionHeader
              title="More to explore"
              subtitle={`${remaining.length} more products in the catalogue`}
              action={
                <ToggleButtonGroup
                  size="small"
                  exclusive
                  value={columns}
                  onChange={(_, value) => value && setColumns(value)}
                  aria-label="Products per row"
                  sx={{ display: { xs: "none", md: "inline-flex" } }}
                >
                  {[2, 3, 4].map((count) => (
                    <ToggleButton key={count} value={count} aria-label={`${count} columns`}>
                      {count}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              }
            />
            <ProductGrid products={remaining} columns={columns} />
          </Box>

          <Paper
            variant="outlined"
            sx={{
              p: { xs: 2.5, md: 4 },
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { sm: "center" },
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h2">Browse the full catalogue</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {products.length} products across {categories.length} categories, filterable by
                price and category.
              </Typography>
            </Box>
            <Button component={RouterLink} to="/browse" variant="contained" size="large">
              View all products
            </Button>
          </Paper>
        </Stack>
      </Container>
    </>
  );
}
