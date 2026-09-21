"use client";

const COLORS = [
  { bg: "bg-red-500", shadow: "shadow-red-900/30", shape: "▲" },
  { bg: "bg-blue-500", shadow: "shadow-blue-900/30", shape: "◆" },
  { bg: "bg-yellow-500", shadow: "shadow-yellow-900/30", shape: "●" },
  { bg: "bg-green-500", shadow: "shadow-green-900/30", shape: "■" },
];

type Reveal = "none" | "correct" | "incorrect" | "faded";

export function AnswerButton({
  index,
  text,
  onClick,
  disabled,
  reveal,
  selected = false,
}: {
  index: number;
  text: string;
  onClick: () => void;
  disabled: boolean;
  reveal: Reveal;
  selected?: boolean;
}) {
  const color = COLORS[index % COLORS.length];

  const revealClasses =
    reveal === "correct"
      ? "ring-4 ring-white scale-105 animate-wiggle"
      : reveal === "incorrect"
        ? "opacity-40 animate-shake-no"
        : reveal === "faded"
          ? "opacity-40"
          : selected
            ? "ring-4 ring-white/80 scale-[1.03]"
            : "hover:scale-[1.03] active:scale-95";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ animationDelay: `${index * 60}ms` }}
      className={`animate-pop-in flex min-h-[92px] w-full items-center gap-3 rounded-2xl px-5 py-4 text-left text-base font-bold text-white shadow-lg transition-transform duration-150 ${color.bg} ${color.shadow} ${revealClasses} disabled:cursor-not-allowed`}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-xl">
        {color.shape}
      </span>
      <span>{text}</span>
    </button>
  );
}
