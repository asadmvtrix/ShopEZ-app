import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useColorMode } from "../context/ColorModeProvider";
import { showError } from "../lib/flash";
import { toUserMessage } from "../lib/errors";
import { consumeFlash, subscribeToast } from "../lib/flash";

function shouldIgnoreUnhandled(reason) {
  if (!reason) return true;
  const message = String(reason?.message ?? reason).toLowerCase();
  if (message.includes("resizeobserver") || message.includes("script error")) return true;
  if (reason?.name === "AbortError") return true;
  return false;
}

const HIDE_MS = {
  success: 2000,
  error: 2800,
};

function present(next) {
  if (!next?.message) return;
  const duration = HIDE_MS[next.tone] ?? HIDE_MS.success;
  if (next.tone === "error") {
    toast.error(next.message, { duration });
  } else {
    toast.success(next.message, { duration });
  }
}

export default function AppFlash() {
  const location = useLocation();
  const { mode } = useColorMode();

  useEffect(() => {
    present(consumeFlash());
  }, [location.key]);

  useEffect(() => {
    return subscribeToast((next) => present(next));
  }, []);

  useEffect(() => {
    function onRejection(event) {
      if (shouldIgnoreUnhandled(event.reason)) return;
      event.preventDefault?.();
      showError(toUserMessage(event.reason));
    }

    window.addEventListener("unhandledrejection", onRejection);
    return () => window.removeEventListener("unhandledrejection", onRejection);
  }, []);

  return <Toaster theme={mode} />;
}
