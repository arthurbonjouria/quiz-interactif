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
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);
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
    setCorrectIndex(null);
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
    async (choiceIndex: number | null) => {
      if (answeredRef.current || !data) return;
      answeredRef.current = true;
      const question = data.questions[index];
      const responseTimeMs = Date.now() - questionStartRef.current;

      const res = await fetch(`/api/attempts/${attemptId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: question.id, choiceIndex, responseTimeMs }),
      });
      const result = await res.json();

      setSelected(choiceIndex);
      setCorrectIndex(result.correctIndex);
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
      submitAnswer(null);
      return;
    }
    const t = setTimeout(() => setRemainingMs((m) => Math.max(0, m - 100)), 100);
    return () => clearTimeout(t);
  }, [phase, remainingMs, submitAnswer]);

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
          className="animate-score-pop rounded-full bg-white px-3 py-1 text-sm font-bold text-ink"
        >
          🏆 {score}
        </span>
      </div>

      <Timer remainingMs={remainingMs} totalMs={question.timeLimitSec * 1000} />

      <div key={index} className="animate-pop-in rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <h2 className="text-center text-xl font-bold text-ink sm:text-2xl">{question.text}</h2>
      </div>

      {phase === "reveal" && (
        <p
          className={`animate-pop-in text-center text-lg font-bold ${
            lastPoints ? "text-green-400" : "text-red-400"
          }`}
        >
          {lastPoints ? `🎉 Bonne réponse ! +${lastPoints} points` : "😬 Pas de points cette fois-ci"}
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {question.choices.map((choice, i) => {
          let reveal: "none" | "correct" | "incorrect" | "faded" = "none";
          if (phase === "reveal") {
            if (i === correctIndex) reveal = "correct";
            else if (i === selected) reveal = "incorrect";
            else reveal = "faded";
          }
          return (
            <AnswerButton
              key={`${index}-${i}`}
              index={i}
              text={choice}
              disabled={phase !== "question"}
              reveal={reveal}
              onClick={() => submitAnswer(i)}
            />
          );
        })}
      </div>
    </div>
  );
}
