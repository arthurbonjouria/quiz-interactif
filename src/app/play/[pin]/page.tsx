import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { LiveJoinForm } from "@/components/quiz/LiveJoinForm";
import { Logo } from "@/components/Logo";

export default async function LiveJoinPage({ params }: { params: { pin: string } }) {
  const session = await prisma.liveSession.findUnique({
    where: { pin: params.pin },
    include: { campaign: { include: { questionnaire: true, company: true } } },
  });

  if (!session) notFound();

  if (session.status !== "LOBBY") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-ink px-6 text-center text-white">
        <p className="text-lg font-semibold">Cette partie a déjà démarré.</p>
        <p className="mt-2 text-sm text-white/60">Demandez à l&apos;animateur un nouveau code.</p>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-8 overflow-hidden bg-ink px-6 py-12 text-center">
      <div className="animate-float-blob pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand/30 blur-3xl" />
      <div
        className="animate-float-blob pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl"
        style={{ animationDelay: "2s" }}
      />
      <Logo variant="light" className="relative h-8" />
      <div className="animate-pop-in relative flex w-full max-w-md flex-col items-center gap-8 rounded-3xl bg-white p-8 shadow-2xl sm:p-10">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand">Session live</p>
          <h1 className="text-2xl font-bold sm:text-3xl">{session.campaign.questionnaire.title}</h1>
          <p className="mt-2 text-sm text-neutral-600">{session.campaign.company.name}</p>
        </div>
        <LiveJoinForm pin={session.pin} />
      </div>
    </main>
  );
}
