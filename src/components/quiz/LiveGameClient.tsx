"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnswerButton } from "./AnswerButton";
import { Timer } from "./Timer";
import { Confetti } from "./Confetti";

type Question = {
  id: string;
  text: string;
  choices: string[];
  points: number;
  timeLimitSec: number;
};

type SessionState = {
  status: "LOBBY" | "QUESTION" | "REVEAL" | "FINISHED";
  currentIndex: number;
  questionStartedAt: string | null;
  totalQuestions: number;
  questionnaireTitle: string;
  campaignCode: string;
  currentQuestion: Question | null;
};

type AnswerResult = { correct: boolean; correctIndex: number; pointsEarned: number };

export function LiveGameClient({ pin, attemptId }: { pin: string; attemptId: string }) {
  const router = useRouter();
  const [state, setState] = useState<SessionState | null>(null);
  const [score, setScore] = useState(0);
  const [remainingMs, setRemainingMs] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<AnswerResult | null>(null);

  const answeredIndexRef = useRef<number>(-1);
  const submittingRef = useRef(false);
  const questionStartRef = useRef<number>(0);

  const poll = useCallback(async () => {
    const res = await fetch(`/api/live/${pin}`);
    if (!res.ok) return;
    const data: SessionState = await res.json();
    setState(data);

    if (data.status === "FINISHED") {
      router.replace(`/s/${data.campaignCode}/result/${attemptId}`);
    }
  }, [pin, attemptId, router]);

  useEffect(() => {
    poll();
    const t = setInterval(poll, 1200);
    return () => clearInterval(t);
  }, [poll]);

  const submitAnswer = useCallback(
    async (choiceIndex: number | null) => {
      if (!state?.currentQuestion || submittingRef.current) return;
      if (answeredIndexRef.current === state.currentIndex) return;
      submittingRef.current = true;
      answeredIndexRef.current = state.currentIndex;

      const responseTimeMs = Date.now() - questionStartRef.current;
      setSelected(choiceIndex);

      const res = await fetch(`/api/attempts/${attemptId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: state.currentQuestion.id, choiceIndex, responseTimeMs }),
      });
      const result: AnswerResult = await res.json();
      setLastResult(result);
      setScore((s) => s + result.pointsEarned);
      submittingRef.current = false;
    },
    [state, attemptId]
  );

  // Countdown + reset local state whenever a new question starts.
  useEffect(() => {
    if (!state || state.status !== "QUESTION" || !state.currentQuestion || !state.questionStartedAt) return;

    if (questionStartRef.current !== new Date(state.questionStartedAt).getTime()) {
      questionStartRef.current = new Date(state.questionStartedAt).getTime();
      if (answeredIndexRef.current !== state.currentIndex) {
        setSelected(null);
        setLastResult(null);
      }
    }

    const totalMs = state.currentQuestion.timeLimitSec * 1000;
    const tick = () => {
      const elapsed = Date.now() - questionStartRef.current;
      setRemainingMs(Math.max(0, totalMs - elapsed));
      if (elapsed >= totalMs) submitAnswer(null);
    };
    tick();
    const t = setInterval(tick, 150);
    return () => clearInterval(t);
  }, [state, submitAnswer]);

  if (!state) return <p className="text-sm text-neutral-500">Connexion…</p>;

  if (state.status === "LOBBY") {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent" />
        <p className="text-lg font-semibold">En attente du démarrage par l&apos;animateur…</p>
        <p className="text-sm text-neutral-500">{state.questionnaireTitle}</p>
      </div>
    );
  }

  if (!state.currentQuestion) {
    return <p className="text-sm text-neutral-500">Préparation de la question…</p>;
  }

  if (state.status === "REVEAL") {
    return (
      <div className="relative flex w-full max-w-md flex-col items-center gap-4 text-center">
        {lastResult?.pointsEarned ? <Confetti /> : null}
        <p className="text-sm text-white/70">
          Question {state.currentIndex + 1} / {state.totalQuestions}
        </p>
        {lastResult ? (
          <p className={`animate-pop-in text-xl font-bold ${lastResult.pointsEarned ? "text-green-400" : "text-red-400"}`}>
            {lastResult.pointsEarned ? `🎉 Bonne réponse ! +${lastResult.pointsEarned} points` : "😬 Pas de points cette fois-ci"}
          </p>
        ) : (
          <p className="text-white/70">Réponse révélée sur l&apos;écran principal.</p>
        )}
        <p className="text-sm text-white/60">Score total : {score}</p>
        <p className="mt-4 text-sm text-white/50">En attente de la question suivante…</p>
      </div>
    );
  }

  // status === "QUESTION"
  const answeredThisQuestion = answeredIndexRef.current === state.currentIndex;

  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <div className="flex items-center justify-between text-sm text-white/80">
        <span className="font-semibold">
          Question {state.currentIndex + 1} / {state.totalQuestions}
        </span>
        <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-ink">🏆 {score}</span>
      </div>

      <Timer remainingMs={remainingMs} totalMs={state.currentQuestion.timeLimitSec * 1000} />

      <div className="animate-pop-in rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <h2 className="text-center text-xl font-bold text-ink sm:text-2xl">{state.currentQuestion.text}</h2>
      </div>

      {answeredThisQuestion && (
        <p className="text-center text-sm font-semibold text-white/70">
          Réponse envoyée, en attente des autres joueurs…
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {state.currentQuestion.choices.map((choice, i) => (
          <AnswerButton
            key={`${state.currentIndex}-${i}`}
            index={i}
            text={choice}
            disabled={answeredThisQuestion}
            reveal={answeredThisQuestion ? (i === selected ? "correct" : "faded") : "none"}
            onClick={() => submitAnswer(i)}
          />
        ))}
      </div>
    </div>
  );
}
