export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-bold">
        BONJOUR <span className="text-brand">IA</span>
      </h1>
      <p className="max-w-md text-sm text-neutral-600">
        Cet outil de quiz s&apos;utilise via un lien de campagne (ex. <code>/s/VOTRECODE</code>) transmis par
        BONJOUR IA, ou via le{" "}
        <a href="/admin/login" className="font-medium text-brand underline">
          back-office
        </a>{" "}
        pour l&apos;équipe BONJOUR IA.
      </p>
    </main>
  );
}
