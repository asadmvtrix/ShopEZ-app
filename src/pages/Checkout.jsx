import { useState } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CheckoutProgress from "../components/CheckoutProgress";
import OrderSummary from "../components/OrderSummary";
import { useCart } from "../context/cart-context";
import { useAuth } from "../context/auth-context";
import { usePayment } from "../hooks/usePayment";
import { isStripeConfigured } from "../services/stripe";
import { calculateTotals, formatPrice } from "../config/store";
import { MONO } from "../theme";

function SectionLabel({ children }) {
  return (
    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.25 }}>
      {children}
    </Typography>
  );
}

export default function Checkout() {
  const { items, subtotal } = useCart();
  const { user } = useAuth();
  const { payWithStripe, error, isProcessing } = usePayment();
  const [searchParams] = useSearchParams();
  const canceled = searchParams.get("canceled") === "1";
  const [localError, setLocalError] = useState(null);

  const { total } = calculateTotals(subtotal);
  const stripeReady = isStripeConfigured;

  async function handleStripePay() {
    setLocalError(null);
    const result = await payWithStripe({ userId: user.id, items });
    if (!result.success) {
      setLocalError(result.error || error);
    }
  }

  if (items.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ py: { xs: 5, md: 8 } }}>
        <Paper variant="outlined" sx={{ p: { xs: 4, md: 6 }, textAlign: "center" }}>
          <Typography variant="h3" component="h1" gutterBottom>
            There is nothing to pay for
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Add something to your cart before checking out.
          </Typography>
          <Button component={RouterLink} to="/browse" variant="contained">
            Browse products
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Typography variant="h1" gutterBottom>
        Checkout
      </Typography>

      <CheckoutProgress step={1} />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 340px" },
          gap: { xs: 3, md: 4 },
          alignItems: "start",
        }}
      >
        <Box>
          {canceled && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              Payment was cancelled. Your cart is still here whenever you’re ready.
            </Alert>
          )}

          <SectionLabel>Contact</SectionLabel>
          <TextField
            label="Email"
            value={user.email}
            helperText="This email is used for your ShopEZ account and Stripe checkout."
            slotProps={{ input: { readOnly: true } }}
            sx={{ mb: 3 }}
          />

          <SectionLabel>Payment</SectionLabel>
          <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 } }}>
            {!stripeReady ? (
              <Alert severity="warning">
                Stripe isn’t configured. Add{" "}
                <Box component="span" sx={{ fontFamily: MONO }}>
                  VITE_STRIPE_PUBLISHABLE_KEY
                </Box>{" "}
                and the server secrets listed in{" "}
                <Box component="span" sx={{ fontFamily: MONO }}>
                  .env.example
                </Box>
                , then redeploy.
              </Alert>
            ) : (
              <>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1.5 }}>
                  <LockOutlinedIcon fontSize="small" sx={{ color: "text.secondary" }} />
                  <Typography variant="h5">Pay securely with Stripe</Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                  You’ll finish on Stripe’s checkout page. In test mode use{" "}
                  <Box component="span" sx={{ fontFamily: MONO }}>
                    4242 4242 4242 4242
                  </Box>
                  .
                </Typography>

                {(localError || error) && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {localError || error}
                  </Alert>
                )}

                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  fullWidth
                  disabled={isProcessing}
                  onClick={handleStripePay}
                  startIcon={
                    isProcessing ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <LockOutlinedIcon />
                    )
                  }
                >
                  {isProcessing ? "Redirecting…" : `Pay ${formatPrice(total)}`}
                </Button>
              </>
            )}
          </Paper>
        </Box>

        <Box
          sx={{
            position: { md: "sticky" },
            top: 88,
            maxHeight: { md: "calc(100vh - 112px)" },
            overflowY: { md: "auto" },
          }}
        >
          <OrderSummary items={items} itemised>
            <Button component={RouterLink} to="/cart" fullWidth>
              Back to cart
            </Button>
          </OrderSummary>
        </Box>
      </Box>
    </Container>
  );
}
