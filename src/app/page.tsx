"use client";

import { auth } from "@/lib/firebase/config";
import { useAuth } from "@/providers/AuthProvider";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface TeacherProfile {
  id: string;
  name: string | null;
  email: string;
  role: "TEACHER" | "STUDENT" | "ADMIN";
  creditBalance: number;
}

export default function HomePage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, router, user]);

  useEffect(() => {
    if (!user || !token) {
      return;
    }

    if (!apiUrl) {
      setSyncError("NEXT_PUBLIC_API_URL is missing");
      return;
    }

    const syncTeacherProfile = async () => {
      setSyncing(true);
      setSyncError(null);

      try {
        const registerResponse = await fetch(`${apiUrl}/api/v1/users/register`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role: "TEACHER",
            name: user.displayName,
          }),
        });

        if (!registerResponse.ok) {
          const errorMessage = await registerResponse.text();
          throw new Error(errorMessage || "Failed to sync teacher profile");
        }

        const profileData: TeacherProfile = await registerResponse.json();

        if (profileData.role !== "TEACHER") {
          await signOut(auth);
          router.replace("/login");
          throw new Error("Only TEACHER accounts can access teacher portal");
        }

        setProfile(profileData);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to sync profile";
        setSyncError(message);
      } finally {
        setSyncing(false);
      }
    };

    syncTeacherProfile().catch(() => {
      setSyncError("Unexpected error while syncing teacher profile");
      setSyncing(false);
    });
  }, [apiUrl, router, token, user]);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  if (loading || (!user && !loading)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-600">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <section className="mx-auto w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Teacher Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Welcome, {user.displayName || user.email}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Logout
          </button>
        </div>

        <div className="mt-6 space-y-3 text-sm">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-medium text-slate-800">Authentication status</p>
            <p className="mt-1 text-slate-600">Signed in as: {user.email}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-medium text-slate-800">Teacher profile sync</p>
            {syncing && <p className="mt-1 text-slate-600">Syncing profile...</p>}
            {!syncing && syncError && (
              <p className="mt-1 text-red-600">{syncError}</p>
            )}
            {!syncing && !syncError && profile && (
              <div className="mt-1 text-slate-600">
                <p>Role: {profile.role}</p>
                <p>Credits: {profile.creditBalance}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
