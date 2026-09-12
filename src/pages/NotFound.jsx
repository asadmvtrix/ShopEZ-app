import { Link as RouterLink } from "react-router-dom";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { MONO } from "../theme";

export default function NotFound() {
  return (
    <Container maxWidth="sm" sx={{ py: { xs: 8, md: 12 }, textAlign: "center" }}>
      <Typography
        variant="h1"
        sx={{ fontFamily: MONO, color: "text.disabled", fontSize: { xs: "3rem", md: "4rem" } }}
      >
        404
      </Typography>
      <Typography variant="h2" sx={{ mt: 1 }}>
        We could not find that page
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, mb: 4 }}>
        The link may be out of date, or the product may have left the catalogue.
      </Typography>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{ justifyContent: "center" }}
      >
        <Button component={RouterLink} to="/" variant="contained">
          Back to home
        </Button>
        <Button component={RouterLink} to="/browse" variant="outlined">
          Browse products
        </Button>
      </Stack>
    </Container>
  );
}
