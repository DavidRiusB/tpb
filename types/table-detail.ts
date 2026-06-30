import { Table } from "./table";

// a user as seen in table detail — public fields + reputation summary
export type TableUser = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  badges: Record<string, number>; // e.g. { FRIENDLY: 3 } — empty {} if none
  reviewCount: number;
};

// detail
export type TableDetail = Table & {
  dm: TableUser; // with badges
  players: TableUser[];
  // member-only fields (houseRules, links) optional, present on member-view
  houseRules?: string;
  links?: string;
  details: string | null;
  autoAccept: boolean;
};
