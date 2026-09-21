import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { QuestionnaireEditor } from "@/components/admin/QuestionnaireEditor";

export default async function EditQuestionnairePage({ params }: { params: { id: string } }) {
  const questionnaire = await prisma.questionnaire.findUnique({
    where: { id: params.id },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  if (!questionnaire) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">{questionnaire.title}</h1>
      <QuestionnaireEditor
        questionnaireId={questionnaire.id}
        initialTitle={questionnaire.title}
        initialCategory={questionnaire.category}
        initialQuestions={questionnaire.questions.map((q) => ({
          text: q.text,
          choices: JSON.parse(q.choices) as string[],
          correctIndex: q.correctIndex,
          points: q.points,
          timeLimitSec: q.timeLimitSec,
          tags: JSON.parse(q.tags) as string[],
        }))}
      />
    </div>
  );
}
