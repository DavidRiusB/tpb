"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import { UserProfile } from "@/components/profile/UserProfile";
import type { PlayerDetail } from "@/types/player-detail";

export default function ConnectionProfilePage({
  params,
}: {
  params: Promise<{ id: string; userId: string }>;
}) {
  const { id, userId } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState<PlayerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=/me/tables/${id}/manage/requests/${userId}`);
    }
  }, [authLoading, user, id, userId, router]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      try {
        // CONNECTION context — gated by a join request (DM viewing requester)
        const res = await api<PlayerDetail>(
          `/tables/${id}/connections/${userId}`,
        );
        if (active) setProfile(res);
      } catch (err) {
        if (active) {
          setError(
            err instanceof ApiError && err.status === 403
              ? "You don't have access to this profile."
              : "Profile not found.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user, id, userId]);

  if (authLoading || loading) {
    return <main className="p-8 text-gray-500">Loading…</main>;
  }

  if (error) {
    return (
      <main className="mx-auto max-w-3xl p-8">
        <p className="text-gray-600">{error}</p>
        <Link href={`/me/tables/${id}/manage/`} className="text-sm underline">
          Back to manage
        </Link>
      </main>
    );
  }

  if (!profile) return null;

  return (
    <main className="mx-auto max-w-3xl p-8">
      <Link
        href={`/me/tables/${id}/manage/`}
        className="text-sm text-gray-400 hover:underline"
      >
        ← Back to manage
      </Link>
      <div className="mt-4">
        <UserProfile profile={profile} />
      </div>
    </main>
  );
}
