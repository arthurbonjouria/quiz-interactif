"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnswerButton } from "./AnswerButton";
import { Timer } from "./Timer";
import { Confetti } from "./Confetti";
import { Frown, PartyPopper, Trophy } from "lucide-react";

type QuestionType = "SINGLE" | "BOOLEAN" | "MULTIPLE";

type Question = {
  id: string;
  text: string;
  choices: string[];
  type: QuestionType;
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
  top3: { name: string; score: number }[];
};

type AnswerResult = { correct: boolean; correctIndex: number; pointsEarned: number };

export function LiveGameClient({ pin, attemptId }: { pin: string; attemptId: string }) {
  const router = useRouter();
  const [state, setState] = useState<SessionState | null>(null);
  const [score, setScore] = useState(0);
  const [remainingMs, setRemainingMs] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [selectedMulti, setSelectedMulti] = useState<number[]>([]);
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
    async (choiceIndex: number | null, choiceIndexes: number[] = []) => {
      if (!state?.currentQuestion || submittingRef.current) return;
      if (answeredIndexRef.current === state.currentIndex) return;
      submittingRef.current = true;
      answeredIndexRef.current = state.currentIndex;

      const responseTimeMs = Date.now() - questionStartRef.current;
      setSelected(choiceIndex);
      setSelectedMulti(choiceIndexes);

      const res = await fetch(`/api/attempts/${attemptId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: state.currentQuestion.id, choiceIndex, choiceIndexes, responseTimeMs }),
      });
      const result: AnswerResult = await res.json();
      setLastResult(result);
      setScore((s) => s + result.pointsEarned);
      submittingRef.current = false;
    },
    [state, attemptId]
  );

  const selectedMultiRef = useRef<number[]>([]);
  useEffect(() => {
    selectedMultiRef.current = selectedMulti;
  }, [selectedMulti]);

  // Countdown + reset local state whenever a new question starts.
  useEffect(() => {
    if (!state || state.status !== "QUESTION" || !state.currentQuestion || !state.questionStartedAt) return;

    if (questionStartRef.current !== new Date(state.questionStartedAt).getTime()) {
      questionStartRef.current = new Date(state.questionStartedAt).getTime();
      if (answeredIndexRef.current !== state.currentIndex) {
        setSelected(null);
        setSelectedMulti([]);
        setLastResult(null);
      }
    }

    const totalMs = state.currentQuestion.timeLimitSec * 1000;
    const tick = () => {
      const elapsed = Date.now() - questionStartRef.current;
      setRemainingMs(Math.max(0, totalMs - elapsed));
      if (elapsed >= totalMs) {
        if (state.currentQuestion?.type === "MULTIPLE") {
          submitAnswer(null, selectedMultiRef.current);
        } else {
          submitAnswer(null);
        }
      }
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
          <p
            className={`animate-pop-in flex items-center justify-center gap-2 text-xl font-bold ${
              lastResult.pointsEarned ? "text-green-400" : "text-red-400"
            }`}
          >
            {lastResult.pointsEarned ? (
              <>
                <PartyPopper size={22} strokeWidth={2} /> Bonne réponse ! +{lastResult.pointsEarned} points
              </>
            ) : (
              <>
                <Frown size={22} strokeWidth={2} /> Pas de points cette fois-ci
              </>
            )}
          </p>
        ) : (
          <p className="text-white/70">Réponse révélée sur l&apos;écran principal.</p>
        )}
        <p className="text-sm text-white/60">Score total : {score}</p>

        {state.top3.length > 0 && (
          <div className="mt-2 w-full">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/50">Top 3</p>
            <div className="flex flex-col gap-1">
              {state.top3.map((p, i) => {
                const medalColors = ["text-yellow-400", "text-neutral-300", "text-amber-600"];
                return (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-white/10 px-4 py-2 text-sm">
                    <span className="flex items-center gap-1.5">
                      <Trophy size={14} strokeWidth={2} className={medalColors[i]} /> {p.name}
                    </span>
                    <span className="font-bold">{p.score}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <p className="mt-4 text-sm text-white/50">En attente de la question suivante…</p>
      </div>
    );
  }

  // status === "QUESTION"
  const answeredThisQuestion = answeredIndexRef.current === state.currentIndex;
  const isMultiple = state.currentQuestion.type === "MULTIPLE";

  function toggleMulti(i: number) {
    if (answeredThisQuestion) return;
    setSelectedMulti((cur) => (cur.includes(i) ? cur.filter((c) => c !== i) : [...cur, i]));
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <div className="flex items-center justify-between text-sm text-white/80">
        <span className="font-semibold">
          Question {state.currentIndex + 1} / {state.totalQuestions}
        </span>
        <span className="flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm font-bold text-ink">
          <Trophy size={14} strokeWidth={2} className="text-brand" /> {score}
        </span>
      </div>

      <Timer remainingMs={remainingMs} totalMs={state.currentQuestion.timeLimitSec * 1000} />

      <div className="animate-pop-in rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <h2 className="text-center text-xl font-bold text-ink sm:text-2xl">{state.currentQuestion.text}</h2>
        {isMultiple && !answeredThisQuestion && (
          <p className="mt-2 text-center text-xs font-medium text-neutral-400">
            Plusieurs réponses possibles — valide quand tu as fini.
          </p>
        )}
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
            reveal={
              answeredThisQuestion
                ? isMultiple
                  ? selectedMulti.includes(i)
                    ? "correct"
                    : "faded"
                  : i === selected
                    ? "correct"
                    : "faded"
                : "none"
            }
            selected={isMultiple && !answeredThisQuestion && selectedMulti.includes(i)}
            onClick={() => (isMultiple ? toggleMulti(i) : submitAnswer(i))}
          />
        ))}
      </div>

      {isMultiple && !answeredThisQuestion && (
        <button
          onClick={() => submitAnswer(null, selectedMulti)}
          disabled={selectedMulti.length === 0}
          className="self-center rounded-xl bg-white px-8 py-3 text-sm font-bold text-ink transition hover:opacity-90 disabled:opacity-40"
        >
          Valider
        </button>
      )}
    </div>
  );
}
