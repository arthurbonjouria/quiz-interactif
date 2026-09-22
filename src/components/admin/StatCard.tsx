export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-5 shadow-[0_2px_16px_-4px_rgba(45,45,45,0.08)]">
      <p className="text-xs font-medium uppercase tracking-wide text-cloudy">{label}</p>
      <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}
