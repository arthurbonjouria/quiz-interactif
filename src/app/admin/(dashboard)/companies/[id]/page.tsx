import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { CompanySettingsForm } from "@/components/admin/CompanySettingsForm";
import { ResendCertificateButton } from "@/components/admin/ResendCertificateButton";

export default async function CompanyDetailPage({ params }: { params: { id: string } }) {
  const company = await prisma.company.findUnique({
    where: { id: params.id },
    include: {
      campaigns: {
        orderBy: { createdAt: "desc" },
        include: {
          questionnaire: { include: { questions: true } },
          attempts: {
            orderBy: { startedAt: "desc" },
            include: { participant: true, answers: true, certificate: true },
          },
        },
      },
    },
  });

  if (!company) notFound();

  const otherCompanies = await prisma.company.findMany({
    where: { id: { not: company.id } },
    select: { id: true, name: true, domain: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{company.name}</h1>
          <p className="text-sm text-neutral-500">{company.domain}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a href={`/api/admin/companies/${company.id}/export`} className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-brand">
            Export PDF (toutes campagnes)
          </a>
          <a href={`/api/admin/companies/${company.id}/export-csv`} className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium hover:border-ink">
            Export CSV
          </a>
        </div>
      </div>

      <CompanySettingsForm companyId={company.id} initialName={company.name} initialDomain={company.domain} otherCompanies={otherCompanies} />

      {company.campaigns.length === 0 && (
        <p className="text-sm text-neutral-400">Aucune campagne pour cette entreprise pour l&apos;instant.</p>
      )}

      {company.campaigns.map((campaign) => {
        const finished = campaign.attempts.filter((a) => a.finishedAt);
        const completionRate = campaign.attempts.length > 0 ? Math.round((finished.length / campaign.attempts.length) * 100) : 0;
        const avgScore = finished.length > 0 ? Math.round(finished.reduce((s, a) => s + a.totalScore, 0) / finished.length) : 0;

        const allAnswers = campaign.attempts.flatMap((a) => a.answers);
        const globalSuccessRate =
          allAnswers.length > 0
            ? Math.round((allAnswers.filter((a) => a.correct).length / allAnswers.length) * 100)
            : null;

        const questionStats = campaign.questionnaire.questions.map((q) => {
          const answers = campaign.attempts.flatMap((a) => a.answers).filter((ans) => ans.questionId === q.id);
          const correctCount = answers.filter((a) => a.correct).length;
          const rate = answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : null;
          return { text: q.text, rate, total: answers.length };
        });

        return (
          <div key={campaign.id} className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">{campaign.label}</h2>
                <p className="text-xs text-neutral-500">
                  {campaign.questionnaire.title} · Lien : /s/{campaign.code}
                </p>
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <Stat label="Complétion" value={`${completionRate}%`} />
                <Stat label="Score moyen" value={avgScore} />
                <Stat label="Réussite globale" value={globalSuccessRate === null ? "—" : `${globalSuccessRate}%`} />
                <Stat label="Participants" value={campaign.attempts.length} />
              </div>
              <div className="flex gap-2">
                <a
                  href={`/api/admin/companies/${company.id}/export?campaignId=${campaign.id}`}
                  className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:border-ink"
                >
                  Export PDF campagne
                </a>
                <a
                  href={`/api/admin/companies/${company.id}/export-csv?campaignId=${campaign.id}`}
                  className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:border-ink"
                >
                  Export CSV campagne
                </a>
              </div>
            </div>

            <details className="text-sm">
              <summary className="cursor-pointer font-medium text-neutral-600">
                Taux de réussite par question
              </summary>
              <ul className="mt-2 flex flex-col gap-1">
                {questionStats.map((qs, i) => (
                  <li key={i} className="flex justify-between border-b border-neutral-100 py-1 text-xs">
                    <span className="pr-4 text-neutral-600">{qs.text}</span>
                    <span className="whitespace-nowrap font-medium">{qs.rate === null ? "—" : `${qs.rate}% (${qs.total})`}</span>
                  </li>
                ))}
              </ul>
            </details>

            <div className="overflow-x-auto rounded-lg border border-neutral-100">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
                  <tr>
                    <th className="px-3 py-2">Participant</th>
                    <th className="px-3 py-2">Statut</th>
                    <th className="px-3 py-2">Score</th>
                    <th className="px-3 py-2">Réussite</th>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Certificat</th>
                  </tr>
                </thead>
                <tbody>
                  {campaign.attempts.map((a) => {
                    const answeredCount = a.answers.length;
                    const correctCount = a.answers.filter((ans) => ans.correct).length;
                    const successRate = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : null;

                    return (
                      <tr key={a.id} className="border-t border-neutral-100">
                        <td className="px-3 py-2">
                          {a.participant.firstName} {a.participant.lastName}
                          <div className="text-xs text-neutral-400">{a.participant.email}</div>
                        </td>
                        <td className="px-3 py-2">{a.finishedAt ? "Terminé" : "En cours"}</td>
                        <td className="px-3 py-2">{a.totalScore}</td>
                        <td className="px-3 py-2">
                          {successRate === null ? "—" : `${successRate}% (${correctCount}/${answeredCount})`}
                        </td>
                        <td className="px-3 py-2 text-neutral-500">
                          {a.finishedAt ? a.finishedAt.toLocaleDateString("fr-FR") : "-"}
                        </td>
                        <td className="px-3 py-2">
                          {a.certificate ? (
                            <div className="flex items-center gap-3">
                              <Link href={`/api/attempts/${a.id}/certificate`} className="text-brand hover:underline">
                                Télécharger
                              </Link>
                              <ResendCertificateButton attemptId={a.id} />
                            </div>
                          ) : (
                            <span className="text-xs text-neutral-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {campaign.attempts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-3 py-4 text-center text-neutral-400">
                        Aucun participant pour l&apos;instant.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center">
      <p className="text-xs text-neutral-400">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
