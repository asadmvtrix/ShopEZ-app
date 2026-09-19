import { useEffect, useState } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CheckoutProgress from "../components/CheckoutProgress";
import { useCart } from "../context/cart-context";
import { fetchCheckoutSession } from "../services/stripe";
import { formatPrice } from "../config/store";
import { MONO } from "../theme";

function SectionLabel({ children }) {
  return (
    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.25 }}>
      {children}
    </Typography>
  );
}

function DetailRow({ label, value, strong = false }) {
  return (
    <Stack direction="row" spacing={2} sx={{ justifyContent: "space-between", gap: 2 }}>
      <Typography
        variant={strong ? "h5" : "body2"}
        color={strong ? "text.primary" : "text.secondary"}
      >
        {label}
      </Typography>
      <Typography
        variant={strong ? "h5" : "body2"}
        sx={{
          textAlign: "right",
          wordBreak: "break-word",
          fontFamily: strong ? MONO : "inherit",
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

function shortOrderId(id) {
  if (!id) return "—";
  return String(id).replace(/-/g, "").slice(0, 8).toUpperCase();
}

function formatPaidWith(order) {
  if (order.brand && order.last4) {
    const brand = String(order.brand)
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return `${brand} ·••${order.last4}`;
  }
  if (order.status === "paid") return "Card via Stripe";
  return "Processing";
}

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
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Typography variant="h1" gutterBottom>
          Confirmation
        </Typography>
        <CheckoutProgress step={2} />
        <Box sx={{ py: 6, textAlign: "center" }}>
          <CircularProgress size={28} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Confirming your payment…
          </Typography>
        </Box>
      </Container>
    );
  }

  if (state.error || !state.order) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Typography variant="h1" gutterBottom>
          Confirmation
        </Typography>
        <CheckoutProgress step={2} />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 340px" },
            gap: { xs: 3, md: 4 },
            alignItems: "start",
          }}
        >
          <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 } }}>
            <Alert severity="error" sx={{ mb: 2.5 }}>
              {state.error || "Couldn’t confirm this payment."}
            </Alert>
            <Stack spacing={1.5} direction={{ xs: "column", sm: "row" }}>
              <Button
                component={RouterLink}
                to="/account"
                variant="contained"
                color="secondary"
                size="large"
              >
                Check order history
              </Button>
              <Button component={RouterLink} to="/checkout" variant="outlined" size="large">
                Back to checkout
              </Button>
            </Stack>
          </Paper>
        </Box>
      </Container>
    );
  }

  const order = state.order;
  const confirmed = order.status === "paid";
  const placed = order.paidAt
    ? new Date(order.paidAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Typography variant="h1" gutterBottom>
        {confirmed ? "Order confirmed" : "Payment received"}
      </Typography>

      <CheckoutProgress step={2} />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 340px" },
          gap: { xs: 3, md: 4 },
          alignItems: "start",
        }}
      >
        <Box>
          <SectionLabel>Order details</SectionLabel>
          <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 } }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              {confirmed
                ? "Payment went through. Your order is saved in Account → Orders."
                : "Stripe accepted the payment. Status may take a moment to update in your account."}
            </Typography>

            <Stack spacing={1.25}>
              <DetailRow label="Order" value={`#${shortOrderId(order.id)}`} />
              <DetailRow label="Paid with" value={formatPaidWith(order)} />
              <DetailRow label="Placed" value={placed} />
            </Stack>

            {order.status === "pending" && (
              <Alert severity="info" sx={{ mt: 2.5 }}>
                Final order status may take a moment to update.
              </Alert>
            )}
          </Paper>
        </Box>

        <Box
          sx={{
            position: { md: "sticky" },
            top: 88,
          }}
        >
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h3" gutterBottom>
              Summary
            </Typography>
            <Box sx={{ my: 2 }}>
              <DetailRow label="Total paid" value={formatPrice(order.amount)} strong />
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={1.5}>
              <Button
                component={RouterLink}
                to="/account"
                variant="contained"
                color="secondary"
                size="large"
                fullWidth
              >
                View order history
              </Button>
              <Button
                component={RouterLink}
                to="/browse"
                variant="outlined"
                size="large"
                fullWidth
              >
                Continue shopping
              </Button>
            </Stack>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
}
