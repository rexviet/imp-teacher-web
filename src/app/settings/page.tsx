"use client";

import { TeacherShell } from "@/components/teacher-shell";
import { useTeacherGuard } from "@/hooks/useTeacherGuard";
import { updateTeacherProfile } from "@/lib/teacher-api";
import { BadgeDollarSign, Loader2, Save, Settings2, UserCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { loading, user, profile, token } = useTeacherGuard();
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [creditRate, setCreditRate] = useState<number>(120);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setHeadline(profile?.teacherProfile?.headline || "");
    setBio(profile?.teacherProfile?.bio || "");
    setCreditRate(profile?.teacherProfile?.creditRate || 120);
  }, [profile]);

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-600">Loading...</p>
      </main>
    );
  }

  const onSave = async () => {
    if (!token) {
      setError("Missing auth token");
      return;
    }

    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      await updateTeacherProfile(token, {
        headline,
        bio,
        creditRate,
      });
      setSaved(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <TeacherShell
      title="Teacher Profile & Settings"
      subtitle="Update your public profile and configure pricing for manual reviews."
    >
      <div className="space-y-5">
        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
            <Settings2 className="h-5 w-5 text-teal-700" />
            General
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block text-slate-600">Display Name</span>
              <input
                value={user.displayName || ""}
                readOnly
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-slate-700"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-slate-600">Email</span>
              <input
                value={user.email || ""}
                readOnly
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-slate-700"
              />
            </label>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
            <UserCircle2 className="h-5 w-5 text-teal-700" />
            Public Profile
          </h2>
          <div className="space-y-4">
            <label className="block text-sm">
              <span className="mb-1 block text-slate-600">Headline</span>
              <input
                value={headline}
                onChange={(event) => {
                  setHeadline(event.target.value);
                  setSaved(false);
                }}
                placeholder="IELTS Speaking & Writing Examiner"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-teal-500 focus:ring-2"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-slate-600">Bio</span>
              <textarea
                value={bio}
                onChange={(event) => {
                  setBio(event.target.value);
                  setSaved(false);
                }}
                placeholder="Cambridge-certified examiner with 8+ years of IELTS preparation and grading experience."
                className="h-32 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-teal-500 focus:ring-2"
              />
            </label>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
            <BadgeDollarSign className="h-5 w-5 text-teal-700" />
            Pricing
          </h2>
          <label className="block max-w-sm text-sm">
            <span className="mb-1 block text-slate-600">Credit Rate per review</span>
            <input
              type="number"
              min={1}
              max={10000}
              step={1}
              value={creditRate}
              onChange={(event) => {
                setCreditRate(Number(event.target.value));
                setSaved(false);
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-teal-500 focus:ring-2"
            />
          </label>
        </section>

        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {saved ? "Saved to backend." : "Unsaved changes."}
          </p>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Settings
          </button>
        </div>
      </div>
    </TeacherShell>
  );
}
