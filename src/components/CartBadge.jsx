import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ANIMATE, DURATION, usePrefersReducedMotion } from "../theme/motion";

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
    <span className="relative inline-flex">
      {children}
      {count > 0 ? (
        <Badge
          variant="secondary"
          className={cn(
            "absolute -top-1.5 -right-1.5 h-5 min-w-5 justify-center rounded-full px-1 tabular-nums",
            snapshot.pulse && !reduceMotion && ANIMATE.badgeBump
          )}
        >
          {count}
        </Badge>
      ) : null}
    </span>
  );
}
