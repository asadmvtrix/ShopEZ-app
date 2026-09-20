import { Badge } from "@/components/ui/badge";

/** Cart icon badge — count only (no render-phase state updates). */
export default function CartBadge({ count, children }) {
  return (
    <span className="relative inline-flex">
      {children}
      {count > 0 ? (
        <Badge
          variant="secondary"
          className="absolute -top-1.5 -right-1.5 h-5 min-w-5 justify-center rounded-full px-1 tabular-nums"
        >
          {count}
        </Badge>
      ) : null}
    </span>
  );
}
