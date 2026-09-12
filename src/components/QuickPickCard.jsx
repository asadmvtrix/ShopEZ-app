import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import RemoveIcon from "@mui/icons-material/Remove";
import ProductImage from "./ProductImage";
import { useCart } from "../context/cart-context";
import { MAX_QUANTITY_PER_ITEM, formatPrice } from "../config/store";
import { MONO } from "../theme";
import { confirmPulse, DURATION, EASE } from "../theme/motion";

export default function QuickPickCard({ product }) {
  const { addToCart, quantityOf } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const inCart = quantityOf(product.id);
  const headroom = MAX_QUANTITY_PER_ITEM - inCart;
  const canAdd = headroom > 0;

  const capped = Math.min(quantity, Math.max(headroom, 1));

  function handleAdd() {
    addToCart(product.id, capped);
    setQuantity(1);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1100);
  }

  return (
    <Paper
      variant="outlined"
      sx={{ p: 1.5, display: "flex", gap: 1.5, alignItems: "center" }}
    >
      <Box
        component={RouterLink}
        to={`/products/${product.id}`}
        sx={{ flexShrink: 0, borderRadius: 1, overflow: "hidden", border: 1, borderColor: "divider" }}
      >
        <ProductImage product={product} height={72} imagePadding={0.75} sx={{ width: 72 }} />
      </Box>

      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
        <Typography
          component={RouterLink}
          to={`/products/${product.id}`}
          variant="body2"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            fontWeight: 600,
            color: "text.primary",
            textDecoration: "none",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          {product.name}
        </Typography>
        <Typography variant="h5" sx={{ color: "secondary.main", fontFamily: MONO, mt: 0.25 }}>
          {formatPrice(product.price)}
        </Typography>

        <Stack direction="row" spacing={1} sx={{ alignItems: "center", mt: 1, flexWrap: "wrap" }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
            }}
          >
            <IconButton
              size="small"
              onClick={() => setQuantity((n) => Math.max(1, n - 1))}
              disabled={capped <= 1}
              aria-label={`Decrease quantity of ${product.name}`}
            >
              <RemoveIcon fontSize="inherit" />
            </IconButton>
            <Typography
              variant="body2"
              sx={{ minWidth: 20, textAlign: "center", fontVariantNumeric: "tabular-nums" }}
            >
              {capped}
            </Typography>
            <IconButton
              size="small"
              onClick={() => setQuantity((n) => Math.min(headroom, n + 1))}
              disabled={!canAdd || capped >= headroom}
              aria-label={`Increase quantity of ${product.name}`}
            >
              <AddIcon fontSize="inherit" />
            </IconButton>
          </Box>

          <Button
            variant="contained"
            color="secondary"
            size="small"
            disabled={!canAdd}
            startIcon={justAdded ? <CheckIcon /> : null}
            onClick={handleAdd}
            sx={
              justAdded
                ? {
                    "@media (prefers-reduced-motion: no-preference)": {
                      animation: `${confirmPulse} ${DURATION.normal}ms ${EASE}`,
                    },
                  }
                : undefined
            }
          >
            {!canAdd ? "Max reached" : justAdded ? "Added" : "Add to cart"}
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}
