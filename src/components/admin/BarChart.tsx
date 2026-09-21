type BarChartItem = {
  label: string;
  value: number; // 0-100
};

export function BarChart({ items, color = "#E83967" }: { items: BarChartItem[]; color?: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-neutral-400">Pas encore de données.</p>;
  }

  return (
    <div className="flex flex-col gap-2.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="w-40 shrink-0 truncate text-xs text-neutral-600" title={item.label}>
            {item.label}
          </span>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full transition-[width]"
              style={{ width: `${Math.max(0, Math.min(100, item.value))}%`, backgroundColor: color }}
            />
          </div>
          <span className="w-10 shrink-0 text-right text-xs font-semibold text-ink">{Math.round(item.value)}%</span>
        </div>
      ))}
    </div>
  );
}
