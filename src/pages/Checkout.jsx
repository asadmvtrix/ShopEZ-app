import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CardBrandIcon from "../components/CardBrandIcon";
import OrderSummary from "../components/OrderSummary";
import { useCart } from "../context/cart-context";
import { useAuth } from "../context/auth-context";
import { usePayment } from "../hooks/usePayment";
import { calculateTotals, formatPrice } from "../config/store";
import { MONO } from "../theme";
import {
  ACCEPTED_BRAND_IDS,
  detectBrand,
  digitsOnly,
  formatCardNumber,
  formatExpiry,
  validateCard,
} from "../lib/card";

const STEPS = ["Cart", "Payment", "Confirmation"];

const SANDBOX = !import.meta.env.VITE_PAYMENT_API_URL;
const cardField = (token) => (SANDBOX ? "off" : token);

function SectionLabel({ children, action }) {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{ alignItems: "center", justifyContent: "space-between", mb: 1.25 }}
    >
      <Typography variant="subtitle2" color="text.secondary">
        {children}
      </Typography>
      {action}
    </Stack>
  );
}

function Receipt({ receipt }) {
  return (
    <Container maxWidth="sm" sx={{ py: { xs: 5, md: 8 } }}>
      <Paper variant="outlined" sx={{ p: { xs: 3, md: 5 }, textAlign: "center" }}>
        <CheckCircleOutlineIcon color="success" sx={{ fontSize: 56 }} />
        <Typography variant="h1" sx={{ mt: 1.5 }}>
          Order placed
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Your order is saved to your account. Keep the reference below if you need help later.
        </Typography>

        <Stack spacing={1.5} sx={{ my: 4, textAlign: "left" }}>
          <Divider />
          {[
            ["Reference", receipt.reference],
            ["Amount", formatPrice(receipt.amount)],
            ["Paid with", `${receipt.brand} ending ${receipt.last4}`],
            ["Date", new Date(receipt.paidAt).toLocaleString()],
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

        <Alert severity="info" sx={{ textAlign: "left", mb: 3 }}>
          Payment is still sandboxed — no card was charged. The order itself is stored in your
          ShopEZ account.
        </Alert>

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

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { pay, error, receipt, isProcessing, isComplete } = usePayment();

  const [fields, setFields] = useState({ name: "", number: "", expiry: "", cvv: "" });
  const [fieldError, setFieldError] = useState(null);

  const brand = detectBrand(fields.number);
  const { total } = calculateTotals(subtotal);

  function setField(key, value) {
    setFields((current) => ({ ...current, [key]: value }));
    if (fieldError?.field === key) setFieldError(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const problem = validateCard(fields);
    if (problem) {
      setFieldError(problem);
      return;
    }
    setFieldError(null);

    const digits = digitsOnly(fields.number);
    const result = await pay({
      userId: user.id,
      items,
      orderPayload: {
        email: user.email,
        amount: Number(total.toFixed(2)),
        lines: items.map((item) => ({
          sku: item.id,
          name: item.product.name,
          quantity: item.quantity,
          unitPrice: item.product.price,
        })),
        card: { brand: brand.label, last4: digits.slice(-4), expiry: fields.expiry },
        placedAt: new Date().toISOString(),
      },
    });

    if (result.success) {
      clearCart();
    }
  }

  if (isComplete && receipt) {
    return <Receipt receipt={receipt} />;
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

  const helper = (field) => (fieldError?.field === field ? fieldError.message : " ");
  const invalid = (field) => fieldError?.field === field;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Typography variant="h1" gutterBottom>
        Checkout
      </Typography>

      <Stepper
        activeStep={1}
        sx={{
          maxWidth: 520,
          my: 3,
          "& .MuiStep-root": { px: { xs: 0.25, sm: 1 } },
          "& .MuiStepLabel-label": { fontSize: { xs: "0.7rem", sm: "0.875rem" } },
        }}
      >
        {STEPS.map((step) => (
          <Step key={step}>
            <StepLabel>{step}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 340px" },
          gap: { xs: 3, md: 4 },
          alignItems: "start",
        }}
      >
        <Box component="form" onSubmit={handleSubmit} noValidate autoComplete={SANDBOX ? "off" : "on"}>
          <Alert severity="info" variant="outlined" sx={{ mb: 3 }}>
            Sandbox card check only — nothing is charged. Approved checkouts are saved as real
            orders on your account. Use{" "}
            <Box component="span" sx={{ fontFamily: MONO }}>
              4242 4242 4242 4242
            </Box>{" "}
            to approve, or a number ending 0000 or 1111 to see a decline.
          </Alert>

          <SectionLabel>Contact</SectionLabel>
          <TextField
            label="Email"
            value={user.email}
            helperText="The receipt is issued to your account email."
            slotProps={{ input: { readOnly: true } }}
            sx={{ mb: 3 }}
          />

          <SectionLabel
            action={
              <Stack direction="row" spacing={0.5}>
                {ACCEPTED_BRAND_IDS.map((accepted) => (
                  <CardBrandIcon
                    key={accepted}
                    brand={accepted}
                    dimmed={brand.id !== "unknown" && brand.id !== accepted}
                  />
                ))}
              </Stack>
            }
          >
            Payment
          </SectionLabel>

          <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 } }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 2 }}>
              <CreditCardRoundedIcon fontSize="small" sx={{ color: "text.secondary" }} />
              <Typography variant="h5">Card details</Typography>
            </Stack>

            <Stack spacing={1}>
              <TextField
                id="card-number"
                label="Card number"
                autoComplete={cardField("cc-number")}
                inputMode="numeric"
                placeholder="1234 1234 1234 1234"
                value={fields.number}
                onChange={(event) => setField("number", formatCardNumber(event.target.value))}
                error={invalid("number")}
                helperText={helper("number")}
                slotProps={{
                  htmlInput: { sx: { fontFamily: MONO, letterSpacing: "0.04em" } },
                  input: {
                    endAdornment: brand.id === "unknown" ? null : (
                      <InputAdornment position="end">
                        <CardBrandIcon brand={brand.id} title={brand.label} />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 1, sm: 2 }}>
                <TextField
                  id="card-expiry"
                  label="Expiry date"
                  autoComplete={cardField("cc-exp")}
                  inputMode="numeric"
                  placeholder="MM/YY"
                  value={fields.expiry}
                  onChange={(event) => setField("expiry", formatExpiry(event.target.value))}
                  error={invalid("expiry")}
                  helperText={helper("expiry")}
                  slotProps={{ htmlInput: { sx: { fontFamily: MONO } } }}
                />
                <TextField
                  id="card-cvc"
                  label="Security code"
                  autoComplete={cardField("cc-csc")}
                  inputMode="numeric"
                  type="password"
                  placeholder={"•".repeat(brand.cvvLength)}
                  value={fields.cvv}
                  onChange={(event) =>
                    setField("cvv", digitsOnly(event.target.value).slice(0, brand.cvvLength))
                  }
                  error={invalid("cvv")}
                  helperText={
                    invalid("cvv")
                      ? fieldError.message
                      : `${brand.cvvLength} digits on the ${
                          brand.id === "amex" ? "front" : "back"
                        } of the card`
                  }
                  slotProps={{ htmlInput: { sx: { fontFamily: MONO } } }}
                />
              </Stack>

              <TextField
                id="card-name"
                label="Name on card"
                autoComplete={cardField("cc-name")}
                value={fields.name}
                onChange={(event) => setField("name", event.target.value)}
                error={invalid("name")}
                helperText={helper("name")}
              />
            </Stack>
          </Paper>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            color="secondary"
            size="large"
            fullWidth
            disabled={isProcessing}
            startIcon={
              isProcessing ? <CircularProgress size={18} color="inherit" /> : <LockOutlinedIcon />
            }
            sx={{ mt: 3 }}
          >
            {isProcessing ? "Authorising" : `Pay ${formatPrice(total)}`}
          </Button>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 1.5, textAlign: "center" }}
          >
            Card details are validated in your browser. Only the brand and last four digits are
            ever sent.
          </Typography>
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
