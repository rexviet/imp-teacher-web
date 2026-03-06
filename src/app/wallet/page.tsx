"use client";

import { TeacherShell } from "@/components/teacher-shell";
import { useTeacherGuard } from "@/hooks/useTeacherGuard";

export default function WalletPage() {
  const { loading, user } = useTeacherGuard();

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-600">Loading...</p>
      </main>
    );
  }

  return (
    <TeacherShell
      title="My Wallet"
      subtitle="Wallet features will be implemented in the next phase."
    >
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">
          Placeholder page: balance, payout history, and transactions are coming soon.
        </p>
      </section>
    </TeacherShell>
  );
}
