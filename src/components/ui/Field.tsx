import { cn } from "@/lib/cn";

export function FieldLabel({
  children,
  hint,
  className,
}: {
  children: React.ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-1.5 flex items-baseline justify-between gap-2", className)}>
      <span className="text-xs font-semibold uppercase tracking-wide text-cloudy">{children}</span>
      {hint && <span className="text-[11px] font-normal normal-case text-cloudy/80">{hint}</span>}
    </div>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
  className,
}: {
  label?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {label && <FieldLabel hint={hint}>{label}</FieldLabel>}
      {children}
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
