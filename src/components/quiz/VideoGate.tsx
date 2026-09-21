"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function VideoGate({ videoUrl, code, attemptId }: { videoUrl: string; code: string; attemptId: string }) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const maxWatchedRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const [canProceed, setCanProceed] = useState(false);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    maxWatchedRef.current = Math.max(maxWatchedRef.current, video.currentTime);
    setProgress(Math.min(100, Math.round((maxWatchedRef.current / video.duration) * 100)));
  }, []);

  const handleSeeking = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.currentTime > maxWatchedRef.current + 0.5) {
      video.currentTime = maxWatchedRef.current;
    }
  }, []);

  const handleEnded = useCallback(() => {
    setProgress(100);
    setCanProceed(true);
  }, []);

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        controlsList="nodownload"
        disablePictureInPicture
        className="w-full rounded-2xl bg-black"
        onTimeUpdate={handleTimeUpdate}
        onSeeking={handleSeeking}
        onEnded={handleEnded}
      />

      <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
        <div className="h-full rounded-full bg-brand transition-[width]" style={{ width: `${progress}%` }} />
      </div>

      {!canProceed && (
        <p className="text-center text-sm text-white/70">
          Vous devez regarder la vidéo en entier pour accéder au questionnaire. Impossible d&apos;avancer plus vite
          que ce que vous avez déjà vu.
        </p>
      )}

      <button
        onClick={() => router.push(`/s/${code}/play?attempt=${attemptId}`)}
        disabled={!canProceed}
        className="self-center rounded-lg bg-brand px-8 py-3 text-lg font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
      >
        Accéder au quiz
      </button>
    </div>
  );
}
