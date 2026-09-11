import { toUserMessage } from "./errors";

const FLASH_KEY = "shopez.flash";
const listeners = new Set();

function normalise(message, tone = "success") {
  const text = typeof message === "string" ? message.trim() : toUserMessage(message);
  if (!text) return null;
  return { message: text, tone: tone === "error" ? "error" : "success" };
}

function emit(toast) {
  listeners.forEach((listener) => {
    try {
      listener(toast);
    } catch {
      // ignore listener failures
    }
  });
}

/** Persist across a navigation, then show once (auth redirects, sign-out, etc.). */
export function setFlash(message, tone = "success") {
  const toast = normalise(message, tone);
  if (!toast) return;
  try {
    sessionStorage.setItem(FLASH_KEY, JSON.stringify(toast));
  } catch {
    // ignore
  }
}

export function consumeFlash() {
  try {
    const raw = sessionStorage.getItem(FLASH_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(FLASH_KEY);

    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.message === "string") {
        return normalise(parsed.message, parsed.tone);
      }
    } catch {
      // Older builds stored a plain string.
      return normalise(raw, "success");
    }

    return null;
  } catch {
    return null;
  }
}

/** Live toast without navigating — forms, unexpected failures, etc. */
export function showToast(message, tone = "success") {
  const toast = normalise(message, tone);
  if (!toast) return;
  emit(toast);
}

export function showError(error) {
  showToast(toUserMessage(error), "error");
}

export function subscribeToast(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
