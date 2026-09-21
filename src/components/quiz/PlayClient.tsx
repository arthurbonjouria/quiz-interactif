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
  order: number;
  answered: boolean;
};

type AttemptData = {
  id: string;
  finishedAt: string | null;
  totalScore: number;
  campaignCode: string;
  questionnaireTitle: string;
  questions: Question[];
};

const REVEAL_DELAY_MS = 1800;

export function PlayClient({ attemptId, code }: { attemptId: string; code: string }) {
  const router = useRouter();
  const [data, setData] = useState<AttemptData | null>(null);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [scoreBump, setScoreBump] = useState(0);
  const [remainingMs, setRemainingMs] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [selectedMulti, setSelectedMulti] = useState<number[]>([]);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);
  const [correctIndexes, setCorrectIndexes] = useState<number[]>([]);
  const [lastPoints, setLastPoints] = useState<number | null>(null);
  const [phase, setPhase] = useState<"loading" | "question" | "reveal" | "finishing">("loading");

  const questionStartRef = useRef<number>(0);
  const answeredRef = useRef(false);

  useEffect(() => {
    fetch(`/api/attempts/${attemptId}`)
      .then((r) => r.json())
      .then((attempt: AttemptData) => {
        setData(attempt);
        setScore(attempt.totalScore);
        const firstUnanswered = attempt.questions.findIndex((q) => !q.answered);
        if (attempt.finishedAt || firstUnanswered === -1) {
          router.replace(`/s/${code}/result/${attemptId}`);
          return;
        }
        setIndex(firstUnanswered);
      });
  }, [attemptId, code, router]);

  const startQuestion = useCallback((question: Question) => {
    answeredRef.current = false;
    setSelected(null);
    setSelectedMulti([]);
    setCorrectIndex(null);
    setCorrectIndexes([]);
    setLastPoints(null);
    questionStartRef.current = Date.now();
    setRemainingMs(question.timeLimitSec * 1000);
    setPhase("question");
  }, []);

  useEffect(() => {
    if (!data) return;
    const question = data.questions[index];
    if (!question) return;
    startQuestion(question);
  }, [data, index, startQuestion]);

  const submitAnswer = useCallback(
    async (choiceIndex: number | null, choiceIndexes: number[] = []) => {
      if (answeredRef.current || !data) return;
      answeredRef.current = true;
      const question = data.questions[index];
      const responseTimeMs = Date.now() - questionStartRef.current;

      const res = await fetch(`/api/attempts/${attemptId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: question.id, choiceIndex, choiceIndexes, responseTimeMs }),
      });
      const result = await res.json();

      setSelected(choiceIndex);
      setSelectedMulti(choiceIndexes);
      setCorrectIndex(result.correctIndex);
      setCorrectIndexes(result.correctIndexes ?? []);
      setLastPoints(result.pointsEarned);
      if (result.pointsEarned > 0) {
        setScore((s) => s + result.pointsEarned);
        setScoreBump((b) => b + 1);
      }
      setPhase("reveal");
    },
    [attemptId, data, index]
  );

  useEffect(() => {
    if (phase !== "question") return;
    if (remainingMs <= 0) {
      const question = data?.questions[index];
      if (question?.type === "MULTIPLE") {
        submitAnswer(null, selectedMulti);
      } else {
        submitAnswer(null);
      }
      return;
    }
    const t = setTimeout(() => setRemainingMs((m) => Math.max(0, m - 100)), 100);
    return () => clearTimeout(t);
  }, [phase, remainingMs, submitAnswer, data, index, selectedMulti]);

  useEffect(() => {
    if (phase !== "reveal" || !data) return;
    const t = setTimeout(async () => {
      const nextIndex = index + 1;
      if (nextIndex >= data.questions.length) {
        setPhase("finishing");
        await fetch(`/api/attempts/${attemptId}/finish`, { method: "POST" });
        router.push(`/s/${code}/result/${attemptId}`);
        return;
      }
      setIndex(nextIndex);
    }, REVEAL_DELAY_MS);
    return () => clearTimeout(t);
  }, [phase, data, index, attemptId, code, router]);

  if (!data || phase === "loading") {
    return <p className="text-sm font-medium text-white/80">Chargement du questionnaire…</p>;
  }

  if (phase === "finishing") {
    return <p className="text-sm font-medium text-white/80">Calcul de votre score…</p>;
  }

  const question = data.questions[index];
  const isMultiple = question.type === "MULTIPLE";

  function toggleMulti(i: number) {
    if (phase !== "question") return;
    setSelectedMulti((cur) => (cur.includes(i) ? cur.filter((c) => c !== i) : [...cur, i]));
  }

  return (
    <div className="relative flex w-full max-w-2xl flex-col gap-6">
      {phase === "reveal" && lastPoints ? <Confetti /> : null}

      <div className="flex items-center gap-2">
        {data.questions.map((_, i) => (
          <span
            key={i}
            className={`h-2 flex-1 rounded-full transition-colors ${
              i < index ? "bg-brand" : i === index ? "bg-white" : "bg-white/25"
            }`}
          />
        ))}
      </div>

      <div className="flex items-center justify-between text-sm text-white/80">
        <span className="font-semibold">
          Question {index + 1} / {data.questions.length}
        </span>
        <span
          key={scoreBump}
          className="animate-score-pop flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm font-bold text-ink"
        >
          <Trophy size={14} strokeWidth={2} className="text-brand" /> {score}
        </span>
      </div>

      <Timer remainingMs={remainingMs} totalMs={question.timeLimitSec * 1000} />

      <div key={index} className="animate-pop-in rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <h2 className="text-center text-xl font-bold text-ink sm:text-2xl">{question.text}</h2>
        {isMultiple && phase === "question" && (
          <p className="mt-2 text-center text-xs font-medium text-neutral-400">
            Plusieurs réponses possibles — valide quand tu as fini.
          </p>
        )}
      </div>

      {phase === "reveal" && (
        <p
          className={`animate-pop-in flex items-center justify-center gap-2 text-center text-lg font-bold ${
            lastPoints ? "text-green-400" : "text-red-400"
          }`}
        >
          {lastPoints ? (
            <>
              <PartyPopper size={20} strokeWidth={2} /> Bonne réponse ! +{lastPoints} points
            </>
          ) : (
            <>
              <Frown size={20} strokeWidth={2} /> Pas de points cette fois-ci
            </>
          )}
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {question.choices.map((choice, i) => {
          let reveal: "none" | "correct" | "incorrect" | "faded" = "none";
          if (phase === "reveal") {
            if (isMultiple) {
              if (correctIndexes.includes(i)) reveal = "correct";
              else if (selectedMulti.includes(i)) reveal = "incorrect";
              else reveal = "faded";
            } else {
              if (i === correctIndex) reveal = "correct";
              else if (i === selected) reveal = "incorrect";
              else reveal = "faded";
            }
          }
          return (
            <AnswerButton
              key={`${index}-${i}`}
              index={i}
              text={choice}
              disabled={phase !== "question"}
              reveal={reveal}
              selected={isMultiple && phase === "question" && selectedMulti.includes(i)}
              onClick={() => (isMultiple ? toggleMulti(i) : submitAnswer(i))}
            />
          );
        })}
      </div>

      {isMultiple && phase === "question" && (
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
