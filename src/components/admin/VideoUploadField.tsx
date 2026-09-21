"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";

export function VideoUploadField({ campaignId, currentVideoUrl }: { campaignId: string; currentVideoUrl: string | null }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState(currentVideoUrl);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
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
      setProgress(null);
      router.refresh();
    } catch (err) {
      setError((err as Error).message || "Échec de l'upload.");
      setProgress(null);
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove() {
    if (!confirm("Retirer la vidéo de cette campagne ?")) return;
    const res = await fetch(`/api/admin/campaigns/${campaignId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoUrl: null }),
    });
    if (res.ok) {
      setVideoUrl(null);
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-6">
      <div>
        <h2 className="text-sm font-semibold">Vidéo obligatoire avant le quiz</h2>
        <p className="text-xs text-neutral-500">
          Si une vidéo est renseignée, les participants doivent la regarder en entier avant d&apos;accéder au
          questionnaire, et le score final devient une note sur 10 (au lieu du score type Kahoot).
        </p>
      </div>

      {videoUrl && (
        <div className="flex flex-col gap-2">
          <video src={videoUrl} controls className="w-full max-w-md rounded-lg bg-black" />
          <button onClick={handleRemove} className="self-start text-xs font-medium text-red-600 hover:underline">
            Retirer la vidéo
          </button>
        </div>
      )}

      <div>
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          onChange={handleFileChange}
          className="text-sm"
        />
        {progress !== null && (
          <div className="mt-2 h-2 w-full max-w-md overflow-hidden rounded-full bg-neutral-200">
            <div className="h-full bg-brand transition-[width]" style={{ width: `${progress}%` }} />
          </div>
        )}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
