import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-soft text-brand">
        <Icon size={22} strokeWidth={2} />
      </span>
      <div>
        <p className="font-semibold text-ink">{title}</p>
        {description && <p className="mt-1 max-w-sm text-sm text-cloudy">{description}</p>}
      </div>
      {action}
    </div>
  );
}
