"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

export function Tabs({
  tabs,
  defaultTab,
}: {
  tabs: { key: string; label: string; content: React.ReactNode }[];
  defaultTab?: string;
}) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.key);
  const activeTab = tabs.find((t) => t.key === active) ?? tabs[0];

  return (
    <div>
      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-ink/10">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={cn(
              "shrink-0 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition",
              tab.key === activeTab?.key
                ? "border-brand text-brand"
                : "border-transparent text-cloudy hover:text-ink"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab?.content}
    </div>
  );
}
