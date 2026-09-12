import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Typography from "@mui/material/Typography";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ProductImage from "./ProductImage";
import { useCatalog } from "../context/catalog-context";
import { formatPriceShort } from "../config/store";

export default function CategoryTiles() {
  const { categorySummaries } = useCatalog();

  return (
    <Box
      sx={{
        display: "grid",
        gap: { xs: 1.5, sm: 2 },
        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
      }}
    >
      {categorySummaries.map((summary) => (
        <Card key={summary.category}>
          <CardActionArea
            component={RouterLink}
            to={`/browse?category=${encodeURIComponent(summary.category)}`}
            sx={{
              p: 1.5,
              display: "flex",
              gap: 1.5,
              alignItems: "center",
              "@media (prefers-reduced-motion: no-preference)": {
                "&:hover .category-chevron": { transform: "translateX(4px)" },
              },
            }}
          >
            <ProductImage
              product={{ image: summary.image, name: summary.category }}
              height={60}
              imagePadding={0.75}
              sx={{ width: 60, flexShrink: 0, borderRadius: 1, border: 1, borderColor: "divider" }}
            />
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography variant="h5" noWrap>
                {summary.category}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
                {summary.count} {summary.count === 1 ? "product" : "products"}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
                from {formatPriceShort(summary.from)}
              </Typography>
            </Box>
            <ChevronRightIcon
              className="category-chevron"
              fontSize="small"
              sx={{
                color: "text.disabled",
                transition: "transform 220ms cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            />
          </CardActionArea>
        </Card>
      ))}
    </Box>
  );
}
