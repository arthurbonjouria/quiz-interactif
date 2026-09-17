"use client";

import { useState } from "react";
import { QuestionnaireEditor } from "@/components/admin/QuestionnaireEditor";
import { CsvImportForm } from "@/components/admin/CsvImportForm";

export default function NewQuestionnairePage() {
  const [mode, setMode] = useState<"manual" | "csv">("csv");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Nouveau questionnaire</h1>

      <div className="flex gap-2 text-sm">
        <button
          onClick={() => setMode("csv")}
          className={`rounded-lg px-4 py-2 font-medium ${mode === "csv" ? "bg-ink text-white" : "border border-neutral-300"}`}
        >
          Import CSV
        </button>
        <button
          onClick={() => setMode("manual")}
          className={`rounded-lg px-4 py-2 font-medium ${mode === "manual" ? "bg-ink text-white" : "border border-neutral-300"}`}
        >
          Saisie manuelle
        </button>
      </div>

      {mode === "csv" ? <CsvImportForm /> : <QuestionnaireEditor />}
    </div>
  );
}
