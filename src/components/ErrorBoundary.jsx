import { Component } from "react";
import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { MONO } from "../theme";

/**
 * Catches render/lazy-load crashes so the whole shell doesn’t go blank.
 * Real apps show a calm recovery screen — not a stack trace.
 */
export default class ErrorBoundary extends Component {
  state = { crashed: false };

  static getDerivedStateFromError() {
    return { crashed: true };
  }

  componentDidCatch(error) {
    if (import.meta.env.DEV) {
      console.error("[ShopEZ]", error);
    }
  }

  handleRetry = () => {
    this.setState({ crashed: false });
  };

  render() {
    if (!this.state.crashed) {
      return this.props.children;
    }

    return (
      <Container maxWidth="sm" sx={{ py: { xs: 8, md: 12 }, textAlign: "center" }}>
        <Typography
          variant="h1"
          sx={{ fontFamily: MONO, color: "text.disabled", fontSize: { xs: "2.5rem", md: "3.25rem" } }}
        >
          Oops
        </Typography>
        <Typography variant="h2" sx={{ mt: 1 }}>
          Something went wrong
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, mb: 4 }}>
          ShopEZ hit an unexpected error. You can try again, or head back home.
        </Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ justifyContent: "center" }}
        >
          <Button variant="contained" onClick={this.handleRetry}>
            Try again
          </Button>
          <Button
            component={RouterLink}
            to="/"
            variant="outlined"
            onClick={this.handleRetry}
          >
            Back to home
          </Button>
        </Stack>
        <Box sx={{ mt: 3 }}>
          <Button
            size="small"
            color="inherit"
            onClick={() => window.location.assign("/")}
            sx={{ textTransform: "none" }}
          >
            Reload the app
          </Button>
        </Box>
      </Container>
    );
  }
}
