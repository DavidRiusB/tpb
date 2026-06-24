// components/cards/ReviewCard.tsx
import type { PlayerReview } from "@/types/player-detail";

export function ReviewCard({ review }: { review: PlayerReview }) {
  // all badges on this review, flattened for display
  const badges = [
    ...review.sharedBadges,
    ...review.dmBadges,
    ...review.playerBadges,
  ];

  return (
    <div className="rounded-lg border border-gray-300 bg-white p-3">
      {/* Reviewer */}
      <div className="mb-1 flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600">
          {(review.reviewer.displayName ?? review.reviewer.username)
            .charAt(0)
            .toUpperCase()}
        </div>
        <span className="text-sm font-medium">
          {review.reviewer.displayName ?? review.reviewer.username}
        </span>
        <span className="ml-auto text-xs text-gray-400">
          {new Date(review.createdAt).toLocaleDateString()}
        </span>
      </div>

      {/* Written text */}
      {review.writtenReview && (
        <p className="mb-2 text-sm text-gray-700">{review.writtenReview}</p>
      )}

      {/* Badges */}
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {badges.map((badge) => (
            <span
              key={badge}
              className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-700"
            >
              {badge}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
