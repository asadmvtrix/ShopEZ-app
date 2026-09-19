import { useEffect, useState } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import { useCart } from "../context/cart-context";
import { fetchCheckoutSession } from "../services/stripe";
import { formatPrice } from "../config/store";
import { MONO } from "../theme";

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { clearCart } = useCart();
  const [state, setState] = useState({ loading: true, error: null, order: null });

  useEffect(() => {
    let active = true;

    async function load() {
      if (!sessionId) {
        setState({ loading: false, error: "Missing payment session.", order: null });
        return;
      }

      const result = await fetchCheckoutSession(sessionId);
      if (!active) return;

      if (!result.success) {
        setState({ loading: false, error: result.error, order: null });
        return;
      }

      clearCart();
      setState({ loading: false, error: null, order: result.order });
    }

    void load();
    return () => {
      active = false;
    };
  }, [sessionId, clearCart]);

  if (state.loading) {
    return (
      <Container maxWidth="sm" sx={{ py: { xs: 8, md: 12 }, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Confirming your payment…
        </Typography>
      </Container>
    );
  }

  if (state.error || !state.order) {
    return (
      <Container maxWidth="sm" sx={{ py: { xs: 5, md: 8 } }}>
        <Paper variant="outlined" sx={{ p: { xs: 3, md: 5 } }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {state.error || "Couldn’t confirm this payment."}
          </Alert>
          <Stack spacing={1.5}>
            <Button component={RouterLink} to="/account" variant="contained">
              Check order history
            </Button>
            <Button component={RouterLink} to="/checkout" variant="outlined">
              Back to checkout
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  const order = state.order;
  const paidWith =
    order.brand && order.last4
      ? `${order.brand} ending ${order.last4}`
      : order.status === "paid"
        ? "Card via Stripe"
        : "Processing";

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 5, md: 8 } }}>
      <Paper variant="outlined" sx={{ p: { xs: 3, md: 5 }, textAlign: "center" }}>
        <CheckCircleOutlineIcon color="success" sx={{ fontSize: 56 }} />
        <Typography variant="h1" sx={{ mt: 1.5 }}>
          {order.status === "paid" ? "Payment successful" : "Payment received"}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Thanks — your ShopEZ order is on the way into your account history.
        </Typography>

        <Stack spacing={1.5} sx={{ my: 4, textAlign: "left" }}>
          <Divider />
          {[
            ["Reference", order.reference],
            ["Amount", formatPrice(order.amount)],
            ["Paid with", paidWith],
            ["Date", new Date(order.paidAt).toLocaleString()],
          ].map(([label, value]) => (
            <Stack
              key={label}
              direction="row"
              spacing={2}
              sx={{ justifyContent: "space-between" }}
            >
              <Typography variant="body2" color="text.secondary">
                {label}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: MONO, textAlign: "right" }}>
                {value}
              </Typography>
            </Stack>
          ))}
          <Divider />
        </Stack>

        {order.status === "pending" && (
          <Alert severity="info" sx={{ textAlign: "left", mb: 3 }}>
            Stripe confirmed the session. Final order status may take a moment to update.
          </Alert>
        )}

        <Stack spacing={1.5}>
          <Button component={RouterLink} to="/account" variant="contained" size="large">
            View order history
          </Button>
          <Button component={RouterLink} to="/browse" variant="outlined" size="large">
            Continue shopping
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}
