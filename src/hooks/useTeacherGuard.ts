"use client";

import { auth } from "@/lib/firebase/config";
import { registerTeacher, type TeacherUserProfile } from "@/lib/teacher-api";
import { useAuth } from "@/providers/AuthProvider";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useTeacherGuard() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<TeacherUserProfile | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, router, user]);

  useEffect(() => {
    if (!user || !token) {
      return;
    }

    const syncTeacherProfile = async () => {
      setSyncing(true);
      setSyncError(null);

      try {
        const profileData = await registerTeacher(token, {
          role: "TEACHER",
          name: user.displayName,
        });

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
  }, [router, token, user]);

  return {
    user,
    token,
    profile,
    loading,
    syncing,
    syncError,
    ready: !loading && !!user,
  };
}
