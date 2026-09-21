import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { LiveHostClient } from "@/components/admin/LiveHostClient";
import { Logo } from "@/components/Logo";
import { auth } from "@/lib/auth";
import { isOwner } from "@/lib/require-admin";

export default async function LiveHostPage({ params }: { params: { id: string } }) {
  const adminSession = await auth();
  const session = await prisma.liveSession.findUnique({
    where: { id: params.id },
    include: { campaign: { select: { createdById: true } } },
  });
  if (!session) notFound();
  if (!isOwner(adminSession) && session.campaign.createdById !== adminSession?.user?.id) notFound();

  return (
    <div className="-mx-4 -my-6 flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-ink px-6 py-10 sm:-mx-6 sm:-my-8">
      <Logo variant="light" className="mb-6 h-7" />
      <LiveHostClient sessionId={session.id} />
    </div>
  );
}
