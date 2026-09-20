import { Link as RouterLink } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-16 text-center sm:px-6 md:py-24">
      <p className="font-mono text-5xl text-muted-foreground/50 md:text-6xl">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
        We could not find that page
      </h1>
      <p className="mt-3 mb-8 text-sm text-muted-foreground">
        The link may be out of date, or the product may have left the catalogue.
      </p>
      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <RouterLink to="/" className={cn(buttonVariants({ size: "lg" }), "inline-flex")}>
          Back to home
        </RouterLink>
        <RouterLink
          to="/browse"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "inline-flex")}
        >
          Browse products
        </RouterLink>
      </div>
    </div>
  );
}
