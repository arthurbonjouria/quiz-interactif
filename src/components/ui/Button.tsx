import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand/90 disabled:bg-brand/50",
  secondary: "border border-ink/15 bg-white text-ink hover:border-brand hover:text-brand disabled:opacity-50",
  ghost: "text-ink/70 hover:bg-soft/60 hover:text-ink disabled:opacity-50",
  danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-5 py-2.5 text-sm gap-2",
};

const BASE =
  "inline-flex items-center justify-center rounded-xl font-semibold transition disabled:cursor-not-allowed";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, CommonProps & ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ variant = "primary", size = "md", loading = false, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(BASE, VARIANT_CLASSES[variant], SIZE_CLASSES[size], className)}
        {...props}
      >
        {loading && <Loader2 size={14} strokeWidth={2.5} className="animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
}: CommonProps & { href: string }) {
  return (
    <Link href={href} className={cn(BASE, VARIANT_CLASSES[variant], SIZE_CLASSES[size], className)}>
      {children}
    </Link>
  );
}
