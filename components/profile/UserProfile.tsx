import { ReviewCard } from "@/components/cards/ReviewCard";
import { type PlayerDetail, type PlayerReview } from "@/types/player-detail";
import { ReviewType } from "@/types/review-type.enum";

export function UserProfile({ profile }: { profile: PlayerDetail }) {
  // split reviews by type — DM review or player review
  const dmReviews: PlayerReview[] = [];
  const playerReviews: PlayerReview[] = [];
  for (const review of profile.reviews) {
    if (review.type === ReviewType.DM) dmReviews.push(review);
    else playerReviews.push(review);
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-2xl font-medium text-gray-600">
          {(profile.displayName ?? profile.username).charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold">
            {profile.displayName ?? profile.username}
          </h1>
          {profile.displayName && (
            <p className="text-sm text-gray-500">@{profile.username}</p>
          )}
          {profile.bio && <p className="mt-2 text-gray-700">{profile.bio}</p>}
        </div>
      </div>

      {/* Tags */}
      {(profile.preferredSystems.length > 0 ||
        profile.playStyleTags.length > 0) && (
        <div className="mb-8 flex flex-col gap-2">
          {profile.preferredSystems.length > 0 && (
            <TagRow label="Systems" tags={profile.preferredSystems} />
          )}
          {profile.playStyleTags.length > 0 && (
            <TagRow label="Play style" tags={profile.playStyleTags} />
          )}
        </div>
      )}

      {/* Review boxes */}
      <div className="flex flex-col gap-6">
        <ReviewBox title="As a DM" reviews={dmReviews} />
        <ReviewBox title="As a Player" reviews={playerReviews} />
      </div>
    </div>
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
