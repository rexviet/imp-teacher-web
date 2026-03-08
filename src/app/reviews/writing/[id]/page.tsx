"use client";

import { useTeacherGuard } from "@/hooks/useTeacherGuard";
import {
  getTeacherGradingDetail,
  saveTeacherGradingDraft,
  submitTeacherGrading,
  type TeacherGradingDetail,
} from "@/lib/teacher-api";
import {
  computeAverageBand,
  getWritingResponseText,
  normalizeRubricScores,
} from "@/lib/teacher-grading-utils";
import {
  Bold,
  Headphones,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Send,
  Settings,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function buildEssayLines(text: string) {
  const blocks = text
    .split(". ")
    .map((item) => item.trim())
    .filter(Boolean);

  return blocks.map((item, index) => ({
    line: index * 4 + 1,
    text: item.endsWith(".") ? item : `${item}.`,
  }));
}

const BAND_OPTIONS = ["6.0", "6.5", "7.0", "7.5", "8.0", "8.5", "9.0"];

export default function WritingFeedbackPage() {
  const { loading, user, token } = useTeacherGuard();
  const params = useParams<{ id: string }>();

  const [feedback, setFeedback] = useState("");
  const [scores, setScores] = useState({
    task: "7.0",
    cohesion: "7.0",
    lexical: "7.0",
    grammar: "7.0",
  });

  const [loadingDetail, setLoadingDetail] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [detail, setDetail] = useState<TeacherGradingDetail | null>(null);

  useEffect(() => {
    if (!token || !params.id) {
      return;
    }

    let mounted = true;

    const run = async () => {
      setLoadingDetail(true);
      setError(null);
      try {
        const data = await getTeacherGradingDetail(token, params.id);
        if (mounted) {
          setDetail(data);
          const rubric = normalizeRubricScores(data.rubric, [
            "task",
            "cohesion",
            "lexical",
            "grammar",
          ]);
          setScores({
            task: String(rubric.task ?? 7.0),
            cohesion: String(rubric.cohesion ?? 7.0),
            lexical: String(rubric.lexical ?? 7.0),
            grammar: String(rubric.grammar ?? 7.0),
          });
          setFeedback(data.feedback || "");
        }
      } catch (loadError) {
        if (mounted) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load request");
        }
      } finally {
        if (mounted) {
          setLoadingDetail(false);
        }
      }
    };

    run().catch(() => {
      if (mounted) {
        setError("Unexpected error while loading grading request");
        setLoadingDetail(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, [params.id, token]);

  const essayLines = useMemo(
    () => buildEssayLines(detail ? getWritingResponseText(detail) : ""),
    [detail],
  );

  const finalBand = useMemo(
    () =>
      computeAverageBand([
        Number(scores.task),
        Number(scores.cohesion),
        Number(scores.lexical),
        Number(scores.grammar),
      ]),
    [scores],
  );

  if (loading || !user || loadingDetail) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-600">Loading...</p>
      </main>
    );
  }

  if (error || !detail) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-slate-600">{error || "No writing review found for this id."}</p>
          <Link href="/" className="mt-3 inline-block text-teal-700 hover:underline">
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  const onSaveDraft = async () => {
    if (!token) {
      setError("Missing auth token");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const updated = await saveTeacherGradingDraft(token, params.id, {
        feedback,
        rubric: {
          task: Number(scores.task),
          cohesion: Number(scores.cohesion),
          lexical: Number(scores.lexical),
          grammar: Number(scores.grammar),
        },
      });
      setDetail(updated);
    } catch (draftError) {
      setError(draftError instanceof Error ? draftError.message : "Failed to save draft");
    } finally {
      setSaving(false);
    }
  };

  const onSubmit = async () => {
    if (!token) {
      setError("Missing auth token");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const updated = await submitTeacherGrading(token, params.id, {
        feedback,
        rubric: {
          task: Number(scores.task),
          cohesion: Number(scores.cohesion),
          lexical: Number(scores.lexical),
          grammar: Number(scores.grammar),
        },
        finalScore: finalBand,
      });
      setDetail(updated);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to submit grading");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50 text-slate-700">
      {error ? (
        <div className="mx-6 mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-teal-700">
            <UserRound className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800">
              {detail.attempt.user.name || detail.attempt.user.email}
            </h1>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Submission: #{detail.id}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="text-right">
            <p className="text-sm font-semibold text-teal-700">{detail.attempt.test.title}</p>
            <p className="text-xs text-slate-400">Status: {detail.status}</p>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <button className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-teal-700">
            <Headphones className="h-4 w-4" />
            Student Recording
          </button>
          <button className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-200">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <section className="flex w-1/2 flex-col border-r border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-4 py-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Student Submission
            </span>
            <div className="flex items-center gap-2">
              <button className="rounded border border-slate-200 bg-white px-2 py-1 text-[10px] text-slate-500">
                Show Prompt
              </button>
              <span className="rounded bg-teal-50 px-2 py-1 text-xs font-medium text-teal-700">
                {essayLines.length > 0 ? `${essayLines.length} lines` : "No response"}
              </span>
            </div>
          </div>

          <div className="relative flex-1 overflow-y-auto p-10">
            <div className="mx-auto ml-10 max-w-2xl">
              {essayLines.length === 0 ? (
                <p className="text-sm text-slate-500">No writing answer found in this submission.</p>
              ) : null}
              {essayLines.map((line) => (
                <div key={line.line} className="relative mb-4 pl-0 leading-relaxed text-slate-700">
                  <span className="absolute -left-10 top-0 font-mono text-xs text-slate-300">
                    {line.line}
                  </span>
                  {line.text}
                </div>
              ))}
            </div>

            <div className="absolute left-[60%] top-40 inline-flex items-center gap-2 rounded bg-slate-800 px-3 py-2 text-xs text-white shadow">
              Add Comment
            </div>
          </div>
        </section>

        <section className="flex w-1/2 flex-col overflow-y-auto bg-slate-50">
          <div className="space-y-7 p-6 pb-24">
            <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
              <h2 className="mb-6 text-xs font-bold uppercase tracking-wide text-slate-700">
                Criterion Band Scores
              </h2>
              <div className="grid grid-cols-2 gap-5">
                <label className="text-xs font-semibold text-slate-500">
                  Task Response
                  <select
                    value={scores.task}
                    onChange={(event) =>
                      setScores((prev) => ({ ...prev, task: event.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border-slate-200 py-2 text-sm"
                  >
                    {BAND_OPTIONS.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-semibold text-slate-500">
                  Coherence & Cohesion
                  <select
                    value={scores.cohesion}
                    onChange={(event) =>
                      setScores((prev) => ({ ...prev, cohesion: event.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border-slate-200 py-2 text-sm"
                  >
                    {BAND_OPTIONS.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-semibold text-slate-500">
                  Lexical Resource
                  <select
                    value={scores.lexical}
                    onChange={(event) =>
                      setScores((prev) => ({ ...prev, lexical: event.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border-slate-200 py-2 text-sm"
                  >
                    {BAND_OPTIONS.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-semibold text-slate-500">
                  Grammar Range & Accuracy
                  <select
                    value={scores.grammar}
                    onChange={(event) =>
                      setScores((prev) => ({ ...prev, grammar: event.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border-slate-200 py-2 text-sm"
                  >
                    {BAND_OPTIONS.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5">
                <span className="text-xs font-bold text-slate-400">ESTIMATED OVERALL</span>
                <span className="font-mono text-2xl font-bold text-teal-700">{finalBand.toFixed(1)}</span>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
              <div className="flex items-center gap-1 border-b border-slate-100 bg-slate-50 p-2">
                <button className="rounded p-1.5 text-slate-600 hover:bg-white">
                  <Bold className="h-4 w-4" />
                </button>
                <button className="rounded p-1.5 text-slate-600 hover:bg-white">
                  <Italic className="h-4 w-4" />
                </button>
                <button className="rounded p-1.5 text-slate-600 hover:bg-white">
                  <List className="h-4 w-4" />
                </button>
                <button className="rounded p-1.5 text-slate-600 hover:bg-white">
                  <ListOrdered className="h-4 w-4" />
                </button>
                <div className="mx-1 h-5 w-px bg-slate-200" />
                <button className="rounded p-1.5 text-slate-600 hover:bg-white">
                  <Link2 className="h-4 w-4" />
                </button>
              </div>
              <div className="p-5">
                <label className="mb-3 block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Detailed Feedback
                </label>
                <textarea
                  aria-label="Detailed feedback"
                  value={feedback}
                  onChange={(event) => setFeedback(event.target.value)}
                  className="min-h-[260px] w-full resize-none border-none p-0 text-sm leading-relaxed text-slate-700 outline-none focus:ring-0"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-20 flex h-16 items-center justify-end gap-4 border-t border-slate-200 bg-white px-6">
        <button
          className="inline-flex items-center gap-2 px-6 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 disabled:opacity-70"
          onClick={onSaveDraft}
          disabled={saving || submitting}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save as Draft
        </button>
        <button
          aria-label="Submit writing grade"
          className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-6 py-2 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-70"
          onClick={onSubmit}
          disabled={saving || submitting}
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Submit Grade
        </button>
      </footer>
    </div>
  );
}
