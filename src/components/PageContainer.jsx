import { cn } from "@/lib/utils";

/**
 * Shared page width + gutters (replaces MUI Container maxWidth="lg").
 * max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
 */
export default function PageContainer({ className, children, ...props }) {
  return (
    <div
      className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}
      {...props}
    >
      {children}
    </div>
  );
}
