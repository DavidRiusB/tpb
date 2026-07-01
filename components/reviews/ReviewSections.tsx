"use client";

import { useState } from "react";
import { ReviewCard } from "@/components/cards/ReviewCard";
import { type PlayerReview } from "@/types/player-detail";
import { ReviewType } from "@/types/review-type.enum";

type Tab = "all" | "dm" | "player";

export function ReviewSections({ reviews }: { reviews: PlayerReview[] }) {
  const [tab, setTab] = useState<Tab>("all");

  const dmReviews = reviews.filter((r) => r.type === ReviewType.DM);
  const playerReviews = reviews.filter((r) => r.type === ReviewType.PLAYER);

  const shown =
    tab === "dm" ? dmReviews : tab === "player" ? playerReviews : reviews;

  return (
    <div>
      <div className="mb-3 flex gap-1">
        <TabButton
          active={tab === "all"}
          label={`All (${reviews.length})`}
          onClick={() => setTab("all")}
        />
        <TabButton
          active={tab === "dm"}
          label={`As DM (${dmReviews.length})`}
          onClick={() => setTab("dm")}
        />
        <TabButton
          active={tab === "player"}
          label={`As Player (${playerReviews.length})`}
          onClick={() => setTab("player")}
        />
      </div>

      {shown.length === 0 ? (
        <p className="text-sm text-gray-400">No reviews yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {shown.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded px-2 py-1 text-xs ${
        active ? "bg-gray-800 text-white" : "text-gray-500 hover:bg-gray-100"
      }`}
    >
      {label}
    </button>
  );
}
