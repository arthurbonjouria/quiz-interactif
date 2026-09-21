"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Library } from "lucide-react";
import { QuestionBankPicker } from "./QuestionBankPicker";

type QuestionDraft = {
  text: string;
  choices: string[];
  correctIndex: number;
  points: number;
  timeLimitSec: number;
  tags: string[];
};

const EMPTY_QUESTION: QuestionDraft = {
  text: "",
  choices: ["", "", "", ""],
  correctIndex: 0,
  points: 1000,
  timeLimitSec: 20,
  tags: [],
};

const CATEGORIES = [
  { value: "POSITIONNEMENT", label: "Positionnement" },
  { value: "IA_ACT", label: "IA Act" },
  { value: "ACQUIS", label: "Acquis de compétences" },
];

export function QuestionnaireEditor({
  questionnaireId,
  initialTitle = "",
  initialCategory = "IA_ACT",
  initialQuestions,
}: {
  questionnaireId?: string;
  initialTitle?: string;
  initialCategory?: string;
  initialQuestions?: QuestionDraft[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [category, setCategory] = useState(initialCategory);
  const [questions, setQuestions] = useState<QuestionDraft[]>(
    initialQuestions && initialQuestions.length > 0 ? initialQuestions : [{ ...EMPTY_QUESTION }]
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  function updateQuestion(index: number, patch: Partial<QuestionDraft>) {
    setQuestions((qs) => qs.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  }

  function updateChoice(qIndex: number, cIndex: number, value: string) {
    setQuestions((qs) =>
      qs.map((q, i) => (i === qIndex ? { ...q, choices: q.choices.map((c, j) => (j === cIndex ? value : c)) } : q))
    );
  }

  function addQuestion() {
    setQuestions((qs) => [...qs, { ...EMPTY_QUESTION }]);
  }

  function importFromBank(imported: { text: string; choices: string[]; correctIndex: number; points: number; timeLimitSec: number; tags: string[] }[]) {
    setQuestions((qs) => [
      ...qs,
      ...imported.map((q) => ({
        text: q.text,
        choices: q.choices,
        correctIndex: q.correctIndex,
        points: q.points,
        timeLimitSec: q.timeLimitSec,
        tags: q.tags,
      })),
    ]);
  }

  function removeQuestion(index: number) {
    setQuestions((qs) => qs.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload = {
      title,
      category,
      questions: questions.map((q, i) => ({
        ...q,
        choices: q.choices.filter((c) => c.trim().length > 0),
        order: i,
      })),
    };

    const url = questionnaireId ? `/api/admin/questionnaires/${questionnaireId}` : "/api/admin/questionnaires";
    const method = questionnaireId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Erreur lors de l'enregistrement.");
      return;
    }
    router.push("/admin/questionnaires");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-500">Titre</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-500">Catégorie</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {questions.map((q, qi) => (
          <div key={qi} className="rounded-xl border border-neutral-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-neutral-400">Question {qi + 1}</span>
              {questions.length > 1 && (
                <button type="button" onClick={() => removeQuestion(qi)} className="text-xs text-red-600 hover:underline">
                  Supprimer
                </button>
              )}
            </div>
            <input
              required
              placeholder="Énoncé de la question"
              value={q.text}
              onChange={(e) => updateQuestion(qi, { text: e.target.value })}
              className="mb-3 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
            />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {q.choices.map((choice, ci) => (
                <div key={ci} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${qi}`}
                    checked={q.correctIndex === ci}
                    onChange={() => updateQuestion(qi, { correctIndex: ci })}
                    title="Bonne réponse"
                  />
                  <input
                    placeholder={`Proposition ${ci + 1}`}
                    value={choice}
                    onChange={(e) => updateChoice(qi, ci, e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
                  />
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-4 text-sm">
              <label className="flex items-center gap-2">
                Points
                <input
                  type="number"
                  min={1}
                  value={q.points}
                  onChange={(e) => updateQuestion(qi, { points: parseInt(e.target.value, 10) || 0 })}
                  className="w-24 rounded-lg border border-neutral-300 px-2 py-1"
                />
              </label>
              <label className="flex items-center gap-2">
                Temps (s)
                <input
                  type="number"
                  min={5}
                  value={q.timeLimitSec}
                  onChange={(e) => updateQuestion(qi, { timeLimitSec: parseInt(e.target.value, 10) || 0 })}
                  className="w-20 rounded-lg border border-neutral-300 px-2 py-1"
                />
              </label>
              <label className="flex flex-1 items-center gap-2">
                Tags
                <input
                  placeholder="ex: RGPD, IA générative"
                  value={q.tags.join(", ")}
                  onChange={(e) =>
                    updateQuestion(qi, {
                      tags: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full rounded-lg border border-neutral-300 px-2 py-1"
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={addQuestion}
          className="self-start rounded-lg border border-dashed border-neutral-400 px-4 py-2 text-sm font-medium text-neutral-600 hover:border-brand hover:text-brand"
        >
          + Ajouter une question
        </button>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="flex items-center gap-1.5 self-start rounded-lg border border-dashed border-neutral-400 px-4 py-2 text-sm font-medium text-neutral-600 hover:border-brand hover:text-brand"
        >
          <Library size={14} strokeWidth={2} /> Importer depuis la bibliothèque
        </button>
      </div>

      {pickerOpen && (
        <QuestionBankPicker
          excludeQuestionnaireId={questionnaireId}
          onImport={importFromBank}
          onClose={() => setPickerOpen(false)}
        />
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="self-start rounded-lg bg-ink px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand disabled:opacity-50"
      >
        {saving ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}
