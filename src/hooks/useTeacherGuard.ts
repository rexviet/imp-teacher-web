"use client";

import { auth } from "@/lib/firebase/config";
import { useAuth } from "@/providers/AuthProvider";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export interface TeacherProfile {
  id: string;
  name: string | null;
  email: string;
  role: "TEACHER" | "STUDENT" | "ADMIN";
  creditBalance: number;
  teacherProfile?: {
    id: string;
    headline?: string | null;
    bio?: string | null;
    creditRate?: number | null;
  } | null;
}

export function useTeacherGuard() {
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

  return {
    user,
    profile,
    loading,
    syncing,
    syncError,
    ready: !loading && !!user,
  };
}
