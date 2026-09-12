import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, Navigate, useParams } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Collapse from "@mui/material/Collapse";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import AssignmentReturnOutlinedIcon from "@mui/icons-material/AssignmentReturnOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import ProductImage from "../components/ProductImage";
import ProductGrid from "../components/ProductGrid";
import SectionHeader from "../components/SectionHeader";
import { useCart } from "../context/cart-context";
import { useCatalog } from "../context/catalog-context";
import { setFlash } from "../lib/flash";
import {
  FREE_SHIPPING_THRESHOLD,
  MAX_QUANTITY_PER_ITEM,
  POLICIES,
  formatPrice,
  formatPriceShort,
} from "../config/store";
import { MONO } from "../theme";

function SpecRow({ label, value }) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={{ xs: 0, sm: 2 }}
      sx={{ justifyContent: "space-between", py: 1 }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{ fontWeight: 500, textAlign: { sm: "right" }, wordBreak: "break-word" }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

function ServiceRow(props) {
  const Icon = props.icon;
  const { title, body } = props;

  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
      <Icon fontSize="small" sx={{ color: "text.secondary", mt: 0.25, flexShrink: 0 }} />
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {body}
        </Typography>
      </Box>
    </Stack>
  );
}

function MissingProduct() {
  useEffect(() => {
    setFlash("That product isn’t available.", "error");
  }, []);

  return <Navigate to="/browse" replace />;
}

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart, quantityOf } = useCart();
  const { getProductById, products, getBrand, getHighlights, getSku, loading } = useCatalog();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const product = useMemo(() => getProductById(id), [getProductById, id]);

  const related = useMemo(() => {
    if (!product) return [];
    return products
      .filter((item) => item.category === product.category && item.id !== product.id)
      .slice(0, 4);
  }, [product, products]);

  if (loading) {
    return null;
  }

  if (!product) {
    return <MissingProduct />;
  }

  const brand = getBrand(product);
  const highlights = getHighlights(product);
  const sku = getSku(product);
  const inCart = quantityOf(product.id);
  const remaining = MAX_QUANTITY_PER_ITEM - inCart;
  const categoryPath = `/browse?category=${encodeURIComponent(product.category)}`;

  function handleAddToCart() {
    addToCart(product.id, quantity);
    setAdded(true);
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2.5, md: 5 } }}>
      <Button
        component={RouterLink}
        to={categoryPath}
        startIcon={<ArrowBackIcon />}
        size="small"
        color="inherit"
        sx={{ ml: -1, mb: 2, color: "text.secondary" }}
      >
        All {product.category}
      </Button>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: { xs: 3, md: 6 },
          alignItems: "start",
        }}
      >
        <Paper
          variant="outlined"
          sx={{ overflow: "hidden", position: { md: "sticky" }, top: 88 }}
        >
          <ProductImage product={product} height={{ xs: 260, sm: 360, md: 420 }} />
        </Paper>

        <Box>
          <Link
            component={RouterLink}
            to={categoryPath}
            variant="subtitle2"
            color="text.secondary"
          >
            {product.category}
          </Link>

          <Typography variant="h1" sx={{ mt: 0.5 }}>
            {product.name}
          </Typography>

          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", flexWrap: "wrap", mt: 1.5 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: MONO }}>
              {sku}
            </Typography>
            <Chip label="In stock" color="success" size="small" variant="outlined" />
          </Stack>

          <Typography variant="h2" sx={{ mt: 2.5, fontFamily: MONO }}>
            {formatPrice(product.price)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {product.price >= FREE_SHIPPING_THRESHOLD
              ? "Qualifies for free delivery"
              : `Free delivery on orders over ${formatPriceShort(FREE_SHIPPING_THRESHOLD)}`}
          </Typography>

          {highlights.length > 0 && (
            <Stack spacing={1} sx={{ mt: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Key features
              </Typography>
              {highlights.map((highlight) => (
                <Stack key={highlight} direction="row" spacing={1.25} sx={{ alignItems: "flex-start" }}>
                  <CheckCircleOutlineIcon
                    fontSize="small"
                    color="secondary"
                    sx={{ mt: 0.25, flexShrink: 0 }}
                  />
                  <Typography variant="body2">{highlight}</Typography>
                </Stack>
              ))}
            </Stack>
          )}

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ alignItems: { sm: "flex-start" }, mt: 3 }}
          >
            <TextField
              select
              label="Qty"
              size="small"
              value={Math.min(quantity, Math.max(remaining, 1))}
              onChange={(event) => setQuantity(Number(event.target.value))}
              disabled={remaining <= 0}
              sx={{ width: { xs: "100%", sm: 96 }, flexShrink: 0 }}
            >
              {Array.from({ length: Math.max(remaining, 1) }, (_, index) => index + 1).map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </TextField>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              startIcon={<AddShoppingCartIcon />}
              onClick={handleAddToCart}
              disabled={remaining <= 0}
              sx={{ flexGrow: 1, width: { xs: "100%", sm: "auto" } }}
            >
              {remaining <= 0 ? "Maximum quantity in cart" : "Add to cart"}
            </Button>
          </Stack>

          <Collapse in={added && remaining > 0}>
            <Alert
              severity="success"
              sx={{ mt: 2 }}
              action={
                <Button component={RouterLink} to="/cart" size="small" color="inherit">
                  View cart
                </Button>
              }
            >
              Added to your cart.
            </Alert>
          </Collapse>

          <Paper variant="outlined" sx={{ p: 2, mt: 3 }}>
            <Stack spacing={1.75}>
              <ServiceRow
                icon={LocalShippingOutlinedIcon}
                title="Delivery"
                body={POLICIES.shipping}
              />
              <ServiceRow
                icon={AssignmentReturnOutlinedIcon}
                title="Returns"
                body={POLICIES.returns}
              />
              <ServiceRow
                icon={VerifiedUserOutlinedIcon}
                title="Warranty"
                body={POLICIES.warranty}
              />
            </Stack>
          </Paper>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h3" gutterBottom>
            Specifications
          </Typography>
          <Stack divider={<Divider flexItem />}>
            {brand && <SpecRow label="Brand" value={brand} />}
            <SpecRow label="Category" value={product.category} />
            <SpecRow label="Stock code" value={sku} />
            <SpecRow label="Availability" value="In stock" />
            <SpecRow label="Warranty" value={POLICIES.warranty} />
            <SpecRow label="Delivery" value={POLICIES.shipping} />
          </Stack>
        </Box>
      </Box>

      {related.length > 0 && (
        <Box sx={{ mt: { xs: 5, md: 9 } }}>
          <SectionHeader title={`More in ${product.category}`} />
          <ProductGrid products={related} columns={4} />
        </Box>
      )}
    </Container>
  );
}
