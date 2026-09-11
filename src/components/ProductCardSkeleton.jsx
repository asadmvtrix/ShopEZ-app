import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";

export default function ProductCardSkeleton({ imageHeight = 190 }) {
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
      aria-hidden
    >
      <Skeleton variant="rectangular" animation="wave" height={imageHeight} sx={{ flexShrink: 0 }} />
      <Stack spacing={1} sx={{ p: 2, flexGrow: 1 }}>
        <Skeleton animation="wave" width="40%" height={14} />
        <Skeleton animation="wave" width="92%" height={18} />
        <Skeleton animation="wave" width="70%" height={18} />
        <Box sx={{ flexGrow: 1 }} />
        <Skeleton animation="wave" width="36%" height={24} sx={{ mt: 1 }} />
        <Skeleton animation="wave" variant="rounded" height={32} sx={{ mt: 0.5 }} />
      </Stack>
    </Card>
  );
}
