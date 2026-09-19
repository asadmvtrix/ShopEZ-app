import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const STEPS = ["Cart", "Payment", "Confirmation"];

/** Text progress for checkout — no MUI Stepper ticks. */
export default function CheckoutProgress({ step }) {
  const active = Math.min(Math.max(step, 0), STEPS.length - 1);

  return (
    <Typography
      component="nav"
      variant="body2"
      aria-label="Checkout progress"
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        columnGap: 1,
        rowGap: 0.5,
        mb: 3,
        color: "text.secondary",
      }}
    >
      {STEPS.map((label, index) => {
        const isActive = index === active;
        const isDone = index < active;
        return (
          <Box key={label} sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
            {index > 0 && (
              <Box
                component="span"
                aria-hidden
                sx={{ color: "divider", userSelect: "none" }}
              >
                /
              </Box>
            )}
            <Box
              component="span"
              sx={{
                color: isActive || isDone ? "text.primary" : "text.secondary",
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {label}
            </Box>
          </Box>
        );
      })}
    </Typography>
  );
}
