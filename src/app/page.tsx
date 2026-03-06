"use client";

import { TeacherShell } from "@/components/teacher-shell";
import { MOCK_TEACHER_REVIEWS } from "@/lib/teacher-portal-data";
import {
  ArrowRight,
  ChevronDown,
  Clock3,
  Mic,
  NotebookPen,
  Star,
  Timer,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useTeacherGuard } from "@/hooks/useTeacherGuard";
import Link from "next/link";

function reviewHref(id: string, type: "WRITING" | "LISTENING") {
  return type === "WRITING" ? `/reviews/writing/${id}` : `/reviews/listening/${id}`;
}

export default function HomePage() {
  const { user, loading, syncError } = useTeacherGuard();
  const pendingCount = MOCK_TEACHER_REVIEWS.length;

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-600">Loading...</p>
      </main>
    );
  }

  return (
    <TeacherShell
      title={`Welcome back, ${user.displayName?.split(" ")[0] || "Teacher"}`}
      subtitle={`You have ${pendingCount} scripts waiting for your expertise today.`}
    >
      {syncError ? (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {syncError}
        </div>
      ) : null}

      <section className="mb-10 grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
              <Timer className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Pending Tasks</p>
              <p className="font-mono text-2xl font-bold text-slate-800">{pendingCount}</p>
            </div>
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-2/3 rounded-full bg-orange-400" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Earnings This Month</p>
              <p className="font-mono text-2xl font-bold text-slate-800">$1,420.50</p>
            </div>
          </div>
          <p className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-teal-600">
            <TrendingUp className="h-3.5 w-3.5" />
            +12.5% from last month
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Star className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Average Rating</p>
              <p className="font-mono text-2xl font-bold text-slate-800">4.92</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-yellow-400">
            <Star className="h-3.5 w-3.5 fill-current" />
            <Star className="h-3.5 w-3.5 fill-current" />
            <Star className="h-3.5 w-3.5 fill-current" />
            <Star className="h-3.5 w-3.5 fill-current" />
            <Star className="h-3.5 w-3.5 fill-current" />
            <span className="ml-1 text-xs font-medium text-slate-400">(248 reviews)</span>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Pending Submissions</h2>
          <div className="flex gap-2">
            <button className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50">
              Filter: All Types
            </button>
            <button className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50">
              Sort: Oldest First
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {MOCK_TEACHER_REVIEWS.map((review) => (
            <div
              key={review.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-teal-100"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-[11px] font-bold text-teal-700">
                  {review.candidateName
                    .split(" ")
                    .slice(0, 2)
                    .map((token) => token[0])
                    .join("")
                    .toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{review.candidateName}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                    <span
                      className={
                        review.type === "WRITING"
                          ? "inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 font-bold uppercase tracking-wide text-blue-700"
                          : "inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-1 font-bold uppercase tracking-wide text-purple-700"
                      }
                    >
                      {review.type === "WRITING" ? (
                        <NotebookPen className="h-3.5 w-3.5" />
                      ) : (
                        <Mic className="h-3.5 w-3.5" />
                      )}
                      {review.type === "WRITING" ? "Writing Task" : "Speaking Mock"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-slate-400">
                      <Clock3 className="h-3.5 w-3.5" />
                      Submitted {new Date(review.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="hidden text-right lg:block">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Credit Value
                  </p>
                  <p className="font-mono font-bold text-slate-700">
                    {review.type === "WRITING" ? "50 CR" : "80 CR"}
                  </p>
                </div>
                <Link
                  href={reviewHref(review.id, review.type)}
                  className="inline-flex items-center gap-1 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
                >
                  Start Grading
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <button className="inline-flex items-center gap-2 text-sm font-bold text-teal-700 hover:underline">
            View all {pendingCount} pending submissions
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </section>

      <section className="mt-10 flex items-start gap-4 rounded-2xl border border-teal-100 bg-teal-50 p-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white shadow-lg shadow-teal-700/10">
          <Star className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-bold text-teal-900">Examiner Pro-tip</h3>
          <p className="mt-1 text-sm font-medium leading-relaxed text-teal-800">
            When providing rich-text feedback for Speaking mocks, remember to
            timestamp specific grammar slips in the audio playback for student
            clarity. Our recent data shows students value specific corrective
            examples over general band descriptors.
          </p>
        </div>
      </section>
    </TeacherShell>
  );
}
