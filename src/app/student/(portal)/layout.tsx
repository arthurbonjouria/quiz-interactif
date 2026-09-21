import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { Logo } from "@/components/Logo";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-offwhite">
      <header className="flex items-center justify-between px-6 py-6 sm:px-10">
        <Link href="/student">
          <Logo className="h-7" />
        </Link>
        <div className="flex items-center gap-4 text-sm text-neutral-500">
          <span className="hidden sm:inline">{session?.user?.name}</span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/student/login" });
            }}
          >
            <button type="submit" className="font-medium text-ink hover:text-brand">
              Déconnexion
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 pb-16 sm:px-10">{children}</main>
    </div>
  );
}
