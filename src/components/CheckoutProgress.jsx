import { cn } from "@/lib/utils";

const STEPS = ["Cart", "Payment", "Confirmation"];

/** Text progress for checkout — no MUI Stepper ticks. */
export default function CheckoutProgress({ step }) {
  const active = Math.min(Math.max(step, 0), STEPS.length - 1);

  return (
    <nav
      aria-label="Checkout progress"
      className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground"
    >
      {STEPS.map((label, index) => {
        const isActive = index === active;
        const isDone = index < active;
        return (
          <span key={label} className="inline-flex items-center gap-2">
            {index > 0 && (
              <span aria-hidden className="select-none text-border">
                /
              </span>
            )}
            <span
              className={cn(
                isActive || isDone ? "text-foreground" : "text-muted-foreground",
                isActive && "font-semibold"
              )}
            >
              {label}
            </span>
          </span>
        );
      })}
    </nav>
  );
}
