import { Suspense } from "react";
import { Logo } from "@/components/Logo";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default function StudentResetPasswordPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-offwhite px-6 py-12">
      <div className="w-full max-w-sm rounded-3xl bg-white p-10 shadow-[0_8px_40px_-8px_rgba(0,0,0,0.12)]">
        <Logo className="mb-6 h-9" />
        <Suspense>
          <ResetPasswordForm portal="student" loginHref="/student/login" />
        </Suspense>
      </div>
    </main>
  );
}
