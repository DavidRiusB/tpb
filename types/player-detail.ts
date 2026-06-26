import { ReviewType } from "@/types/review-type.enum";

type ReviewReviewer = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export type PlayerReview = {
  id: string;
  type: ReviewType;
  badges: string[];
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
