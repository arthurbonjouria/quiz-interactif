import { cn } from "@/lib/cn";

export function StatCard({
  label,
  value,
  className,
}: {
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white p-5 text-center shadow-[0_2px_20px_-4px_rgba(45,45,45,0.08)]",
        className
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-cloudy">{label}</p>
      <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}
