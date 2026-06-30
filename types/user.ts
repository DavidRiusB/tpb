import { Role } from "@/lib/enums/roles.enum";

export type User = {
  id: string;
  username: string;
  notificationEmail: string;
  role: Role; // or string if no enum frontend-side
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  preferredSystems: string[];
  playStyleTags: string[];
  timezone: string | null;
  location: string | null;
  birthDate: string | null; // ISO date string from backend
  createdAt: string;
};
