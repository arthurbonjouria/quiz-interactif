import { NextResponse } from "next/server";
import Papa from "papaparse";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";

const bodySchema = z.object({
  title: z.string().min(1),
  category: z.enum(["POSITIONNEMENT", "IA_ACT", "ACQUIS"]),
  csv: z.string().min(1),
});

// Colonnes attendues : question,choix1,choix2,choix3,choix4,bonne_reponse,points,temps_limite
// bonne_reponse : numéro (1-based) de la bonne proposition
export async function POST(req: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Formulaire invalide" }, { status: 400 });
  }
  const { title, category, csv } = parsed.data;

  const parseResult = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  });

  if (parseResult.errors.length > 0) {
    return NextResponse.json({ error: "CSV illisible", details: parseResult.errors }, { status: 400 });
  }

  const rows = parseResult.data;
  if (rows.length === 0) {
    return NextResponse.json({ error: "Le CSV ne contient aucune ligne de question." }, { status: 400 });
  }

  const questions = rows.map((row, i) => {
    const choices = [row.choix1, row.choix2, row.choix3, row.choix4].filter((c): c is string => Boolean(c && c.trim()));
    const correctIndex = Math.max(0, parseInt(row.bonne_reponse ?? "1", 10) - 1);
    return {
      text: row.question ?? `Question ${i + 1}`,
      choices: JSON.stringify(choices),
      correctIndex,
      points: parseInt(row.points ?? "1000", 10) || 1000,
      timeLimitSec: parseInt(row.temps_limite ?? "20", 10) || 20,
      order: i,
    };
  });

  const invalid = questions.some((q) => JSON.parse(q.choices).length < 2 || q.correctIndex >= JSON.parse(q.choices).length);
  if (invalid) {
    return NextResponse.json(
      { error: "Certaines lignes ont moins de 2 propositions ou une bonne réponse hors limites." },
      { status: 400 }
    );
  }

  const questionnaire = await prisma.questionnaire.create({
    data: { title, category, questions: { create: questions } },
  });

  return NextResponse.json({ id: questionnaire.id, questionCount: questions.length }, { status: 201 });
}
