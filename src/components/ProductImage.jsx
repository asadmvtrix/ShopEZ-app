import { useState } from "react";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { transition } from "../theme/motion";

// key={image} remounts this so load state resets without an effect.
function ProductImageInner({ product, height = 200, imagePadding = 1.5, sx }) {
  const [phase, setPhase] = useState("loading");
  const ready = phase === "ready";
  const failed = phase === "error";

  return (
    <Box
      sx={{
        position: "relative",
        height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: failed || ready ? "common.white" : "action.hover",
        overflow: "hidden",
        ...sx,
      }}
    >
      {!failed && !ready && (
        <Skeleton
          animation="wave"
          variant="rectangular"
          sx={{ position: "absolute", inset: 0, height: "100%", width: "100%" }}
        />
      )}

      {failed ? (
        <Typography variant="h3" sx={{ color: "grey.400" }}>
          {product.name.charAt(0)}
        </Typography>
      ) : (
        <Box
          component="img"
          src={product.image}
          alt={product.name}
          loading="lazy"
          ref={(img) => {
            // Cached images may already be complete before onLoad can fire.
            if (!img || phase !== "loading") return;
            if (img.complete) {
              setPhase(img.naturalWidth > 0 ? "ready" : "error");
            }
          }}
          onLoad={() => setPhase("ready")}
          onError={() => setPhase("error")}
          sx={{
            maxHeight: "100%",
            maxWidth: "100%",
            objectFit: "contain",
            p: imagePadding,
            opacity: ready ? 1 : 0,
            transition: transition("opacity"),
          }}
        />
      )}
    </Box>
  );
}

export default function ProductImage({ product, ...rest }) {
  return <ProductImageInner key={product.image} product={product} {...rest} />;
}
