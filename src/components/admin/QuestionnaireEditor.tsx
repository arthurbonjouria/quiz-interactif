"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Library, ChevronDown, ChevronUp, ArrowUp, ArrowDown, Trash2, Plus, Clock, Trophy } from "lucide-react";
import { QuestionBankPicker } from "./QuestionBankPicker";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { NumberStepper } from "@/components/ui/NumberStepper";
import { TagInput } from "@/components/ui/TagInput";
import { cn } from "@/lib/cn";

type QuestionType = "SINGLE" | "BOOLEAN" | "MULTIPLE";

type QuestionDraft = {
  text: string;
  choices: string[];
  type: QuestionType;
  correctIndex: number;
  correctIndexes: number[];
  points: number;
  timeLimitSec: number;
  tags: string[];
};

const EMPTY_QUESTION: QuestionDraft = {
  text: "",
  choices: ["", "", "", ""],
  type: "SINGLE",
  correctIndex: 0,
  correctIndexes: [],
  points: 1000,
  timeLimitSec: 20,
  tags: [],
};

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "SINGLE", label: "Choix unique" },
  { value: "BOOLEAN", label: "Vrai / Faux" },
  { value: "MULTIPLE", label: "Choix multiples" },
];

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
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());
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

  function changeType(qIndex: number, type: QuestionType) {
    setQuestions((qs) =>
      qs.map((q, i) => {
        if (i !== qIndex) return q;
        if (type === "BOOLEAN") {
          return { ...q, type, choices: ["Vrai", "Faux"], correctIndex: 0, correctIndexes: [] };
        }
        if (q.type === "BOOLEAN") {
          return { ...q, type, choices: ["", "", "", ""], correctIndex: 0, correctIndexes: [] };
        }
        return { ...q, type, correctIndex: 0, correctIndexes: [] };
      })
    );
  }

  function toggleMultipleCorrect(qIndex: number, cIndex: number) {
    setQuestions((qs) =>
      qs.map((q, i) => {
        if (i !== qIndex) return q;
        const has = q.correctIndexes.includes(cIndex);
        return {
          ...q,
          correctIndexes: has ? q.correctIndexes.filter((c) => c !== cIndex) : [...q.correctIndexes, cIndex],
        };
      })
    );
  }

  function addQuestion() {
    setQuestions((qs) => [...qs, { ...EMPTY_QUESTION }]);
  }

  function importFromBank(imported: QuestionDraft[]) {
    setQuestions((qs) => [
      ...qs,
      ...imported.map((q) => ({
        text: q.text,
        choices: q.choices,
        type: q.type,
        correctIndex: q.correctIndex,
        correctIndexes: q.correctIndexes,
        points: q.points,
        timeLimitSec: q.timeLimitSec,
        tags: q.tags,
      })),
    ]);
  }

  function removeQuestion(index: number) {
    setQuestions((qs) => qs.filter((_, i) => i !== index));
  }

  function moveQuestion(index: number, direction: -1 | 1) {
    setQuestions((qs) => {
      const target = index + direction;
      if (target < 0 || target >= qs.length) return qs;
      const next = [...qs];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function toggleCollapsed(index: number) {
    setCollapsed((c) => {
      const next = new Set(c);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
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
      <Card>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Titre">
            <Input required value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Catégorie">
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Card>

      <div className="flex flex-col gap-4">
        {questions.map((q, qi) => {
          const isCollapsed = collapsed.has(qi);
          return (
            <Card key={qi} padding="none" className="overflow-hidden">
              <button
                type="button"
                onClick={() => toggleCollapsed(qi)}
                className="flex w-full items-center gap-3 px-5 py-4 text-left"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-soft text-xs font-bold text-brand">
                  {qi + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink">
                    {q.text.trim() || "Énoncé à saisir…"}
                  </span>
                  {isCollapsed && (
                    <span className="mt-0.5 block text-xs text-cloudy">
                      {QUESTION_TYPES.find((t) => t.value === q.type)?.label} · {q.points} pts · {q.timeLimitSec}s
                      {q.tags.length > 0 && ` · ${q.tags.join(", ")}`}
                    </span>
                  )}
                </span>
                {isCollapsed ? (
                  <ChevronDown size={16} strokeWidth={2} className="shrink-0 text-cloudy" />
                ) : (
                  <ChevronUp size={16} strokeWidth={2} className="shrink-0 text-cloudy" />
                )}
              </button>

              {!isCollapsed && (
                <div className="border-t border-ink/10 px-5 pb-5 pt-4">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="w-48">
                      <Select value={q.type} onChange={(e) => changeType(qi, e.target.value as QuestionType)}>
                        {QUESTION_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveQuestion(qi, -1)}
                        disabled={qi === 0}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-cloudy transition hover:bg-offwhite hover:text-ink disabled:opacity-30"
                        aria-label="Monter"
                      >
                        <ArrowUp size={14} strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveQuestion(qi, 1)}
                        disabled={qi === questions.length - 1}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-cloudy transition hover:bg-offwhite hover:text-ink disabled:opacity-30"
                        aria-label="Descendre"
                      >
                        <ArrowDown size={14} strokeWidth={2} />
                      </button>
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(qi)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-cloudy transition hover:bg-red-50 hover:text-red-600"
                          aria-label="Supprimer la question"
                        >
                          <Trash2 size={14} strokeWidth={2} />
                        </button>
                      )}
                    </div>
                  </div>

                  <Field label="Énoncé" className="mb-4">
                    <Input
                      required
                      placeholder="Énoncé de la question"
                      value={q.text}
                      onChange={(e) => updateQuestion(qi, { text: e.target.value })}
                    />
                  </Field>

                  <Field
                    label="Réponses"
                    hint={q.type === "MULTIPLE" ? "Coche toutes les bonnes réponses (au moins une)." : "Sélectionne la bonne réponse."}
                    className="mb-4"
                  >
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {q.choices.map((choice, ci) => {
                        const isCorrect = q.type === "MULTIPLE" ? q.correctIndexes.includes(ci) : q.correctIndex === ci;
                        return (
                          <label
                            key={ci}
                            className={cn(
                              "flex items-center gap-2 rounded-xl border px-3 py-2 transition",
                              isCorrect ? "border-brand bg-soft/30" : "border-ink/10"
                            )}
                          >
                            {q.type === "MULTIPLE" ? (
                              <input
                                type="checkbox"
                                checked={q.correctIndexes.includes(ci)}
                                onChange={() => toggleMultipleCorrect(qi, ci)}
                                title="Bonne réponse"
                                className="h-4 w-4 accent-brand"
                              />
                            ) : (
                              <input
                                type="radio"
                                name={`correct-${qi}`}
                                checked={q.correctIndex === ci}
                                onChange={() => updateQuestion(qi, { correctIndex: ci })}
                                title="Bonne réponse"
                                className="h-4 w-4 accent-brand"
                              />
                            )}
                            <input
                              placeholder={`Proposition ${ci + 1}`}
                              value={choice}
                              disabled={q.type === "BOOLEAN"}
                              onChange={(e) => updateChoice(qi, ci, e.target.value)}
                              className="w-full bg-transparent text-sm text-ink placeholder:text-cloudy focus:outline-none disabled:text-cloudy"
                            />
                          </label>
                        );
                      })}
                    </div>
                  </Field>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-[auto_auto_1fr]">
                    <Field label="Points">
                      <span className="flex items-center gap-2">
                        <Trophy size={14} strokeWidth={2} className="text-cloudy" />
                        <NumberStepper
                          value={q.points}
                          min={0}
                          step={100}
                          onChange={(v) => updateQuestion(qi, { points: v })}
                        />
                      </span>
                    </Field>
                    <Field label="Temps (s)">
                      <span className="flex items-center gap-2">
                        <Clock size={14} strokeWidth={2} className="text-cloudy" />
                        <NumberStepper
                          value={q.timeLimitSec}
                          min={5}
                          step={5}
                          onChange={(v) => updateQuestion(qi, { timeLimitSec: v })}
                        />
                      </span>
                    </Field>
                    <Field label="Tags">
                      <TagInput
                        value={q.tags}
                        onChange={(tags) => updateQuestion(qi, { tags })}
                        placeholder="ex: RGPD, IA générative"
                      />
                    </Field>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={addQuestion}>
          <Plus size={14} strokeWidth={2.5} /> Ajouter une question
        </Button>
        <Button type="button" variant="secondary" onClick={() => setPickerOpen(true)}>
          <Library size={14} strokeWidth={2} /> Importer depuis la bibliothèque
        </Button>
      </div>

      {pickerOpen && (
        <QuestionBankPicker
          excludeQuestionnaireId={questionnaireId}
          onImport={importFromBank}
          onClose={() => setPickerOpen(false)}
        />
      )}

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <Button type="submit" loading={saving} className="self-start">
        {saving ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </form>
  );
}
