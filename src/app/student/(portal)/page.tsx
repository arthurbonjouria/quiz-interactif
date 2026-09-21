import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { computeGradeOutOf10 } from "@/lib/grade";

const CATEGORY_LABELS: Record<string, string> = {
  POSITIONNEMENT: "Positionnement",
  IA_ACT: "IA Act",
  ACQUIS: "Acquis de compétences",
};

function getAttempts(participantId: string) {
  return prisma.attempt.findMany({
    where: { participantId },
    include: {
      campaign: { include: { questionnaire: { include: { questions: true } } } },
      answers: true,
      certificate: true,
    },
    orderBy: { startedAt: "desc" },
  });
}

type AttemptWithRelations = Awaited<ReturnType<typeof getAttempts>>[number];

export default async function StudentDashboardPage() {
  const session = await auth();
  const participantId = session?.user?.id as string;

  const attempts = await getAttempts(participantId);

  const finished = attempts.filter((a) => a.finishedAt);
  const graded = finished.filter((a) => a.campaign.videoUrl);
  const ungraded = finished.filter((a) => !a.campaign.videoUrl);

  const avgGrade =
    graded.length > 0
      ? Math.round(
          (graded.reduce(
            (s, a) => s + computeGradeOutOf10(a.answers.filter((x) => x.correct).length, a.campaign.questionnaire.questions.length),
            0
          ) /
            graded.length) *
            10
        ) / 10
      : null;
  const avgScore =
    ungraded.length > 0 ? Math.round(ungraded.reduce((s, a) => s + a.totalScore, 0) / ungraded.length) : null;

  return (
    <div className="flex flex-col gap-10 pt-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bonjour {session?.user?.name?.split(" ")[0]}</h1>
        <p className="mt-1 text-neutral-500">Voici l&apos;état de vos cours et de vos résultats.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Cours" value={attempts.length} />
        <StatCard label="Terminés" value={finished.length} />
        {avgGrade !== null && <StatCard label="Note moyenne" value={`${avgGrade}/10`} />}
        {avgScore !== null && <StatCard label="Score moyen" value={avgScore} />}
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Mes cours</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {attempts.map((a) => (
            <CourseCard key={a.id} attempt={a} />
          ))}
          {attempts.length === 0 && (
            <p className="col-span-2 rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-400">
              Aucun cours pour l&apos;instant. Vous recevrez un email dès qu&apos;on vous en attribue un.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.06)]">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}

function CourseCard({ attempt: a }: { attempt: AttemptWithRelations }) {
  const isGraded = Boolean(a.campaign.videoUrl);
  const totalQuestions = a.campaign.questionnaire.questions.length;
  const grade = isGraded ? computeGradeOutOf10(a.answers.filter((x) => x.correct).length, totalQuestions) : null;

  const status = a.finishedAt ? "done" : a.answers.length > 0 ? "in_progress" : "todo";

  const href = a.finishedAt
    ? `/s/${a.campaign.code}/result/${a.id}`
    : isGraded && a.answers.length === 0
      ? `/s/${a.campaign.code}/video?attempt=${a.id}`
      : `/s/${a.campaign.code}/play?attempt=${a.id}`;

  const ctaLabel = a.finishedAt ? "Voir le résultat" : status === "in_progress" ? "Continuer" : "Commencer";

  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-3xl bg-white p-6 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.06)] transition hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.12)]"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-brand">
          {CATEGORY_LABELS[a.campaign.questionnaire.category] ?? a.campaign.questionnaire.category}
        </span>
        <StatusBadge status={status} />
      </div>
      <h3 className="text-lg font-semibold leading-snug">{a.campaign.questionnaire.title}</h3>
      <p className="text-sm text-neutral-400">{a.campaign.label}</p>

      {a.finishedAt && (
        <p className="text-2xl font-bold text-ink">{isGraded ? `${grade}/10` : `${a.totalScore} pts`}</p>
      )}

      <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-ink group-hover:text-brand">
        {ctaLabel} <span aria-hidden>→</span>
      </span>
    </Link>
  );
}

function StatusBadge({ status }: { status: "todo" | "in_progress" | "done" }) {
  const config = {
    todo: { label: "À faire", classes: "bg-neutral-100 text-neutral-500" },
    in_progress: { label: "En cours", classes: "bg-yellow-100 text-yellow-700" },
    done: { label: "Terminé", classes: "bg-green-100 text-green-700" },
  }[status];

  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${config.classes}`}>{config.label}</span>;
}
