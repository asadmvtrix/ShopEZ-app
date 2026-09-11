import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { FREE_SHIPPING_THRESHOLD, TAX_RATE, calculateTotals, formatPrice } from "../config/store";
import { MONO } from "../theme";

function Row({ label, value, strong }) {
  return (
    <Stack direction="row" spacing={2} sx={{ justifyContent: "space-between" }}>
      <Typography variant={strong ? "h5" : "body2"} color={strong ? "text.primary" : "text.secondary"}>
        {label}
      </Typography>
      <Typography
        variant={strong ? "h5" : "body2"}
        sx={{ fontFamily: MONO }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

export default function OrderSummary({ items, itemised = false, children }) {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const { shipping, tax, total } = calculateTotals(subtotal);
  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Typography variant="h3" gutterBottom>
        Order summary
      </Typography>

      {itemised && (
        <>
          <Stack spacing={1} sx={{ my: 2 }}>
            {items.map((item) => (
              <Stack
                key={item.id}
                direction="row"
                spacing={2}
                sx={{ justifyContent: "space-between" }}
              >
                <Typography variant="body2" color="text.secondary">
                  {item.product.name}
                  <Box component="span" sx={{ color: "text.disabled" }}>
                    {" "}
                    &times;{item.quantity}
                  </Box>
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: MONO }}>
                  {formatPrice(item.product.price * item.quantity)}
                </Typography>
              </Stack>
            ))}
          </Stack>
          <Divider />
        </>
      )}

      <Stack spacing={1.25} sx={{ my: 2 }}>
        <Row label="Subtotal" value={formatPrice(subtotal)} />
        <Row label="Shipping" value={shipping === 0 ? "Free" : formatPrice(shipping)} />
        <Row label={`Estimated tax (${Math.round(TAX_RATE * 100)}%)`} value={formatPrice(tax)} />
      </Stack>

      <Divider />

      <Box sx={{ my: 2 }}>
        <Row label="Total" value={formatPrice(total)} strong />
      </Box>

      {remainingForFreeShipping > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Add {formatPrice(remainingForFreeShipping)} more for free delivery
          </Typography>
          <LinearProgress
            variant="determinate"
            color="secondary"
            value={(subtotal / FREE_SHIPPING_THRESHOLD) * 100}
            sx={{ mt: 0.75, height: 6, borderRadius: 3 }}
          />
        </Box>
      )}

      {children}
    </Paper>
  );
}
