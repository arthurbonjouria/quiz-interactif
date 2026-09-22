import { cn } from "@/lib/cn";

type Variant = "brand" | "neutral" | "dark" | "danger" | "warning";

const VARIANT_CLASSES: Record<Variant, string> = {
  brand: "bg-soft text-brand",
  neutral: "bg-offwhite text-cloudy",
  dark: "bg-ink/10 text-ink",
  danger: "bg-red-50 text-red-600",
  warning: "bg-amber-50 text-amber-700",
};

export function Badge({
  children,
  variant = "neutral",
  className,
}: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        VARIANT_CLASSES[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
