"use client";

import { useState } from "react";
import { Check } from "lucide-react";

export function ResendCertificateButton({ attemptId }: { attemptId: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "stub">("idle");

  async function handleClick() {
    setStatus("sending");
    const res = await fetch(`/api/admin/certificates/${attemptId}/resend`, { method: "POST" });
    const data = await res.json();
    setStatus(data.sent ? "sent" : "stub");
  }

  return (
    <button
      onClick={handleClick}
      disabled={status === "sending"}
      className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline disabled:opacity-50"
    >
      {status === "idle" && "Renvoyer par email"}
      {status === "sending" && "Envoi…"}
      {status === "sent" && (
        <>
          Envoyé <Check size={12} strokeWidth={3} />
        </>
      )}
      {status === "stub" && "Loggé (pas de clé Resend)"}
    </button>
  );
}
