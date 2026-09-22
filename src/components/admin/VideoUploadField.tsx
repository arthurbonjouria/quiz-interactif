"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import { Card, CardHeader } from "@/components/ui/Card";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function VideoUploadField({ campaignId, currentVideoUrl }: { campaignId: string; currentVideoUrl: string | null }) {
  const router = useRouter();
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState(currentVideoUrl);
  const [confirmingRemove, setConfirmingRemove] = useState(false);

  async function handleFile(file: File) {
    setError(null);
    setProgress(0);

    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/admin/blob/upload-token",
        onUploadProgress: (event) => setProgress(Math.round(event.percentage)),
      });

      const res = await fetch(`/api/admin/campaigns/${campaignId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: blob.url }),
      });
      if (!res.ok) throw new Error("Échec de l'enregistrement de la vidéo.");

      setVideoUrl(blob.url);
      router.refresh();
    } catch (err) {
      setError((err as Error).message || "Échec de l'upload.");
    } finally {
      setProgress(null);
    }
  }

  async function handleRemove() {
    const res = await fetch(`/api/admin/campaigns/${campaignId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoUrl: null }),
    });
    if (res.ok) {
      setVideoUrl(null);
      router.refresh();
    }
    setConfirmingRemove(false);
  }

  return (
    <Card>
      <CardHeader
        title="Vidéo obligatoire avant le quiz"
        description="Si une vidéo est renseignée, les participants doivent la regarder en entier avant d'accéder au questionnaire, et le score final devient une note sur 10 (au lieu du score type Kahoot)."
      />

      {videoUrl && (
        <div className="mb-4 flex flex-col gap-2">
          <video src={videoUrl} controls className="w-full max-w-md rounded-xl bg-ink" />
          <button onClick={() => setConfirmingRemove(true)} className="self-start text-xs font-semibold text-red-600 hover:underline">
            Retirer la vidéo
          </button>
        </div>
      )}

      <FileDropzone onFile={handleFile} accept="video/mp4,video/webm,video/quicktime" label="Glissez une vidéo ici, ou cliquez pour parcourir" disabled={progress !== null} />
      {progress !== null && (
        <div className="mt-3 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-offwhite">
          <div className="h-full bg-brand transition-[width]" style={{ width: `${progress}%` }} />
        </div>
      )}
      {error && <p className="mt-2 text-sm font-medium text-red-600">{error}</p>}

      {confirmingRemove && (
        <ConfirmDialog
          title="Retirer la vidéo ?"
          description="Les participants n'auront plus besoin de la regarder avant le questionnaire."
          confirmLabel="Retirer"
          danger
          onClose={() => setConfirmingRemove(false)}
          onConfirm={handleRemove}
        />
      )}
    </Card>
  );
}
