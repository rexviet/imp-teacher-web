"use client";

import { Bold, Gauge, Italic, List, Save } from "lucide-react";
import { useMemo, useRef, useState } from "react";

interface Criterion {
  key: string;
  label: string;
  score: number;
}

interface FeedbackEditorProps {
  rubricTitle: string;
  criteria: Array<{ key: string; label: string; defaultScore?: number }>;
}

export function FeedbackEditor({ rubricTitle, criteria }: FeedbackEditorProps) {
  const [rubric, setRubric] = useState<Criterion[]>(
    criteria.map((item) => ({
      key: item.key,
      label: item.label,
      score: item.defaultScore ?? 6.5,
    })),
  );
  const [feedback, setFeedback] = useState("");
  const [saved, setSaved] = useState(false);
  const textRef = useRef<HTMLTextAreaElement | null>(null);

  const overallBand = useMemo(() => {
    const total = rubric.reduce((sum, item) => sum + item.score, 0);
    return (total / Math.max(rubric.length, 1)).toFixed(1);
  }, [rubric]);

  const updateScore = (key: string, score: number) => {
    setSaved(false);
    setRubric((prev) =>
      prev.map((item) => (item.key === key ? { ...item, score } : item)),
    );
  };

  const wrapSelectedText = (prefix: string, suffix: string) => {
    const area = textRef.current;
    if (!area) return;
    const start = area.selectionStart;
    const end = area.selectionEnd;
    const selected = feedback.slice(start, end);
    const next = `${feedback.slice(0, start)}${prefix}${selected}${suffix}${feedback.slice(end)}`;
    setFeedback(next);
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">{rubricTitle}</h2>
        <div className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-700">
          <Gauge className="h-4 w-4" />
          Overall: {overallBand}
        </div>
      </div>

      <div className="space-y-3">
        {rubric.map((item) => (
          <div key={item.key} className="rounded-lg border border-slate-200 p-3">
            <div className="mb-2 flex items-center justify-between text-sm">
              <p className="font-medium text-slate-700">{item.label}</p>
              <p className="font-semibold text-slate-900">{item.score.toFixed(1)}</p>
            </div>
            <input
              type="range"
              min={0}
              max={9}
              step={0.5}
              value={item.score}
              onChange={(event) => updateScore(item.key, Number(event.target.value))}
              className="w-full"
            />
          </div>
        ))}
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => wrapSelectedText("**", "**")}
            className="inline-flex items-center gap-1 rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            <Bold className="h-3.5 w-3.5" />
            Bold
          </button>
          <button
            type="button"
            onClick={() => wrapSelectedText("*", "*")}
            className="inline-flex items-center gap-1 rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            <Italic className="h-3.5 w-3.5" />
            Italic
          </button>
          <button
            type="button"
            onClick={() => wrapSelectedText("- ", "")}
            className="inline-flex items-center gap-1 rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            <List className="h-3.5 w-3.5" />
            Bullet
          </button>
        </div>

        <textarea
          ref={textRef}
          value={feedback}
          onChange={(event) => {
            setFeedback(event.target.value);
            setSaved(false);
          }}
          className="h-44 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 outline-none ring-teal-500 focus:ring-2"
          placeholder="Write clear criterion-based feedback for the student..."
        />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-slate-500">
          {saved ? "Saved draft locally." : "Draft has unsaved changes."}
        </p>
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
        >
          <Save className="h-4 w-4" />
          Save Feedback
        </button>
      </div>
    </section>
  );
}
