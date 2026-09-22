import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { CompanySettingsForm } from "@/components/admin/CompanySettingsForm";
import { CompanyBrandingForm } from "@/components/admin/CompanyBrandingForm";
import { ResendCertificateButton } from "@/components/admin/ResendCertificateButton";
import { BarChart } from "@/components/admin/BarChart";
import { auth } from "@/lib/auth";
import { isOwner } from "@/lib/require-admin";
import { LinkButton } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Disclosure } from "@/components/ui/Disclosure";
import { Tabs } from "@/components/ui/Tabs";
import { TableCard, Table, Thead, Th, Tr, Td, EmptyRow } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { Users2 } from "lucide-react";

export default async function CompanyDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const owner = isOwner(session);

  const company = await prisma.company.findUnique({
    where: { id: params.id },
    include: {
      campaigns: {
        where: owner ? {} : { createdById: session?.user?.id },
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

  const allAttemptsForCompany = company.campaigns.flatMap((c) => c.attempts);
  const allAnswersForCompany = allAttemptsForCompany.flatMap((a) => a.answers);
  const uniqueParticipants = new Set(allAttemptsForCompany.map((a) => a.participantId)).size;
  const finishedForCompany = allAttemptsForCompany.filter((a) => a.finishedAt);
  const globalCompletionRate =
    allAttemptsForCompany.length > 0
      ? Math.round((finishedForCompany.length / allAttemptsForCompany.length) * 100)
      : 0;
  const globalSuccessRateForCompany =
    allAnswersForCompany.length > 0
      ? Math.round((allAnswersForCompany.filter((a) => a.correct).length / allAnswersForCompany.length) * 100)
      : 0;

  const completionByCampaign = company.campaigns.map((c) => ({
    label: c.label,
    value: c.attempts.length > 0 ? (c.attempts.filter((a) => a.finishedAt).length / c.attempts.length) * 100 : 0,
  }));
  const successByCampaign = company.campaigns.map((c) => {
    const answers = c.attempts.flatMap((a) => a.answers);
    return { label: c.label, value: answers.length > 0 ? (answers.filter((a) => a.correct).length / answers.length) * 100 : 0 };
  });

  const otherCompanies = await prisma.company.findMany({
    where: { id: { not: company.id } },
    select: { id: true, name: true, domain: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{company.name}</h1>
          <p className="text-sm text-cloudy">{company.domain}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <LinkButton href={`/api/admin/companies/${company.id}/export`}>Export PDF (toutes campagnes)</LinkButton>
          <LinkButton href={`/api/admin/companies/${company.id}/export-csv`} variant="secondary">
            Export CSV
          </LinkButton>
        </div>
      </div>

      <Tabs
        tabs={[
          {
            key: "settings",
            label: "Paramètres",
            content: (
              <CompanySettingsForm
                companyId={company.id}
                initialName={company.name}
                initialDomain={company.domain}
                otherCompanies={otherCompanies}
              />
            ),
          },
          {
            key: "branding",
            label: "Branding",
            content: (
              <CompanyBrandingForm
                companyId={company.id}
                initialLogoUrl={company.logoUrl}
                initialBrandColor={company.brandColor}
              />
            ),
          },
          {
            key: "analytics",
            label: "Analytics",
            content:
              company.campaigns.length > 0 ? (
                <Card>
                  <CardHeader
                    title="Vue d'ensemble"
                    description="Toutes campagnes confondues, pour vos comptes-rendus RH."
                  />
                  <div className="grid grid-cols-3 gap-4">
                    <StatCard label="Participants" value={uniqueParticipants} />
                    <StatCard label="Complétion globale" value={`${globalCompletionRate}%`} />
                    <StatCard label="Réussite globale" value={`${globalSuccessRateForCompany}%`} />
                  </div>
                  <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-cloudy">
                        Taux de complétion par campagne
                      </p>
                      <BarChart items={completionByCampaign} color="#E83967" />
                    </div>
                    <div>
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-cloudy">
                        Taux de réussite par campagne
                      </p>
                      <BarChart items={successByCampaign} color="#B1ADA1" />
                    </div>
                  </div>
                </Card>
              ) : (
                <EmptyState icon={Users2} title="Pas encore de données" description="Lancez une campagne pour voir apparaître les analytics ici." />
              ),
          },
          {
            key: "campaigns",
            label: `Campagnes (${company.campaigns.length})`,
            content: (
              <div className="flex flex-col gap-6">
                {company.campaigns.length === 0 && (
                  <EmptyState icon={Users2} title="Aucune campagne pour cette entreprise pour l'instant" />
                )}
                {company.campaigns.map((campaign) => {
                  const finished = campaign.attempts.filter((a) => a.finishedAt);
                  const completionRate =
                    campaign.attempts.length > 0 ? Math.round((finished.length / campaign.attempts.length) * 100) : 0;
                  const avgScore =
                    finished.length > 0 ? Math.round(finished.reduce((s, a) => s + a.totalScore, 0) / finished.length) : 0;

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
                    <Card key={campaign.id}>
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <h2 className="text-lg font-semibold text-ink">{campaign.label}</h2>
                          <p className="text-xs text-cloudy">
                            {campaign.questionnaire.title} · Lien : /s/{campaign.code}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <LinkButton
                            href={`/api/admin/companies/${company.id}/export?campaignId=${campaign.id}`}
                            variant="secondary"
                            size="sm"
                          >
                            Export PDF
                          </LinkButton>
                          <LinkButton
                            href={`/api/admin/companies/${company.id}/export-csv?campaignId=${campaign.id}`}
                            variant="secondary"
                            size="sm"
                          >
                            Export CSV
                          </LinkButton>
                        </div>
                      </div>

                      <div className="my-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <StatCard label="Complétion" value={`${completionRate}%`} />
                        <StatCard label="Score moyen" value={avgScore} />
                        <StatCard label="Réussite globale" value={globalSuccessRate === null ? "—" : `${globalSuccessRate}%`} />
                        <StatCard label="Participants" value={campaign.attempts.length} />
                      </div>

                      <Disclosure label="Taux de réussite par question">
                        <ul className="flex flex-col gap-1">
                          {questionStats.map((qs, i) => (
                            <li key={i} className="flex justify-between border-b border-ink/5 py-1.5 text-xs">
                              <span className="pr-4 text-ink/70">{qs.text}</span>
                              <span className="whitespace-nowrap font-semibold text-ink">
                                {qs.rate === null ? "—" : `${qs.rate}% (${qs.total})`}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </Disclosure>

                      <TableCard className="mt-4 shadow-none">
                        <Table>
                          <Thead>
                            <Th>Participant</Th>
                            <Th>Statut</Th>
                            <Th>Score</Th>
                            <Th>Réussite</Th>
                            <Th>Date</Th>
                            <Th>Certificat</Th>
                          </Thead>
                          <tbody>
                            {campaign.attempts.map((a) => {
                              const answeredCount = a.answers.length;
                              const correctCount = a.answers.filter((ans) => ans.correct).length;
                              const successRate = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : null;

                              return (
                                <Tr key={a.id}>
                                  <Td>
                                    {a.participant.firstName} {a.participant.lastName}
                                    <div className="text-xs text-cloudy">{a.participant.email}</div>
                                  </Td>
                                  <Td>{a.finishedAt ? "Terminé" : "En cours"}</Td>
                                  <Td>{a.totalScore}</Td>
                                  <Td>{successRate === null ? "—" : `${successRate}% (${correctCount}/${answeredCount})`}</Td>
                                  <Td className="text-cloudy">{a.finishedAt ? a.finishedAt.toLocaleDateString("fr-FR") : "-"}</Td>
                                  <Td>
                                    {a.certificate ? (
                                      <div className="flex items-center gap-3">
                                        <Link href={`/api/attempts/${a.id}/certificate`} className="font-semibold text-brand hover:underline">
                                          Télécharger
                                        </Link>
                                        <ResendCertificateButton attemptId={a.id} />
                                      </div>
                                    ) : (
                                      <span className="text-xs text-cloudy">-</span>
                                    )}
                                  </Td>
                                </Tr>
                              );
                            })}
                            {campaign.attempts.length === 0 && (
                              <EmptyRow colSpan={6}>Aucun participant pour l&apos;instant.</EmptyRow>
                            )}
                          </tbody>
                        </Table>
                      </TableCard>
                    </Card>
                  );
                })}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
