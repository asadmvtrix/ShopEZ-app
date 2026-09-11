import { useEffect } from "react";
import { showError } from "../lib/flash";
import { toUserMessage } from "../lib/errors";

function shouldIgnore(reason) {
  if (!reason) return true;
  const message = String(reason?.message ?? reason).toLowerCase();
  if (message.includes("resizeobserver") || message.includes("script error")) return true;
  if (reason?.name === "AbortError") return true;
  return false;
}

// Catches unexpected async failures that pages forgot to handle.
export default function GlobalErrorBridge() {
  useEffect(() => {
    function onRejection(event) {
      if (shouldIgnore(event.reason)) return;
      event.preventDefault?.();
      showError(toUserMessage(event.reason));
    }

    window.addEventListener("unhandledrejection", onRejection);
    return () => window.removeEventListener("unhandledrejection", onRejection);
  }, []);

  return null;
}
