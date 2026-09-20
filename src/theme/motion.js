import { useEffect, useState } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(REDUCED_MOTION_QUERY).matches : false
  );

  useEffect(() => {
    const media = window.matchMedia(REDUCED_MOTION_QUERY);
    const onChange = () => setReduced(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

export const DURATION = {
  instant: 100,
  fast: 160,
  normal: 220,
  slow: 280,
  enter: 200,
};

export const EASE = "cubic-bezier(0.2, 0, 0, 1)";

export function transition(...properties) {
  return properties
    .map((property) => `${property} ${DURATION.fast}ms ${EASE}`)
    .join(", ");
}

/** CSS keyframe names registered in src/index.css (@theme). */
export const contentEnter = "content-enter";
export const badgeBump = "badge-bump";
export const confirmPulse = "confirm-pulse";

/** Tailwind animation utility class names (motion-safe variants for new UI). */
export const ANIMATE = {
  contentEnter: "motion-safe:animate-content-enter",
  badgeBump: "motion-safe:animate-badge-bump",
  confirmPulse: "motion-safe:animate-confirm-pulse",
};
