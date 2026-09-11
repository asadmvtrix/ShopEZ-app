import { Link as RouterLink, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import OrderSummary from "../components/OrderSummary";
import ProductImage from "../components/ProductImage";
import { useCart } from "../context/cart-context";
import { MAX_QUANTITY_PER_ITEM, formatPrice } from "../config/store";
import { MONO } from "../theme";

function EmptyCart() {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 4, md: 8 }, textAlign: "center" }}>
      <ShoppingCartOutlinedIcon sx={{ fontSize: 48, color: "text.disabled" }} />
      <Typography variant="h3" sx={{ mt: 1.5 }}>
        Your cart is empty
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
        Once you add something it will stay here, even if you close the tab.
      </Typography>
      <Button component={RouterLink} to="/browse" variant="contained" size="large">
        Browse products
      </Button>
    </Paper>
  );
}

export default function Cart() {
  const { items, itemCount, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Typography variant="h1" gutterBottom>
        Your cart
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {itemCount === 0
          ? "No items yet"
          : `${itemCount} ${itemCount === 1 ? "item" : "items"}`}
      </Typography>

      {items.length === 0 ? (
        <EmptyCart />
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 340px" },
            gap: { xs: 3, md: 4 },
            alignItems: "start",
          }}
        >
          <Stack spacing={2}>
            {items.map((item) => (
              <Paper
                key={item.id}
                variant="outlined"
                sx={{
                  p: 2,
                  display: "grid",
                  gridTemplateColumns: { xs: "88px 1fr", sm: "112px 1fr auto" },
                  gap: 2,
                  alignItems: "center",
                }}
              >
                <Box
                  component={RouterLink}
                  to={`/products/${item.id}`}
                  sx={{ border: 1, borderColor: "divider", borderRadius: 1, overflow: "hidden" }}
                >
                  <ProductImage product={item.product} height={88} />
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" color="text.secondary">
                    {item.product.category}
                  </Typography>
                  <Typography
                    component={RouterLink}
                    to={`/products/${item.id}`}
                    variant="subtitle1"
                    sx={{
                      display: "block",
                      fontWeight: 600,
                      color: "text.primary",
                      textDecoration: "none",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    {item.product.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontFamily: MONO, mt: 0.5 }}
                  >
                    {formatPrice(item.product.price)} each
                  </Typography>

                  <Stack direction="row" spacing={1} sx={{ alignItems: "center", mt: 1.5 }}>
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
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        aria-label={`Decrease quantity of ${item.product.name}`}
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <Typography
                        sx={{ minWidth: 28, textAlign: "center", fontVariantNumeric: "tabular-nums" }}
                      >
                        {item.quantity}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= MAX_QUANTITY_PER_ITEM}
                        aria-label={`Increase quantity of ${item.product.name}`}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    <IconButton
                      size="small"
                      onClick={() => removeFromCart(item.id)}
                      aria-label={`Remove ${item.product.name} from cart`}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Box>

                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: MONO,
                    textAlign: "right",
                    display: { xs: "none", sm: "block" },
                  }}
                >
                  {formatPrice(item.product.price * item.quantity)}
                </Typography>
              </Paper>
            ))}
          </Stack>

          <Box
            sx={{
              position: { md: "sticky" },
              top: 88,
              maxHeight: { md: "calc(100vh - 112px)" },
              overflowY: { md: "auto" },
            }}
          >
            <OrderSummary items={items}>
              <Stack spacing={1.5}>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={() => navigate("/checkout")}
                >
                  Proceed to checkout
                </Button>
                <Button component={RouterLink} to="/browse" fullWidth>
                  Continue shopping
                </Button>
              </Stack>
            </OrderSummary>
          </Box>
        </Box>
      )}
    </Container>
  );
}
