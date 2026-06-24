// app/(app)/me/games/[id]/users/[userId]/page.tsx
"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import { ReviewCard } from "@/components/cards/ReviewCard";
import {
  categorizeReview,
  type PlayerDetail,
  type PlayerReview,
} from "@/types/player-detail";

export default function PlayerDetailPage({
  params,
}: {
  params: Promise<{ id: string; userId: string }>;
}) {
  const { id, userId } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [player, setPlayer] = useState<PlayerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=/me/games/${id}/users/${userId}`);
    }
  }, [authLoading, user, id, userId, router]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      try {
        const res = await api<PlayerDetail>(`/tables/${id}/players/${userId}`);
        if (active) setPlayer(res);
      } catch (err) {
        if (active) {
          setError(
            err instanceof ApiError && err.status === 403
              ? "You don't have access to this profile."
              : "Player not found.",
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
        <Link href={`/me/games/${id}`} className="text-sm underline">
          Back to table
        </Link>
      </main>
    );
  }

  if (!player) return null;

  // bucket reviews into the three boxes, one review per box by priority
  const boxes: Record<string, PlayerReview[]> = {
    dm: [],
    player: [],
    shared: [],
  };
  for (const review of player.reviews) {
    boxes[categorizeReview(review)].push(review);
  }

  return (
    <main className="mx-auto max-w-3xl p-8">
      {/* Header */}
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-2xl font-medium text-gray-600">
          {(player.displayName ?? player.username).charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold">
            {player.displayName ?? player.username}
          </h1>
          {player.displayName && (
            <p className="text-sm text-gray-500">@{player.username}</p>
          )}
          {player.bio && <p className="mt-2 text-gray-700">{player.bio}</p>}
        </div>
      </div>

      {/* Tags */}
      {(player.preferredSystems.length > 0 ||
        player.playStyleTags.length > 0) && (
        <div className="mb-8 flex flex-col gap-2">
          {player.preferredSystems.length > 0 && (
            <TagRow label="Systems" tags={player.preferredSystems} />
          )}
          {player.playStyleTags.length > 0 && (
            <TagRow label="Play style" tags={player.playStyleTags} />
          )}
        </div>
      )}

      {/* Review boxes */}
      <div className="flex flex-col gap-6">
        <ReviewBox title="As a DM" reviews={boxes.dm} />
        <ReviewBox title="As a Player" reviews={boxes.player} />
        <ReviewBox title="Shared" reviews={boxes.shared} />
      </div>
    </main>
  );
}

function TagRow({ label, tags }: { label: string; tags: string[] }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-400">{label}:</span>
      <div className="flex flex-wrap gap-1">
        {tags.map((t) => (
          <span key={t} className="rounded bg-gray-100 px-2 py-0.5 text-xs">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function ReviewBox({
  title,
  reviews,
}: {
  title: string;
  reviews: PlayerReview[];
}) {
  return (
    <section>
      <h2 className="mb-2 text-lg font-semibold">{title}</h2>
      {reviews.length === 0 ? (
        <p className="text-sm text-gray-400">No reviews yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      )}
    </section>
  );
}
