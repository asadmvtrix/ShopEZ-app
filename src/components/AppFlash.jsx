import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import Fade from "@mui/material/Fade";
import Portal from "@mui/material/Portal";
import Typography from "@mui/material/Typography";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import PriorityHighRoundedIcon from "@mui/icons-material/PriorityHighRounded";
import { consumeFlash, subscribeToast } from "../lib/flash";

const HIDE_MS = {
  success: 2000,
  error: 2800,
};

// Compact top-right toast — success + error, same pattern as common desktop SaaS.
export default function AppFlash() {
  const location = useLocation();
  const [toast, setToast] = useState(null);
  const [open, setOpen] = useState(false);
  const hideTimer = useRef(0);

  function present(next) {
    if (!next?.message) return;
    window.clearTimeout(hideTimer.current);
    setToast(next);
    setOpen(true);
    hideTimer.current = window.setTimeout(
      () => setOpen(false),
      HIDE_MS[next.tone] ?? HIDE_MS.success
    );
  }

  useEffect(() => {
    present(consumeFlash());
  }, [location.key]);

  useEffect(() => {
    return subscribeToast((next) => present(next));
  }, []);

  useEffect(() => () => window.clearTimeout(hideTimer.current), []);

  if (!toast) return null;

  const isError = toast.tone === "error";

  return (
    <Portal>
      <Fade in={open} timeout={{ enter: 160, exit: 140 }} unmountOnExit>
        <Box
          role={isError ? "alert" : "status"}
          aria-live={isError ? "assertive" : "polite"}
          sx={{
            position: "fixed",
            top: { xs: 16, sm: 20 },
            right: { xs: 16, sm: 20 },
            zIndex: (theme) => theme.zIndex.snackbar,
            maxWidth: "min(360px, calc(100vw - 32px))",
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            px: 1.5,
            py: 1.1,
            borderRadius: 1.5,
            border: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 8px 28px rgba(0,0,0,0.45)"
                : "0 8px 28px rgba(20,48,74,0.12)",
            pointerEvents: "none",
          }}
        >
          <Box
            sx={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              bgcolor: isError ? "error.main" : "success.main",
              color: isError ? "error.contrastText" : "success.contrastText",
            }}
          >
            {isError ? (
              <PriorityHighRoundedIcon sx={{ fontSize: 14 }} />
            ) : (
              <CheckRoundedIcon sx={{ fontSize: 14 }} />
            )}
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.35, pr: 0.25 }}>
            {toast.message}
          </Typography>
        </Box>
      </Fade>
    </Portal>
  );
}
