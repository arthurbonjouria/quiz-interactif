"use client";

import { useState } from "react";
import { QuestionnaireEditor } from "@/components/admin/QuestionnaireEditor";
import { CsvImportForm } from "@/components/admin/CsvImportForm";
import { cn } from "@/lib/cn";

export default function NewQuestionnairePage() {
  const [mode, setMode] = useState<"manual" | "csv">("csv");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Nouveau questionnaire</h1>

      <div className="flex gap-2 text-sm">
        <button
          onClick={() => setMode("csv")}
          className={cn(
            "rounded-xl px-4 py-2 font-semibold transition",
            mode === "csv" ? "bg-brand text-white" : "border border-ink/15 text-ink hover:border-brand hover:text-brand"
          )}
        >
          Import CSV
        </button>
        <button
          onClick={() => setMode("manual")}
          className={cn(
            "rounded-xl px-4 py-2 font-semibold transition",
            mode === "manual" ? "bg-brand text-white" : "border border-ink/15 text-ink hover:border-brand hover:text-brand"
          )}
        >
          Saisie manuelle
        </button>
      </div>

      {mode === "csv" ? <CsvImportForm /> : <QuestionnaireEditor />}
    </div>
  );
}
