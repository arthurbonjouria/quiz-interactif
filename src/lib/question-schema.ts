import { z } from "zod";

export const questionSchema = z
  .object({
    text: z.string().min(1),
    choices: z.array(z.string().min(1)).min(2).max(6),
    type: z.enum(["SINGLE", "BOOLEAN", "MULTIPLE"]).default("SINGLE"),
    correctIndex: z.number().int().min(0).default(0),
    correctIndexes: z.array(z.number().int().min(0)).default([]),
    points: z.number().int().min(1).default(1000),
    timeLimitSec: z.number().int().min(5).default(20),
    order: z.number().int().default(0),
    tags: z.array(z.string().min(1)).default([]),
  })
  .refine(
    (q) => (q.type === "MULTIPLE" ? q.correctIndexes.length >= 1 : q.correctIndex < q.choices.length),
    { message: "Bonne(s) réponse(s) invalide(s) pour ce type de question." }
  );

export type QuestionInput = z.infer<typeof questionSchema>;

export function questionCreateData(q: QuestionInput, order: number) {
  return {
    text: q.text,
    choices: JSON.stringify(q.choices),
    type: q.type,
    correctIndex: q.type === "MULTIPLE" ? 0 : q.correctIndex,
    correctIndexes: JSON.stringify(q.type === "MULTIPLE" ? q.correctIndexes : []),
    points: q.points,
    timeLimitSec: q.timeLimitSec,
    order: q.order ?? order,
    tags: JSON.stringify(q.tags),
  };
}
