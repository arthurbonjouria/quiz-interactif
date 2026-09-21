import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function AdminForgotPasswordPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-offwhite px-6 py-12">
      <div className="w-full max-w-sm rounded-3xl bg-white p-10 shadow-[0_8px_40px_-8px_rgba(0,0,0,0.12)]">
        <Logo className="mb-6 h-9" />
        <ForgotPasswordForm portal="admin" loginHref="/admin/login" />
      </div>
      <Link href="/" className="mt-6 text-xs text-neutral-400 hover:text-ink">
        ← Retour à l&apos;accueil
      </Link>
    </main>
  );
}
