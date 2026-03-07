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
  getSpeakingTranscript,
  normalizeRubricScores,
} from "@/lib/teacher-grading-utils";
import {
  Bold,
  CirclePause,
  Gauge,
  Italic,
  Link2,
  List,
  Loader2,
  Mic,
  Minus,
  PlusCircle,
  Save,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const BAND_OPTIONS = ["9.0", "8.5", "8.0", "7.5", "7.0", "6.5", "6.0", "5.5"];

const RUBRIC_ITEMS: Array<{
  key: "fluency" | "lexical" | "grammar" | "pronunciation";
  label: string;
}> = [
  { key: "fluency", label: "Fluency & Coherence" },
  { key: "lexical", label: "Lexical Resource" },
  { key: "grammar", label: "Grammar Range & Accuracy" },
  { key: "pronunciation", label: "Pronunciation" },
];

export default function SpeakingFeedbackPage() {
  const { loading, user, token } = useTeacherGuard();
  const params = useParams<{ id: string }>();

  const [scores, setScores] = useState({
    fluency: "7.0",
    lexical: "7.0",
    grammar: "7.0",
    pronunciation: "7.0",
  });
  const [feedback, setFeedback] = useState("");
  const [detail, setDetail] = useState<TeacherGradingDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
            "fluency",
            "lexical",
            "grammar",
            "pronunciation",
          ]);
          setScores({
            fluency: String(rubric.fluency ?? 7.0),
            lexical: String(rubric.lexical ?? 7.0),
            grammar: String(rubric.grammar ?? 7.0),
            pronunciation: String(rubric.pronunciation ?? 7.0),
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

  const transcript = useMemo(() => (detail ? getSpeakingTranscript(detail) : []), [detail]);

  const finalBand = useMemo(
    () =>
      computeAverageBand([
        Number(scores.fluency),
        Number(scores.lexical),
        Number(scores.grammar),
        Number(scores.pronunciation),
      ]),
    [scores],
  );

  const annotations = useMemo(
    () => transcript.slice(0, 3).map((item, index) => ({
      time: `0${index}:2${index}`,
      title: item.role,
      content: item.content,
    })),
    [transcript],
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
          <p className="text-slate-600">{error || "No speaking review found for this id."}</p>
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
          fluency: Number(scores.fluency),
          lexical: Number(scores.lexical),
          grammar: Number(scores.grammar),
          pronunciation: Number(scores.pronunciation),
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
          fluency: Number(scores.fluency),
          lexical: Number(scores.lexical),
          grammar: Number(scores.grammar),
          pronunciation: Number(scores.pronunciation),
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
    <div className="min-h-screen bg-slate-50 text-slate-700">
      {error ? (
        <div className="mx-6 mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-teal-700 p-2 text-white">
            <Mic className="h-4 w-4" />
          </div>
          <h1 className="text-lg font-bold text-slate-800">
            Speaking Grading
            <span className="ml-1 font-normal text-slate-400">/ Submission #{detail.id}</span>
          </h1>
        </div>

        <div className="flex items-center gap-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Teacher Mode
          </div>
          <button
            className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-70"
            onClick={onSubmit}
            disabled={saving || submitting}
          >
            {submitting ? "Submitting..." : "Submit All Grades"}
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1600px] grid-cols-12 gap-6 p-6">
        <div className="col-span-8 space-y-6">
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Full Recording</h2>
                <p className="text-sm text-slate-400">{detail.attempt.test.title}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="mr-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                  Speed
                </span>
                <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                  <button className="rounded border border-slate-200 bg-white px-2 py-1 text-xs font-semibold">
                    1x
                  </button>
                  <button className="px-2 py-1 text-xs font-semibold text-slate-500">1.25x</button>
                  <button className="px-2 py-1 text-xs font-semibold text-slate-500">1.5x</button>
                </div>
              </div>
            </div>

            {detail.attempt.masterAudioUrl ? (
              <audio controls className="mb-5 w-full" src={detail.attempt.masterAudioUrl} />
            ) : (
              <p className="mb-5 text-sm text-slate-500">No master audio URL found for this submission.</p>
            )}

            <div className="mb-6 flex h-24 items-end gap-1">
              {[30, 46, 24, 50, 66, 36, 62, 70, 30, 46, 24, 40, 60, 33, 52, 66].map(
                (height, index) => (
                  <div
                    key={`${height}-${index}`}
                    className={`flex-1 rounded-full ${
                      index >= 3 && index <= 7 ? "bg-teal-300" : "bg-slate-100"
                    }`}
                    style={{ height: `${height}%` }}
                  />
                ),
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5 text-slate-400">
                <button className="hover:text-teal-700">
                  <SkipBack className="h-6 w-6" />
                </button>
                <button className="rounded-full bg-teal-700 p-2.5 text-white shadow">
                  <CirclePause className="h-6 w-6" />
                </button>
                <button className="hover:text-teal-700">
                  <SkipForward className="h-6 w-6" />
                </button>
              </div>
              <div className="rounded bg-slate-50 px-3 py-1 font-mono text-sm text-slate-600">Ready</div>
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-slate-400" />
                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-3/4 bg-teal-300" />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Annotations & Timestamps</h2>
              <button className="inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:underline">
                <PlusCircle className="h-4 w-4" />
                Add Note
              </button>
            </div>

            <div className="space-y-3">
              {annotations.length === 0 ? (
                <p className="text-sm text-slate-500">No transcript history found in this submission.</p>
              ) : null}
              {annotations.map((item) => (
                <div
                  key={`${item.time}-${item.title}`}
                  className="rounded-xl border border-slate-100 p-4 transition hover:border-teal-100 hover:bg-teal-50/30"
                >
                  <div className="flex gap-4">
                    <div className="font-mono text-sm font-bold text-teal-700">{item.time}</div>
                    <div className="flex-1">
                      <div className="mb-1 flex items-start justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                          {item.title}
                        </span>
                        <button className="text-slate-400 hover:text-rose-600">
                          <Minus className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-sm leading-relaxed text-slate-700">{item.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-bold text-slate-800">Overall Feedback</h2>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="flex items-center gap-1 border-b border-slate-200 bg-slate-50 p-2">
                <button className="rounded p-1.5 text-slate-600 hover:bg-white">
                  <Bold className="h-4 w-4" />
                </button>
                <button className="rounded p-1.5 text-slate-600 hover:bg-white">
                  <Italic className="h-4 w-4" />
                </button>
                <button className="rounded p-1.5 text-slate-600 hover:bg-white">
                  <List className="h-4 w-4" />
                </button>
                <div className="mx-1 h-4 w-px bg-slate-300" />
                <button className="rounded p-1.5 text-slate-600 hover:bg-white">
                  <Link2 className="h-4 w-4" />
                </button>
              </div>
              <textarea
                value={feedback}
                onChange={(event) => setFeedback(event.target.value)}
                className="h-44 w-full resize-none border-none p-4 text-sm leading-relaxed text-slate-700 outline-none focus:ring-0"
              />
            </div>
          </section>
        </div>

        <aside className="col-span-4 space-y-5">
          <div className="sticky top-24 rounded-xl bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <Gauge className="h-4 w-4 text-teal-700" />
              <h2 className="text-lg font-bold text-slate-800">Scoring Rubric</h2>
            </div>

            <div className="space-y-5">
              {RUBRIC_ITEMS.map((criterion) => (
                <div key={criterion.key}>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-700">{criterion.label}</label>
                    <span className="font-mono text-sm font-bold text-teal-700">
                      {scores[criterion.key]}
                    </span>
                  </div>
                  <select
                    value={scores[criterion.key]}
                    onChange={(event) =>
                      setScores((prev) => ({ ...prev, [criterion.key]: event.target.value }))
                    }
                    className="w-full rounded-lg border-slate-200 bg-slate-50 py-2 text-sm"
                  >
                    {BAND_OPTIONS.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full bg-teal-300" style={{ width: "72%" }} />
                  </div>
                </div>
              ))}

              <div className="border-t border-slate-100 pt-5">
                <div className="rounded-xl border border-teal-100 bg-teal-50 p-4 text-center">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-teal-700">
                    Estimated Band Score
                  </span>
                  <div className="font-mono text-4xl font-bold text-teal-700">{finalBand.toFixed(1)}</div>
                </div>
              </div>

              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 py-3 text-sm font-bold text-white hover:bg-slate-900 disabled:opacity-70"
                onClick={onSaveDraft}
                disabled={saving || submitting}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Draft
              </button>
              <p className="text-center text-[10px] uppercase tracking-[0.14em] text-slate-400">
                Scores are calculated based on official assessment criteria.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700">
                {(detail.attempt.user.name || detail.attempt.user.email)
                  .split(" ")
                  .slice(0, 2)
                  .map((tokenItem: string) => tokenItem[0])
                  .join("")
                  .toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-slate-800">
                  {detail.attempt.user.name || detail.attempt.user.email}
                </h3>
                <p className="text-xs text-slate-500">Student ID: #{detail.attempt.user.id}</p>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
