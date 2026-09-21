"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Check, PartyPopper, Trophy } from "lucide-react";

type Player = { attemptId: string; name: string; score: number; answeredCurrent: boolean };

type Question = {
  id: string;
  text: string;
  choices: string[];
  type: "SINGLE" | "BOOLEAN" | "MULTIPLE";
  correctIndex: number;
  correctIndexes: number[];
  points: number;
  timeLimitSec: number;
};

type SessionState = {
  id: string;
  pin: string;
  status: "LOBBY" | "QUESTION" | "REVEAL" | "FINISHED";
  currentIndex: number;
  questionStartedAt: string | null;
  totalQuestions: number;
  questionnaireTitle: string;
  companyName: string;
  currentQuestion: Question | null;
  answerDistribution: number[];
  players: Player[];
};

const COLORS = ["bg-red-500", "bg-blue-500", "bg-yellow-500", "bg-green-500"];

export function LiveHostClient({ sessionId }: { sessionId: string }) {
  const [state, setState] = useState<SessionState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const revealTriggeredForIndex = useRef<number>(-1);

  const poll = useCallback(async () => {
    const res = await fetch(`/api/admin/live/${sessionId}`);
    if (res.ok) setState(await res.json());
  }, [sessionId]);

  useEffect(() => {
    poll();
    const t = setInterval(poll, 1500);
    return () => clearInterval(t);
  }, [poll]);

  async function callAction(action: "start" | "reveal" | "next") {
    setError(null);
    const res = await fetch(`/api/admin/live/${sessionId}/${action}`, { method: "POST" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Action impossible.");
      return;
    }
    poll();
  }

  // Auto-reveal when the shared timer runs out.
  useEffect(() => {
    if (!state || state.status !== "QUESTION" || !state.questionStartedAt || !state.currentQuestion) return;
    if (revealTriggeredForIndex.current === state.currentIndex) return;

    const deadline = new Date(state.questionStartedAt).getTime() + state.currentQuestion.timeLimitSec * 1000;
    const msLeft = deadline - Date.now();
    if (msLeft <= 0) return;

    const t = setTimeout(() => {
      revealTriggeredForIndex.current = state.currentIndex;
      callAction("reveal");
    }, msLeft + 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const joinUrl = typeof window !== "undefined" && state ? `${window.location.origin}/play/${state.pin}` : "";

  useEffect(() => {
    if (!joinUrl) return;
    QRCode.toDataURL(joinUrl, { width: 220, margin: 1, color: { dark: "#2D2D2D", light: "#FFFFFF" } })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [joinUrl]);

  if (!state) return <p className="text-white/70">Chargement…</p>;

  return (
    <div className="flex w-full max-w-3xl flex-col gap-6 text-white">
      {error && <p className="rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-200">{error}</p>}

      {state.status === "LOBBY" && (
        <div className="flex flex-col items-center gap-6 text-center">
          <p className="text-sm uppercase tracking-widest text-white/60">{state.questionnaireTitle}</p>
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-stretch">
            {qrDataUrl && (
              <div className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrDataUrl} alt="QR code pour rejoindre la partie" width={180} height={180} />
                <p className="text-xs text-neutral-500">Scanner pour rejoindre</p>
              </div>
            )}
            <div className="rounded-2xl bg-white px-10 py-6 text-ink">
              <p className="text-xs uppercase tracking-widest text-neutral-500">Code à saisir sur son téléphone</p>
              <p className="text-6xl font-bold tabular-nums text-brand">{state.pin}</p>
              <p className="mt-2 text-sm text-neutral-500">{joinUrl}</p>
            </div>
          </div>
          <p className="text-lg font-semibold">{state.players.length} joueur(s) connecté(s)</p>
          <div className="flex max-w-lg flex-wrap justify-center gap-2">
            {state.players.map((p) => (
              <span key={p.attemptId} className="animate-pop-in rounded-full bg-white/10 px-4 py-2 text-sm">
                {p.name}
              </span>
            ))}
          </div>
          <button
            onClick={() => callAction("start")}
            disabled={state.players.length === 0}
            className="rounded-lg bg-brand px-8 py-3 text-lg font-bold hover:opacity-90 disabled:opacity-40"
          >
            Démarrer la partie
          </button>
        </div>
      )}

      {state.status === "QUESTION" && state.currentQuestion && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between text-sm text-white/70">
            <span>
              Question {state.currentIndex + 1} / {state.totalQuestions}
            </span>
            <span>{state.players.filter((p) => p.answeredCurrent).length} / {state.players.length} ont répondu</span>
          </div>
          <div className="rounded-2xl bg-white p-8 text-center">
            <h2 className="text-2xl font-bold text-ink">{state.currentQuestion.text}</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {state.currentQuestion.choices.map((choice, i) => (
              <div key={i} className={`rounded-xl px-5 py-4 font-semibold text-white ${COLORS[i % COLORS.length]}`}>
                {choice}
              </div>
            ))}
          </div>
          <button
            onClick={() => callAction("reveal")}
            className="self-center rounded-lg bg-white px-6 py-2.5 font-semibold text-ink hover:opacity-90"
          >
            Voir la réponse
          </button>
        </div>
      )}

      {state.status === "REVEAL" && state.currentQuestion && (
        <div className="flex flex-col gap-6">
          <p className="text-center text-sm text-white/70">
            Question {state.currentIndex + 1} / {state.totalQuestions}
          </p>
          <div className="flex flex-col gap-2">
            {state.currentQuestion.choices.map((choice, i) => {
              const count = state.answerDistribution[i] ?? 0;
              const total = state.players.length || 1;
              const isCorrect =
                state.currentQuestion!.type === "MULTIPLE"
                  ? state.currentQuestion!.correctIndexes.includes(i)
                  : i === state.currentQuestion!.correctIndex;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-40 shrink-0 truncate rounded-lg px-3 py-2 text-sm font-medium text-white ${COLORS[i % COLORS.length]} ${isCorrect ? "ring-2 ring-white" : "opacity-60"}`}>
                    {choice} {isCorrect && <Check size={14} className="inline" strokeWidth={3} />}
                  </div>
                  <div className="h-4 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-white/70 transition-[width]"
                      style={{ width: `${(count / total) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-sm">{count}</span>
                </div>
              );
            })}
          </div>

          <div>
            <p className="mb-3 text-center text-sm font-semibold uppercase tracking-wide text-white/60">Top 3</p>
            <Podium players={state.players} />
          </div>

          <button
            onClick={() => callAction("next")}
            className="self-center rounded-lg bg-brand px-8 py-3 text-lg font-bold hover:opacity-90"
          >
            {state.currentIndex + 1 >= state.totalQuestions ? "Terminer" : "Question suivante"}
          </button>
        </div>
      )}

      {state.status === "FINISHED" && (
        <div className="flex flex-col items-center gap-6 text-center">
          <p className="flex items-center gap-2 text-2xl font-bold">
            <PartyPopper size={24} strokeWidth={2} className="text-brand" /> Partie terminée !
          </p>
          <Podium players={state.players} />
          {state.players.length > 3 && (
            <div className="flex w-full max-w-md flex-col gap-1">
              {state.players.slice(3).map((p, i) => (
                <div key={p.attemptId} className="flex items-center justify-between rounded-lg bg-white/10 px-4 py-2 text-sm">
                  <span>
                    {i + 4}. {p.name}
                  </span>
                  <span className="font-bold">{p.score}</span>
                </div>
              ))}
            </div>
          )}
          <p className="text-sm text-white/60">
            Les certificats ont été générés et envoyés par email à chaque participant.
          </p>
        </div>
      )}
    </div>
  );
}

function Podium({ players }: { players: Player[] }) {
  const [first, second, third] = players;
  const heights = ["h-28", "h-20", "h-14"];
  const order = [second, first, third];

  return (
    <div className="flex items-end justify-center gap-3">
      {order.map((p, col) => {
        if (!p) return <div key={col} className="w-28" />;
        const rank = col === 1 ? 0 : col === 0 ? 1 : 2;
        const medalColors = ["text-yellow-400", "text-neutral-300", "text-amber-600"];
        return (
          <div key={p.attemptId} className="flex w-28 flex-col items-center gap-2">
            <Trophy size={28} strokeWidth={2} className={medalColors[rank]} />
            <span className="max-w-full truncate text-sm font-semibold">{p.name}</span>
            <span className="text-lg font-bold text-brand">{p.score}</span>
            <div className={`w-full rounded-t-lg bg-white/15 ${heights[rank]}`} />
          </div>
        );
      })}
    </div>
  );
}
