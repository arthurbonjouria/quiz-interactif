import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { RegisterForm } from "@/components/quiz/RegisterForm";
import { getCampaignStatus } from "@/lib/campaign-status";
import { Logo } from "@/components/Logo";

const CATEGORY_LABELS: Record<string, string> = {
  POSITIONNEMENT: "Positionnement",
  IA_ACT: "IA Act",
  ACQUIS: "Acquis de compétences",
};

export default async function CampaignLandingPage({ params }: { params: { code: string } }) {
  const campaign = await prisma.campaign.findUnique({
    where: { code: params.code },
    include: { questionnaire: true, company: true },
  });

  if (!campaign) notFound();

  const status = getCampaignStatus(campaign);
  const accentColor = campaign.company.brandColor;
  const logoUrl = campaign.company.logoUrl;

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-8 overflow-hidden bg-ink px-6 py-12 text-center">
      <div
        className={`animate-float-blob pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full blur-3xl ${accentColor ? "" : "bg-brand/30"}`}
        style={accentColor ? { backgroundColor: `${accentColor}4D` } : undefined}
      />
      <div
        className="animate-float-blob pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl"
        style={{ animationDelay: "2s" }}
      />
      <div className="relative flex items-center gap-4">
        <Logo variant="light" className="h-8" />
        {logoUrl && (
          <>
            <span className="h-6 w-px bg-white/25" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoUrl} alt={campaign.company.name} className="h-7 max-w-[110px] object-contain" />
          </>
        )}
      </div>
      <div className="animate-pop-in relative flex w-full max-w-md flex-col items-center gap-8 rounded-3xl bg-white p-8 shadow-2xl sm:p-10">
        <div>
          <p
            className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand"
            style={accentColor ? { color: accentColor } : undefined}
          >
            {CATEGORY_LABELS[campaign.questionnaire.category] ?? campaign.questionnaire.category}
          </p>
          <h1 className="text-2xl font-bold sm:text-3xl">{campaign.questionnaire.title}</h1>
          <p className="mt-2 text-sm text-neutral-600">{campaign.company.name}</p>
        </div>
        {status === "active" ? (
          <RegisterForm code={campaign.code} accentColor={accentColor} />
        ) : (
          <p className="rounded-lg bg-neutral-100 px-4 py-3 text-sm text-neutral-600">
            {status === "expired"
              ? "Cette campagne est terminée, les inscriptions ne sont plus ouvertes."
              : "Cette campagne n'est plus disponible."}
          </p>
        )}
      </div>
    </main>
  );
}
