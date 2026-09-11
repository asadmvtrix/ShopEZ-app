import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import Container from "@mui/material/Container";
import Fade from "@mui/material/Fade";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import ProductImage from "./ProductImage";
import QuickPickCard from "./QuickPickCard";
import { getHighlights } from "../data/products";
import { FREE_SHIPPING_THRESHOLD, formatPrice, formatPriceShort } from "../config/store";
import { MONO } from "../theme";
import { DURATION } from "../theme/motion";

const services = [
  {
    icon: LocalShippingOutlinedIcon,
    text: `Free delivery over ${formatPriceShort(FREE_SHIPPING_THRESHOLD)}`,
  },
  { icon: VerifiedOutlinedIcon, text: "Authorised distributors only" },
  { icon: SupportAgentOutlinedIcon, text: "Build advice within one business day" },
];

function ServiceStrip() {
  return (
    <Box sx={{ bgcolor: "background.paper", borderBottom: 1, borderColor: "divider" }}>
      <Container maxWidth="lg">
        <Stack
          direction="row"
          useFlexGap
          sx={{
            flexWrap: "wrap",
            rowGap: 0.5,
            columnGap: { xs: 2, sm: 4 },
            justifyContent: { xs: "flex-start", md: "center" },
            py: 1.25,
          }}
        >
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Stack
                key={service.text}
                direction="row"
                spacing={0.75}
                sx={{ alignItems: "center", color: "text.secondary" }}
              >
                <Icon sx={{ fontSize: 18 }} />
                <Typography variant="caption">{service.text}</Typography>
              </Stack>
            );
          })}
        </Stack>
      </Container>
    </Box>
  );
}

export default function StorefrontMasthead({ spotlight, quickPicks }) {
  const [index, setIndex] = useState(0);

  if (!spotlight?.length) return <ServiceStrip />;

  const slideCount = spotlight.length;
  const active = spotlight[Math.min(index, slideCount - 1)];
  const step = (delta) => setIndex((current) => (current + delta + slideCount) % slideCount);

  const strapline = getHighlights(active)[0];

  const arrowSx = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    bgcolor: "background.paper",
    border: 1,
    borderColor: "divider",
    display: { xs: "none", sm: "inline-flex" },
    "&:hover": { bgcolor: "action.hover" },
  };

  return (
    <Box component="section">
      <ServiceStrip />

      <Container maxWidth="lg" sx={{ pt: { xs: 2.5, md: 4 } }}>
        <Paper
          variant="outlined"
          sx={{
            position: "relative",
            borderRadius: 3,
            px: { xs: 2.5, sm: 6, md: 8 },
            pt: { xs: 3.5, md: 5 },
            pb: { xs: 5, md: 6 },
          }}
        >
          <Fade in key={active.id} timeout={DURATION.fast}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1.1fr 0.9fr" },
                gap: { xs: 3, md: 5 },
                alignItems: "center",
              }}
            >
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {active.category}
                </Typography>
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: "1.85rem", sm: "2.35rem", md: "2.8rem" },
                    lineHeight: 1.1,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {active.name}
                </Typography>
                {strapline && (
                  <Typography color="text.secondary" sx={{ mt: 2, maxWidth: 460 }}>
                    {strapline}.
                  </Typography>
                )}
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 1.5, mt: 3 }}
                >
                  <Button
                    component={RouterLink}
                    to={`/products/${active.id}`}
                    variant="contained"
                    color="secondary"
                    size="large"
                  >
                    Shop now
                  </Button>
                  <Typography variant="h3" sx={{ fontFamily: MONO }}>
                    {formatPrice(active.price)}
                  </Typography>
                </Stack>
              </Box>

              <ProductImage
                product={active}
                height={{ xs: 168, sm: 250, md: 290 }}
                sx={{ borderRadius: 2 }}
              />
            </Box>
          </Fade>

          <IconButton
            onClick={() => step(-1)}
            aria-label="Previous product"
            sx={{ ...arrowSx, left: { sm: 10, md: 16 } }}
          >
            <ChevronLeftIcon />
          </IconButton>
          <IconButton
            onClick={() => step(1)}
            aria-label="Next product"
            sx={{ ...arrowSx, right: { sm: 10, md: 16 } }}
          >
            <ChevronRightIcon />
          </IconButton>

          <Stack
            direction="row"
            spacing={1}
            sx={{
              position: "absolute",
              bottom: 16,
              left: 0,
              right: 0,
              justifyContent: "center",
            }}
          >
            {spotlight.map((product, slide) => (
              <ButtonBase
                key={product.id}
                onClick={() => setIndex(slide)}
                aria-label={`Show ${product.name}`}
                aria-current={slide === index}
                sx={{
                  width: slide === index ? 26 : 14,
                  height: 5,
                  borderRadius: 3,
                  bgcolor: slide === index ? "secondary.main" : "divider",
                  transition: (theme) =>
                    theme.transitions.create(["width", "background-color"], {
                      duration: theme.transitions.duration.shorter,
                    }),
                }}
              />
            ))}
          </Stack>
        </Paper>

        <Box
          sx={{
            display: "grid",
            gap: { xs: 1.5, sm: 2 },
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            mt: { xs: 1.5, sm: 2 },
          }}
        >
          {quickPicks.map((product) => (
            <QuickPickCard key={product.id} product={product} />
          ))}
        </Box>
      </Container>
    </Box>
  );
}
