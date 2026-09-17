"use client";

export function Timer({ remainingMs, totalMs }: { remainingMs: number; totalMs: number }) {
  const ratio = Math.max(0, Math.min(1, remainingMs / totalMs));
  const seconds = Math.ceil(remainingMs / 1000);
  const urgent = ratio < 0.25;

  const barColor = urgent ? "bg-red-500" : ratio < 0.5 ? "bg-yellow-400" : "bg-brand";

  return (
    <div className="flex items-center gap-3">
      <div className="h-3 flex-1 overflow-hidden rounded-full bg-neutral-200">
        <div
          className={`h-full rounded-full transition-[width] duration-100 ease-linear ${barColor}`}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold tabular-nums text-white transition-colors ${
          urgent ? "animate-wiggle bg-red-500" : "bg-ink"
        }`}
      >
        {seconds}
      </span>
    </div>
  );
}
