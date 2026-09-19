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
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import Typography from "@mui/material/Typography";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import { useCart } from "../context/cart-context";
import { fetchCheckoutSession } from "../services/stripe";
import { formatPrice } from "../config/store";

const STEPS = ["Cart", "Payment", "Confirmation"];

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
        sx={{ textAlign: "right", wordBreak: "break-word" }}
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

function CheckoutShell({ children, title }) {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Typography variant="h1" gutterBottom>
        {title}
      </Typography>

      <Stepper
        activeStep={2}
        sx={{
          maxWidth: 520,
          my: 3,
          "& .MuiStep-root": { px: { xs: 0.25, sm: 1 } },
          "& .MuiStepLabel-label": { fontSize: { xs: "0.7rem", sm: "0.875rem" } },
        }}
      >
        {STEPS.map((step) => (
          <Step key={step} completed>
            <StepLabel>{step}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {children}
    </Container>
  );
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
      <CheckoutShell title="Confirmation">
        <Box sx={{ py: { xs: 4, md: 6 }, textAlign: "center" }}>
          <CircularProgress size={28} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Confirming your payment…
          </Typography>
        </Box>
      </CheckoutShell>
    );
  }

  if (state.error || !state.order) {
    return (
      <CheckoutShell title="Confirmation">
        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, maxWidth: 560 }}>
          <Alert severity="error" sx={{ mb: 2.5 }}>
            {state.error || "Couldn’t confirm this payment."}
          </Alert>
          <Stack spacing={1.5}>
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
      </CheckoutShell>
    );
  }

  const order = state.order;
  const confirmed = order.status === "paid";

  return (
    <CheckoutShell title={confirmed ? "Order confirmed" : "Payment received"}>
      <Box sx={{ maxWidth: 560 }}>
        <SectionLabel>Receipt</SectionLabel>
        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1.5 }}>
            <CheckCircleOutlineIcon
              fontSize="small"
              sx={{ color: confirmed ? "success.main" : "text.secondary" }}
            />
            <Typography variant="h5">
              {confirmed ? "Paid with Stripe" : "Payment processing"}
            </Typography>
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            You’re all set. A receipt is on your account email, and this order is in your
            history.
          </Typography>

          <Divider sx={{ mb: 2 }} />

          <Stack spacing={1.25} sx={{ mb: 2 }}>
            <DetailRow label="Order" value={`#${shortOrderId(order.id)}`} />
            <DetailRow label="Paid with" value={formatPaidWith(order)} />
            <DetailRow
              label="Placed"
              value={
                order.paidAt
                  ? new Date(order.paidAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "—"
              }
            />
          </Stack>

          <Divider sx={{ mb: 2 }} />

          <DetailRow label="Total" value={formatPrice(order.amount)} strong />

          {order.status === "pending" && (
            <Alert severity="info" sx={{ mt: 2.5 }}>
              Stripe confirmed the session. Final order status may take a moment to update.
            </Alert>
          )}

          <Stack spacing={1.5} sx={{ mt: 3 }}>
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
            <Button component={RouterLink} to="/browse" variant="outlined" size="large" fullWidth>
              Continue shopping
            </Button>
          </Stack>
        </Paper>
      </Box>
    </CheckoutShell>
  );
}
