import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { AdminNav } from "@/components/admin/AdminNav";
import { isOwner } from "@/lib/require-admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-offwhite">
      <header className="flex flex-col gap-3 border-b border-neutral-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between gap-4 sm:justify-start sm:gap-8">
          <Link href="/admin" className="shrink-0">
            <Logo className="h-7" />
          </Link>
          <div className="flex items-center gap-3 text-xs text-neutral-500 sm:hidden">
            <span className="max-w-[140px] truncate">{session?.user?.email}</span>
            <SignOutButton />
          </div>
        </div>
        <AdminNav isOwner={isOwner(session)} />
        <div className="hidden items-center gap-4 text-sm text-neutral-500 sm:flex">
          <span>{session?.user?.email}</span>
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}

function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/admin/login" });
      }}
    >
      <button type="submit" className="font-medium text-ink hover:text-brand">
        Déconnexion
      </button>
    </form>
  );
}
