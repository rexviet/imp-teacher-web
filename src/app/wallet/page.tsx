"use client";

import { TeacherShell } from "@/components/teacher-shell";
import { useTeacherGuard } from "@/hooks/useTeacherGuard";
import { getCreditTransactions, type CreditTransaction } from "@/lib/teacher-api";
import { useEffect, useMemo, useState } from "react";

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function txColor(type: CreditTransaction["type"]) {
  if (type === "EARN" || type === "TOPUP") {
    return "text-emerald-700";
  }
  return "text-rose-700";
}

export default function WalletPage() {
  const { loading, user, token, profile } = useTeacherGuard();
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    let mounted = true;

    const load = async () => {
      setLoadingTx(true);
      setTxError(null);
      try {
        const data = await getCreditTransactions(token);
        if (mounted) {
          setTransactions(data);
        }
      } catch (error) {
        if (mounted) {
          setTxError(error instanceof Error ? error.message : "Failed to load transactions");
        }
      } finally {
        if (mounted) {
          setLoadingTx(false);
        }
      }
    };

    load().catch(() => {
      if (mounted) {
        setTxError("Unexpected error while loading wallet data");
        setLoadingTx(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, [token]);

  const earned = useMemo(
    () => transactions.filter((item) => item.type === "EARN").reduce((sum, item) => sum + item.amount, 0),
    [transactions],
  );

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-600">Loading...</p>
      </main>
    );
  }

  return (
    <TeacherShell title="My Wallet" subtitle="View your balance and latest credit transactions.">
      <div className="space-y-5">
        {txError ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {txError}
          </div>
        ) : null}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Current Balance</p>
            <p className="mt-2 font-mono text-2xl font-bold text-slate-800">{profile?.creditBalance ?? 0} CR</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Total Earned</p>
            <p className="mt-2 font-mono text-2xl font-bold text-emerald-700">+{earned} CR</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Recent Activities</p>
            <p className="mt-2 font-mono text-2xl font-bold text-slate-800">{transactions.length}</p>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Transactions</h2>

          {loadingTx ? <p className="text-sm text-slate-500">Loading transactions...</p> : null}

          {!loadingTx && transactions.length === 0 ? (
            <p className="text-sm text-slate-500">No transactions found.</p>
          ) : null}

          {!loadingTx && transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.12em] text-slate-400">
                    <th className="px-2 py-2">Time</th>
                    <th className="px-2 py-2">Type</th>
                    <th className="px-2 py-2">Description</th>
                    <th className="px-2 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100">
                      <td className="px-2 py-3 text-slate-600">{formatDate(item.createdAt)}</td>
                      <td className="px-2 py-3 font-semibold text-slate-700">{item.type}</td>
                      <td className="px-2 py-3 text-slate-600">{item.description || "-"}</td>
                      <td className={`px-2 py-3 text-right font-mono font-bold ${txColor(item.type)}`}>
                        {item.type === "SPEND" ? "-" : "+"}
                        {item.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      </div>
    </TeacherShell>
  );
}
