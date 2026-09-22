"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, FileCheck2, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FileDropzone } from "@/components/ui/FileDropzone";

const TEMPLATE_CSV =
  "question,choix1,choix2,choix3,choix4,bonne_reponse,points,temps_limite\n" +
  '"Que signifie IA ?","Intelligence Artificielle","Interface Automatique","Internet Avancé","Ingénierie Appliquée",1,1000,20\n';

export function CsvImportForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("IA_ACT");
  const [csv, setCsv] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleFile(file: File) {
    setFileName(file.name);
    setCsv(await file.text());
  }

  function downloadTemplate() {
    const blob = new Blob([TEMPLATE_CSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "modele-questionnaire.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const res = await fetch("/api/admin/questionnaires/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, category, csv }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Import impossible.");
      return;
    }
    router.push("/admin/questionnaires");
    router.refresh();
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Titre du questionnaire">
            <Input required placeholder="Titre du questionnaire" value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Catégorie">
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="POSITIONNEMENT">Positionnement</option>
              <option value="IA_ACT">IA Act</option>
              <option value="ACQUIS">Acquis de compétences</option>
            </Select>
          </Field>
        </div>

        <Field
          label="Fichier CSV"
          hint="colonnes : question, choix1, choix2, choix3, choix4, bonne_reponse, points, temps_limite"
        >
          {fileName ? (
            <div className="flex items-center gap-3 rounded-xl border border-ink/10 bg-white px-4 py-3">
              <FileCheck2 size={18} strokeWidth={2} className="text-brand" />
              <span className="flex-1 text-sm font-medium text-ink">{fileName}</span>
              <span className="text-xs text-cloudy">{csv.trim().split("\n").length - 1} ligne(s)</span>
              <button
                type="button"
                onClick={() => {
                  setFileName(null);
                  setCsv("");
                }}
                className="text-cloudy hover:text-red-600"
                aria-label="Retirer le fichier"
              >
                <X size={14} strokeWidth={2} />
              </button>
            </div>
          ) : (
            <FileDropzone onFile={handleFile} accept=".csv" label="Glissez un fichier CSV ici, ou cliquez pour parcourir" />
          )}
        </Field>

        <button
          type="button"
          onClick={downloadTemplate}
          className="flex items-center gap-1.5 self-start text-xs font-semibold text-brand hover:underline"
        >
          <Download size={12} strokeWidth={2.5} /> Télécharger un modèle CSV d&apos;exemple
        </button>

        {error && <p className="text-sm font-medium text-red-600">{error}</p>}

        <Button type="submit" loading={saving} disabled={!csv} className="self-start">
          {saving ? "Import en cours…" : "Importer"}
        </Button>
      </form>
    </Card>
  );
}
