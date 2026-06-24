// types/player-detail.ts
type ReviewReviewer = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export type PlayerReview = {
  id: string;
  sharedBadges: string[];
  dmBadges: string[];
  playerBadges: string[];
  writtenReview: string | null;
  createdAt: string;
  reviewer: ReviewReviewer;
};

export type PlayerDetail = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  preferredSystems: string[];
  playStyleTags: string[];
  reviews: PlayerReview[];
};

export type ReviewCategory = "dm" | "player" | "shared";

// one review -> one box, by priority dm > player > shared.
// swap this single function when the review model gets cleaned up.
export function categorizeReview(r: PlayerReview): ReviewCategory {
  if (r.dmBadges.length > 0) return "dm";
  if (r.playerBadges.length > 0) return "player";
  return "shared";
}
