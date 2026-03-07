"use client";

import { TeacherShell } from "@/components/teacher-shell";
import {
  getTeacherGradingRequests,
  type TeacherGradingListItem,
} from "@/lib/teacher-api";
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
import { useEffect, useMemo, useState } from "react";

type ReviewType = "WRITING" | "SPEAKING";

function resolveReviewType(item: TeacherGradingListItem): ReviewType {
  if (item.targetSectionType === "WRITING" || item.targetSectionType === "SPEAKING") {
    return item.targetSectionType;
  }
  if (item.attempt.test.sectionTypes.includes("WRITING")) {
    return "WRITING";
  }
  return "SPEAKING";
}

function reviewHref(id: string, type: ReviewType) {
  return type === "WRITING" ? `/reviews/writing/${id}` : `/reviews/speaking/${id}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

export default function HomePage() {
  const { user, token, loading, syncError, profile } = useTeacherGuard();
  const [requests, setRequests] = useState<TeacherGradingListItem[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [requestsError, setRequestsError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    let mounted = true;

    const run = async () => {
      try {
        setLoadingRequests(true);
        setRequestsError(null);
        const data = await getTeacherGradingRequests(token);
        if (mounted) {
          setRequests(data);
        }
      } catch (error) {
        if (mounted) {
          setRequestsError(
            error instanceof Error ? error.message : "Failed to load grading requests",
          );
        }
      } finally {
        if (mounted) {
          setLoadingRequests(false);
        }
      }
    };

    run().catch(() => {
      if (mounted) {
        setRequestsError("Unexpected error while loading grading requests");
        setLoadingRequests(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, [token]);

  const pendingRequests = useMemo(
    () => requests.filter((item) => item.status !== "COMPLETED"),
    [requests],
  );

  const pendingCount = pendingRequests.length;
  const monthlyEarnings = useMemo(
    () =>
      requests
        .filter((item) => item.status === "COMPLETED")
        .reduce((sum, item) => sum + (item.finalScore ? Math.round(item.finalScore * 10) : 0), 0),
    [requests],
  );

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

      {requestsError ? (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {requestsError}
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
            <div
              className="h-full rounded-full bg-orange-400"
              style={{
                width: `${Math.min(100, Math.max(8, pendingCount * 15))}%`,
              }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Credits Earned (Estimated)</p>
              <p className="font-mono text-2xl font-bold text-slate-800">{monthlyEarnings} CR</p>
            </div>
          </div>
          <p className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-teal-600">
            <TrendingUp className="h-3.5 w-3.5" />
            Based on completed grading entries
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Star className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Current Credit Balance</p>
              <p className="font-mono text-2xl font-bold text-slate-800">
                {profile?.creditBalance ?? 0} CR
              </p>
            </div>
          </div>
          <div className="mt-4 text-xs font-medium text-slate-400">Synced from /users/me</div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Pending Submissions</h2>
          <div className="flex gap-2">
            <button className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50">
              Filter: Open Items
            </button>
            <button className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50">
              Sort: Oldest First
            </button>
          </div>
        </div>

        {loadingRequests ? (
          <div className="rounded-xl border border-slate-100 bg-white p-5 text-sm text-slate-500 shadow-sm">
            Loading grading queue...
          </div>
        ) : null}

        {!loadingRequests && pendingRequests.length === 0 ? (
          <div className="rounded-xl border border-slate-100 bg-white p-5 text-sm text-slate-500 shadow-sm">
            No pending submissions at the moment.
          </div>
        ) : null}

        <div className="space-y-3">
          {pendingRequests.map((review) => {
            const reviewType = resolveReviewType(review);
            return (
              <div
                key={review.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-teal-100"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-[11px] font-bold text-teal-700">
                    {(review.attempt.candidate.name || review.attempt.candidate.email)
                      .split(" ")
                      .slice(0, 2)
                      .map((tokenItem) => tokenItem[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">
                      {review.attempt.candidate.name || review.attempt.candidate.email}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                      <span
                        className={
                          reviewType === "WRITING"
                            ? "inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 font-bold uppercase tracking-wide text-blue-700"
                            : "inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 font-bold uppercase tracking-wide text-emerald-700"
                        }
                      >
                        {reviewType === "WRITING" ? (
                          <NotebookPen className="h-3.5 w-3.5" />
                        ) : (
                          <Mic className="h-3.5 w-3.5" />
                        )}
                        {reviewType === "WRITING" ? "Writing Task" : "Speaking Mock"}
                      </span>
                      <span className="inline-flex items-center gap-1 text-slate-400">
                        <Clock3 className="h-3.5 w-3.5" />
                        Submitted {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="hidden text-right lg:block">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Status
                    </p>
                    <p className="font-mono font-bold text-slate-700">{review.status}</p>
                  </div>
                  <Link
                    href={reviewHref(review.id, reviewType)}
                    className="inline-flex items-center gap-1 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
                  >
                    Start Grading
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {pendingRequests.length > 0 ? (
          <div className="mt-8 flex justify-center">
            <button className="inline-flex items-center gap-2 text-sm font-bold text-teal-700 hover:underline">
              View all {pendingRequests.length} pending submissions
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </section>
    </TeacherShell>
  );
}
