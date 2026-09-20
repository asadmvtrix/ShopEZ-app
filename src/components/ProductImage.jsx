import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function resolveHeight(height) {
  if (height == null) {
    return { className: undefined, style: undefined, intrinsicHeight: 300 };
  }

  if (typeof height === "number") {
    return {
      className: undefined,
      style: { height: `${height}px` },
      intrinsicHeight: height,
    };
  }

  const xs = height?.xs ?? 200;
  const sm = height?.sm ?? xs;
  const md = height?.md ?? sm;

  return {
    className: "h-[var(--pi-h)] sm:h-[var(--pi-h-sm)] md:h-[var(--pi-h-md)]",
    style: {
      "--pi-h": `${xs}px`,
      "--pi-h-sm": `${sm}px`,
      "--pi-h-md": `${md}px`,
    },
    intrinsicHeight: md,
  };
}

function ProductImageInner({
  product,
  height = 200,
  imagePadding = 1.5,
  className,
  style,
}) {
  const [phase, setPhase] = useState("loading");
  const ready = phase === "ready";
  const failed = phase === "error";
  const resolved = resolveHeight(height);
  const paddingPx = imagePadding * 8;

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden",
        failed || ready ? "bg-card" : "bg-muted",
        resolved.className,
        className
      )}
      style={{ ...resolved.style, ...style }}
    >
      {!failed && !ready && (
        <Skeleton className="absolute inset-0 size-full rounded-none" />
      )}

      {failed ? (
        <span className="text-3xl font-semibold text-muted-foreground/40" aria-hidden>
          {product.name.charAt(0)}
        </span>
      ) : (
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={400}
          height={resolved.intrinsicHeight}
          ref={(img) => {
            if (!img || phase !== "loading") return;
            if (img.complete) {
              setPhase(img.naturalWidth > 0 ? "ready" : "error");
            }
          }}
          onLoad={() => setPhase("ready")}
          onError={() => setPhase("error")}
          className={cn(
            "max-h-full max-w-full object-contain transition-opacity duration-160",
            ready ? "opacity-100" : "opacity-0"
          )}
          style={{ padding: `${paddingPx}px` }}
        />
      )}
    </div>
  );
}

export default function ProductImage({ product, ...rest }) {
  return <ProductImageInner key={product.image} product={product} {...rest} />;
}
