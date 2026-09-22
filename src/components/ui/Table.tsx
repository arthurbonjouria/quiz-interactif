import { cn } from "@/lib/cn";

export function TableCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-2xl border border-ink/10 bg-white shadow-[0_2px_16px_-4px_rgba(45,45,45,0.08)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return <table className={cn("w-full min-w-[640px] text-left text-sm", className)}>{children}</table>;
}

export function Thead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-offwhite text-xs font-semibold uppercase tracking-wide text-cloudy">
      <tr>{children}</tr>
    </thead>
  );
}

export function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <th className={cn("px-4 py-3 font-semibold", className)}>{children}</th>;
}

export function Tr({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn("border-t border-ink/5 transition hover:bg-offwhite/60", className)} {...props}>
      {children}
    </tr>
  );
}

export function Td({ children, className, colSpan }: { children?: React.ReactNode; className?: string; colSpan?: number }) {
  return (
    <td className={cn("px-4 py-3 align-middle text-ink", className)} colSpan={colSpan}>
      {children}
    </td>
  );
}

export function EmptyRow({ colSpan, children }: { colSpan: number; children: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center text-sm text-cloudy">
        {children}
      </td>
    </tr>
  );
}
