import { useEffect, useState } from "react";
import Badge from "@mui/material/Badge";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { badgeBump, DURATION, EASE } from "../theme/motion";


// Confirms a cart increase without toast spam. Pulse is derived when the count
// prop steps up (render-time adjustment), then cleared on a timer.
export default function CartBadge({ count, children }) {
  const reduceMotion = usePrefersReducedMotion();
  const [snapshot, setSnapshot] = useState({ count, pulse: false });

  if (count !== snapshot.count) {
    setSnapshot({ count, pulse: count > snapshot.count });
  }

  useEffect(() => {
    if (!snapshot.pulse) return undefined;
    const timer = window.setTimeout(() => {
      setSnapshot((current) => ({ ...current, pulse: false }));
    }, DURATION.slow);
    return () => window.clearTimeout(timer);
  }, [snapshot.pulse, snapshot.count]);

  return (
    <Badge
      badgeContent={count}
      color="secondary"
      sx={
        snapshot.pulse && !reduceMotion
          ? {
              "& .MuiBadge-badge": {
                animation: `${badgeBump} ${DURATION.slow}ms ${EASE}`,
              },
            }
          : undefined
      }
    >
      {children}
    </Badge>
  );
}
