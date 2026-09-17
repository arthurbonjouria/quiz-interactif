import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { LiveHostClient } from "@/components/admin/LiveHostClient";

export default async function LiveHostPage({ params }: { params: { id: string } }) {
  const session = await prisma.liveSession.findUnique({ where: { id: params.id } });
  if (!session) notFound();

  return (
    <div className="-mx-4 -my-6 flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-ink px-6 py-10 sm:-mx-6 sm:-my-8">
      <LiveHostClient sessionId={session.id} />
    </div>
  );
}
