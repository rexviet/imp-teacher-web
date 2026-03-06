"use client";

import { useTeacherGuard } from "@/hooks/useTeacherGuard";
import { getReviewById } from "@/lib/teacher-portal-data";
import {
  Bold,
  CirclePause,
  Gauge,
  Italic,
  Link2,
  List,
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
import { useMemo, useState } from "react";

const BAND_OPTIONS = ["Band 9.0", "Band 8.0", "Band 7.0", "Band 6.5", "Band 6.0"];
const RUBRIC_ITEMS: Array<{
  key: "fluency" | "lexical" | "grammar" | "pronunciation";
  label: string;
  progress: string;
}> = [
  { key: "fluency", label: "Fluency & Coherence", progress: "77%" },
  { key: "lexical", label: "Lexical Resource", progress: "72%" },
  { key: "grammar", label: "Grammar Range & Accuracy", progress: "77%" },
  { key: "pronunciation", label: "Pronunciation", progress: "66%" },
];

export default function ListeningFeedbackPage() {
  const { loading, user } = useTeacherGuard();
  const params = useParams<{ id: string }>();
  const review = getReviewById(params.id);

  const [scores, setScores] = useState({
    fluency: "Band 7.0",
    lexical: "Band 6.5",
    grammar: "Band 7.0",
    pronunciation: "Band 6.0",
  });

  const [feedback, setFeedback] = useState(
    "Your performance in Part 2 was quite strong. You managed to speak for the full two minutes with very few pauses.\nTo reach Band 7.5+, focus on:\n- Improving word stress in multi-syllabic words.\n- Reducing the frequency of basic connectors like 'and' and 'but'.",
  );

  const annotations = useMemo(
    () => [
      {
        time: "00:45",
        title: "Fluency & Coherence",
        content:
          "Minor hesitation here when searching for the word 'ambivalent'. Smooth recovery, but watch for 'um' fillers during transition.",
      },
      {
        time: "01:22",
        title: "Pronunciation",
        content:
          "L1 interference on 'th' sounds (pronounced as 'd'). Practice the dental fricative placement.",
      },
      {
        time: "02:08",
        title: "Grammatical Range",
        content:
          "Excellent use of a third conditional sentence structure. Very natural integration.",
      },
    ],
    [],
  );

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-600">Loading...</p>
      </main>
    );
  }

  if (!review || review.type !== "LISTENING") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-slate-600">No listening review found for this id.</p>
          <Link href="/" className="mt-3 inline-block text-teal-700 hover:underline">
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-teal-700 p-2 text-white">
            <Mic className="h-4 w-4" />
          </div>
          <h1 className="text-lg font-bold text-slate-800">
            Speaking Grading
            <span className="ml-1 font-normal text-slate-400">/ Submission #{review.id}</span>
          </h1>
        </div>

        <div className="flex items-center gap-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Teacher Mode
          </div>
          <button className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">
            Submit All Grades
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1600px] grid-cols-12 gap-6 p-6">
        <div className="col-span-8 space-y-6">
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Full Recording</h2>
                <p className="text-sm text-slate-400">{review.prompt}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="mr-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                  Speed
                </span>
                <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                  <button className="rounded border border-slate-200 bg-white px-2 py-1 text-xs font-semibold">
                    1x
                  </button>
                  <button className="px-2 py-1 text-xs font-semibold text-slate-500">
                    1.25x
                  </button>
                  <button className="px-2 py-1 text-xs font-semibold text-slate-500">
                    1.5x
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-6 flex h-24 items-end gap-1">
              {[
                30, 46, 24, 50, 66, 36, 62, 70, 30, 46, 24, 40, 60, 33, 52, 66, 42,
                56, 35, 25,
              ].map((height, index) => (
                <div
                  key={`${height}-${index}`}
                  className={`flex-1 rounded-full ${
                    index >= 3 && index <= 7 ? "bg-teal-300" : "bg-slate-100"
                  }`}
                  style={{ height: `${height}%` }}
                />
              ))}
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
              <div className="rounded bg-slate-50 px-3 py-1 font-mono text-sm text-slate-600">
                02:14 / 04:30
              </div>
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
                Add Note at 02:14
              </button>
            </div>

            <div className="space-y-3">
              {annotations.map((item) => (
                <div
                  key={item.time}
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
                    <label className="text-sm font-semibold text-slate-700">
                      {criterion.label}
                    </label>
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
                    <div className="h-full bg-teal-300" style={{ width: criterion.progress }} />
                  </div>
                </div>
              ))}

              <div className="border-t border-slate-100 pt-5">
                <div className="rounded-xl border border-teal-100 bg-teal-50 p-4 text-center">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-teal-700">
                    Estimated Band Score
                  </span>
                  <div className="font-mono text-4xl font-bold text-teal-700">6.5</div>
                </div>
              </div>

              <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 py-3 text-sm font-bold text-white hover:bg-slate-900">
                <Save className="h-4 w-4" />
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
                {review.candidateName
                  .split(" ")
                  .slice(0, 2)
                  .map((token) => token[0])
                  .join("")
                  .toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{review.candidateName}</h3>
                <p className="text-xs text-slate-500">Student ID: #{review.candidateId}</p>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
