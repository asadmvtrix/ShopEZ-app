import { useEffect, useState } from "react";

const ENTER_KEY = "shopez.enter";

/** Mark the next home/browse paint as a post-auth enter (shows warm skeletons). */
export function markAppEnter() {
  try {
    sessionStorage.setItem(ENTER_KEY, "1");
  } catch {
    // Ignore sessionStorage failures (private mode / quota).
  }
}

export function consumeAppEnter() {
  try {
    const flagged = sessionStorage.getItem(ENTER_KEY) === "1";
    if (flagged) sessionStorage.removeItem(ENTER_KEY);
    return flagged;
  } catch {
    return false;
  }
}

/**
 * Brief warm reveal so catalogue pages do not pop in empty-then-full on fast devices.
 * Longer when arriving right after sign-in.
 */
export function useWarmReveal({ fromAuth = false } = {}) {
  const [ready, setReady] = useState(false);
  const minMs = fromAuth ? 700 : 420;

  useEffect(() => {
    let timeoutId = 0;
    const started = performance.now();

    const finish = () => {
      const wait = Math.max(0, minMs - (performance.now() - started));
      timeoutId = window.setTimeout(() => setReady(true), wait);
    };


    const outer = requestAnimationFrame(() => {
      requestAnimationFrame(finish);
    });

    return () => {
      cancelAnimationFrame(outer);
      window.clearTimeout(timeoutId);
    };
  }, [minMs]);

  return ready;
}
