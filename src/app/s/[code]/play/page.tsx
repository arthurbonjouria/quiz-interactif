import { redirect } from "next/navigation";
import { PlayClient } from "@/components/quiz/PlayClient";

export default function PlayPage({
  params,
  searchParams,
}: {
  params: { code: string };
  searchParams: { attempt?: string };
}) {
  if (!searchParams.attempt) {
    redirect(`/s/${params.code}`);
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ink px-6 py-10">
      <div className="animate-float-blob pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand/30 blur-3xl" />
      <div
        className="animate-float-blob pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl"
        style={{ animationDelay: "2s" }}
      />
      <PlayClient attemptId={searchParams.attempt} code={params.code} />
    </main>
  );
}
