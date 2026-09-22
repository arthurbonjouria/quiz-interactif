"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

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

  async function handleFile(file: File) {
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
    } catch (err) {
      setError((err as Error).message || "Échec de l'upload.");
    } finally {
      setProgress(null);
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
    <Card>
      <CardHeader
        title="Marque blanche"
        description="Le logo et la couleur de cette entreprise apparaissent aux côtés de BONJOUR IA sur la page d'inscription et le certificat de ses participants."
      />

      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="flex-1">
          <Field label="Logo" className="mb-3">
            {logoUrl ? (
              <div className="flex items-center gap-3 rounded-xl border border-ink/10 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoUrl} alt="Logo entreprise" className="h-10 max-w-[140px] object-contain" />
                <button onClick={handleRemoveLogo} className="ml-auto text-cloudy hover:text-red-600" aria-label="Retirer le logo">
                  <X size={16} strokeWidth={2} />
                </button>
              </div>
            ) : (
              <FileDropzone
                onFile={handleFile}
                accept="image/png,image/jpeg,image/webp"
                label="Glissez un logo ici, ou cliquez pour parcourir"
                hint="PNG, JPEG ou WebP"
                disabled={progress !== null}
              />
            )}
          </Field>
          {progress !== null && (
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-offwhite">
              <div className="h-full bg-brand transition-[width]" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>

        <div className="flex-1">
          <Field label="Couleur de marque" className="mb-3">
            <div className="flex items-center gap-3">
              <label className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-ink/10">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="absolute -left-1 -top-1 h-12 w-12 cursor-pointer"
                />
              </label>
              <Input value={color} onChange={(e) => setColor(e.target.value)} className="w-32 uppercase" />
              <Button size="sm" variant="secondary" onClick={handleSaveColor} loading={savingColor}>
                Enregistrer
              </Button>
            </div>
          </Field>
        </div>
      </div>

      {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
    </Card>
  );
}
