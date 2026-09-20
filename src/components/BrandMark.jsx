import { cn } from "@/lib/utils";

const BAG =
  "M9.6 12.8H22.4l-1.05 10.6a1.6 1.6 0 0 1-1.59 1.4h-7.52a1.6 1.6 0 0 1-1.59-1.4z";
const HANDLE = "M12.9 13v-2.1a3.1 3.1 0 0 1 6.2 0V13";

export default function BrandMark({ className, ...props }) {
  return (
    <svg
      viewBox="6 4 20 24"
      aria-hidden
      className={cn("size-[1em] shrink-0 fill-current", className)}
      {...props}
    >
      <path d={BAG} fill="currentColor" />
      <path
        d={HANDLE}
        fill="none"
        stroke="var(--secondary)"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
    </svg>
  );
}
