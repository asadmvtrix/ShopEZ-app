import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import CheckIcon from "@mui/icons-material/Check";
import ProductImage from "./ProductImage";
import { useCart } from "../context/cart-context";
import { formatPrice, MAX_QUANTITY_PER_ITEM } from "../config/store";
import { MONO } from "../theme";
import { confirmPulse, DURATION, EASE, transition } from "../theme/motion";

export default function ProductCard({ product, imageHeight = 190 }) {
  const { addToCart, quantityOf } = useCart();
  const quantity = quantityOf(product.id);
  const atLimit = quantity >= MAX_QUANTITY_PER_ITEM;
  const [justAdded, setJustAdded] = useState(false);

  function handleAdd() {
    addToCart(product.id);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1100);
  }

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        "@media (prefers-reduced-motion: no-preference)": {
          "&:hover": {
            borderColor: "primary.main",
            boxShadow: 2,
            transform: "translateY(-2px)",
          },
          "&:hover .product-card-image img": { transform: "scale(1.04)" },
        },
        "& .product-card-image img": {
          transition: transition("transform"),
        },
        transition: transition("border-color", "box-shadow", "transform"),
      }}
    >
      <Box
        component={RouterLink}
        to={`/products/${product.id}`}
        sx={{
          color: "inherit",
          textDecoration: "none",
          display: "block",
          borderRadius: "inherit",
          "&:focus-visible": {
            outline: "2px solid",
            outlineColor: "primary.main",
            outlineOffset: -2,
          },
        }}
      >
        <Box className="product-card-image">
          <ProductImage product={product} height={imageHeight} />
        </Box>
        <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {product.category}
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              lineHeight: 1.35,
              mt: 0.25,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: "2.7em",
            }}
          >
            {product.name}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1 }} />

      <Box sx={{ px: 2, pb: 1 }}>
        <Typography variant="h6" sx={{ fontFamily: MONO }}>
          {formatPrice(product.price)}
        </Typography>
      </Box>

      <CardActions sx={{ px: 2, pb: 2, pt: 0, gap: 1 }}>
        <Button
          variant="contained"
          color="secondary"
          size="small"
          fullWidth
          disabled={atLimit}
          startIcon={justAdded ? <CheckIcon /> : <AddShoppingCartIcon />}
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
          {atLimit
            ? "Max reached"
            : justAdded
              ? "Added"
              : quantity > 0
                ? `In cart (${quantity})`
                : "Add to cart"}
        </Button>
      </CardActions>
    </Card>
  );
}
