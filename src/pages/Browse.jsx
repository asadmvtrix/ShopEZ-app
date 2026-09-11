import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Drawer from "@mui/material/Drawer";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import ProductCard from "../components/ProductCard";
import ProductGridSkeleton from "../components/ProductGridSkeleton";
import { getCategories, getProducts } from "../data/products";
import { formatPrice } from "../config/store";
import { consumeAppEnter, useWarmReveal } from "../hooks/useWarmReveal";

const SEARCH_DEBOUNCE_MS = 500;

const allProducts = getProducts();
const categories = getCategories();

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name-asc", label: "Name: A to Z" },
];

const PRICE_RANGES = [
  { id: "all", label: "Any price", min: 0, max: Infinity },
  { id: "under-100", label: "Under $100", min: 0, max: 100 },
  { id: "100-250", label: "$100 to $250", min: 100, max: 250 },
  { id: "250-500", label: "$250 to $500", min: 250, max: 500 },
  { id: "500-1000", label: "$500 to $1,000", min: 500, max: 1000 },
  { id: "over-1000", label: "Over $1,000", min: 1000, max: Infinity },
];

const comparators = {
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  "name-asc": (a, b) => a.name.localeCompare(b.name),
};

const categoryCounts = categories.reduce((counts, category) => {
  counts[category] = allProducts.filter((product) => product.category === category).length;
  return counts;
}, {});

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [columns, setColumns] = useState(3);
  const [fromAuth] = useState(() => consumeAppEnter());
  const ready = useWarmReveal({ fromAuth });

  // The URL is the source of truth so category links, sorting and search survive
  // a refresh or a shared link.
  const category = searchParams.get("category") ?? "All";
  const search = searchParams.get("q") ?? "";
  const sort = searchParams.get("sort") ?? "featured";
  const priceId = searchParams.get("price") ?? "all";
  const priceRange = PRICE_RANGES.find((range) => range.id === priceId) ?? PRICE_RANGES[0];

  // Local draft so typing stays smooth; the URL (and results) update after a pause
  // so slower typists are not cut off mid-word.
  const [searchDraft, setSearchDraft] = useState(search);

  useEffect(() => {
    setSearchDraft(search);
  }, [search]);

  useEffect(() => {
    if (searchDraft === search) return undefined;

    const timer = setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      const trimmed = searchDraft.trim();
      if (trimmed) {
        next.set("q", trimmed);
      } else {
        next.delete("q");
      }
      setSearchParams(next, { replace: true });
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchDraft, search, searchParams, setSearchParams]);

  function commitSearch(value = searchDraft) {
    const trimmed = value.trim();
    const next = new URLSearchParams(searchParams);
    if (trimmed) {
      next.set("q", trimmed);
    } else {
      next.delete("q");
    }
    setSearchDraft(trimmed);
    setSearchParams(next, { replace: true });
  }

  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value === null || value === "All" || value === "all" || value === "") {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next, { replace: true });
  }

  function resetFilters() {
    setSearchDraft("");
    setSearchParams({}, { replace: true });
  }

  const results = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = allProducts.filter((product) => {
      if (category !== "All" && product.category !== category) return false;
      if (product.price < priceRange.min || product.price >= priceRange.max) return false;
      if (!query) return true;
      return (
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      );
    });

    const comparator = comparators[sort];
    return comparator ? [...filtered].sort(comparator) : filtered;
  }, [category, priceRange, search, sort]);

  const activeFilters = [
    category !== "All" && { key: "category", label: category },
    priceId !== "all" && { key: "price", label: priceRange.label },
    search && { key: "q", label: `"${search}"` },
  ].filter(Boolean);

  const clearAllButton = (
    <Button size="small" onClick={resetFilters} disabled={activeFilters.length === 0}>
      Clear all
    </Button>
  );

  // The drawer supplies its own header, so the heading row is desktop-only.
  const renderFilters = (showHeading) => (
    <Stack spacing={3} sx={{ p: { xs: 2, md: 0 } }}>
      {showHeading && (
        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="subtitle2" color="text.secondary">
            Filters
          </Typography>
          {clearAllButton}
        </Stack>
      )}

      <TextField
        label="Search products"
        value={searchDraft}
        onChange={(event) => setSearchDraft(event.target.value)}
        onBlur={() => {
          if (searchDraft.trim() !== search) commitSearch();
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commitSearch();
          }
        }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />

      <Box>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Category
        </Typography>
        <Stack spacing={0.25}>
          {["All", ...categories].map((option) => (
            <Button
              key={option}
              onClick={() => updateParam("category", option)}
              variant={category === option ? "contained" : "text"}
              color={category === option ? "primary" : "inherit"}
              size="small"
              sx={{ justifyContent: "space-between", fontWeight: 500 }}
              fullWidth
            >
              <span>{option}</span>
              <Typography variant="caption" color="inherit" sx={{ opacity: 0.7 }}>
                {option === "All" ? allProducts.length : categoryCounts[option]}
              </Typography>
            </Button>
          ))}
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Price
        </Typography>
        <RadioGroup
          value={priceId}
          onChange={(event) => updateParam("price", event.target.value)}
        >
          {PRICE_RANGES.map((range) => (
            <FormControlLabel
              key={range.id}
              value={range.id}
              control={<Radio size="small" />}
              label={<Typography variant="body2">{range.label}</Typography>}
            />
          ))}
        </RadioGroup>
      </Box>

    </Stack>
  );

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Typography variant="h1" gutterBottom>
        {category === "All" ? "All products" : category}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {results.length} {results.length === 1 ? "product" : "products"}
        {results.length > 0 &&
          ` from ${formatPrice(Math.min(...results.map((p) => p.price)))}`}
      </Typography>

      {activeFilters.length > 0 && (
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap", mt: 2 }}>
          {activeFilters.map((filter) => (
            <Chip
              key={filter.key}
              label={filter.label}
              onDelete={() => {
                if (filter.key === "q") setSearchDraft("");
                updateParam(filter.key, null);
              }}
              size="small"
            />
          ))}
        </Stack>
      )}

      <Box
        sx={{
          display: "grid",
          // minmax(0, …) lets the sidebar honor maxHeight; plain 240px keeps
          // min-height:auto and the panel grows with the filters forever.
          gridTemplateColumns: { xs: "1fr", md: "minmax(0, 240px) minmax(0, 1fr)" },
          gap: { xs: 2, md: 4 },
          mt: 3,
          alignItems: "start",
        }}
      >
        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            display: { xs: "none", md: "block" },
            position: "sticky",
            top: 88,
            alignSelf: "start",
            width: "100%",
            minHeight: 0,
            maxHeight: "calc(100dvh - 104px)",
            overflowY: "auto",
            overscrollBehavior: "contain",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {renderFilters(true)}
        </Paper>

        <Box>
          <Stack
            direction="row"
            spacing={2}
            useFlexGap
            sx={{
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              mb: 2.5,
            }}
          >
            <Button
              startIcon={<FilterListIcon />}
              variant="outlined"
              onClick={() => setFiltersOpen(true)}
              sx={{ display: { md: "none" } }}
            >
              Filters
              {activeFilters.length > 0 ? ` (${activeFilters.length})` : ""}
            </Button>

            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "center", display: { xs: "none", lg: "flex" } }}
            >
              <Typography variant="caption" color="text.secondary">
                Columns
              </Typography>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={columns}
                onChange={(_, value) => value && setColumns(value)}
                aria-label="Products per row"
              >
                {[2, 3, 4].map((count) => (
                  <ToggleButton key={count} value={count} aria-label={`${count} columns`}>
                    {count}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Stack>

            <FormControl
              size="small"
              sx={{
                minWidth: { sm: 200 },
                width: { xs: "100%", sm: "auto" },
                ml: { sm: "auto" },
              }}
            >
              <InputLabel id="sort-label">Sort by</InputLabel>
              <Select
                labelId="sort-label"
                label="Sort by"
                value={sort}
                onChange={(event) => updateParam("sort", event.target.value)}
              >
                {SORT_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {results.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 6, textAlign: "center" }}>
              <Typography variant="h4" gutterBottom>
                Nothing matches those filters
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                Try widening the price range or clearing the search term.
              </Typography>
              <Button variant="contained" onClick={resetFilters}>
                Clear filters
              </Button>
            </Paper>
          ) : !ready ? (
            <ProductGridSkeleton count={9} columns={columns} />
          ) : (
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
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </Box>
          )}
        </Box>
      </Box>

      <Drawer
        anchor="left"
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        sx={{ display: { md: "none" } }}
      >
        <Box sx={{ width: 300, display: "flex", flexDirection: "column", height: "100%" }}>
          <Stack
            direction="row"
            sx={{
              alignItems: "center",
              justifyContent: "space-between",
              p: 2,
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <Typography variant="h6">Filters</Typography>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
              {clearAllButton}
              <IconButton onClick={() => setFiltersOpen(false)} aria-label="Close filters">
                <CloseIcon />
              </IconButton>
            </Stack>
          </Stack>

          <Box sx={{ flexGrow: 1, overflowY: "auto" }}>{renderFilters(false)}</Box>

          <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
            <Button variant="contained" fullWidth onClick={() => setFiltersOpen(false)}>
              Show {results.length} {results.length === 1 ? "product" : "products"}
            </Button>
          </Box>
        </Box>
      </Drawer>
    </Container>
  );
}
