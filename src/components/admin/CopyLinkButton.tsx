"use client";

import { useState } from "react";

export function CopyLinkButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = `${window.location.origin}/s/${code}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button onClick={handleCopy} className="rounded-lg border border-ink/15 px-3 py-1 text-xs font-semibold text-ink transition hover:border-brand hover:text-brand">
      {copied ? "Copié !" : `/s/${code}`}
    </button>
  );
}
