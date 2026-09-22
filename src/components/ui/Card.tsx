import { cn } from "@/lib/cn";

export function Card({
  children,
  className,
  dark = false,
  padding = "md",
}: {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
  padding?: "none" | "sm" | "md";
}) {
  const paddingClass = padding === "none" ? "" : padding === "sm" ? "p-4" : "p-6";
  return (
    <div
      className={cn(
        "rounded-2xl shadow-[0_2px_16px_-4px_rgba(45,45,45,0.08)]",
        dark ? "bg-ink text-white" : "border border-ink/10 bg-white",
        paddingClass,
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-5 flex items-start justify-between gap-4", className)}>
      <div>
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-cloudy">{description}</p>}
      </div>
      {action}
    </div>
  );
}
