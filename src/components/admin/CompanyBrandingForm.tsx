"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import { Palette, X } from "lucide-react";

export function CompanyBrandingForm({
  companyId,
  initialLogoUrl,
  initialBrandColor,
}: {
  companyId: string;
  initialLogoUrl: string | null;
  initialBrandColor: string | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl);
  const [color, setColor] = useState(initialBrandColor ?? "#E83967");
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingColor, setSavingColor] = useState(false);

  async function patchCompany(data: Record<string, unknown>) {
    const res = await fetch(`/api/admin/companies/${companyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Échec de l'enregistrement.");
    router.refresh();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setProgress(0);

    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/admin/blob/logo-upload-token",
        onUploadProgress: (event) => setProgress(Math.round(event.percentage)),
      });
      await patchCompany({ logoUrl: blob.url });
      setLogoUrl(blob.url);
      setProgress(null);
    } catch (err) {
      setError((err as Error).message || "Échec de l'upload.");
      setProgress(null);
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemoveLogo() {
    setError(null);
    try {
      await patchCompany({ logoUrl: null });
      setLogoUrl(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleSaveColor() {
    setSavingColor(true);
    setError(null);
    try {
      await patchCompany({ brandColor: color });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSavingColor(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-5">
      <div>
        <h2 className="text-sm font-semibold">Marque blanche</h2>
        <p className="text-xs text-neutral-500">
          Le logo et la couleur de cette entreprise apparaissent aux côtés de BONJOUR IA sur la page d&apos;inscription
          et le certificat de ses participants.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {logoUrl ? (
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoUrl} alt="Logo entreprise" className="h-10 max-w-[140px] rounded border border-neutral-200 object-contain p-1" />
            <button onClick={handleRemoveLogo} className="text-neutral-400 hover:text-red-600">
              <X size={14} strokeWidth={2} />
            </button>
          </div>
        ) : (
          <span className="text-xs text-neutral-400">Aucun logo</span>
        )}
        <div>
          <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} className="text-xs" />
          {progress !== null && (
            <div className="mt-1 h-1.5 w-32 overflow-hidden rounded-full bg-neutral-200">
              <div className="h-full bg-brand transition-[width]" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Palette size={16} strokeWidth={2} className="text-neutral-400" />
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="h-8 w-12 cursor-pointer rounded border border-neutral-200"
        />
        <input
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-24 rounded-lg border border-neutral-300 px-2 py-1 text-xs uppercase focus:border-brand focus:outline-none"
        />
        <button
          onClick={handleSaveColor}
          disabled={savingColor}
          className="rounded-lg bg-ink px-3 py-1.5 text-xs font-medium text-white hover:bg-brand disabled:opacity-50"
        >
          {savingColor ? "…" : "Enregistrer"}
        </button>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
