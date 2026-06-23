import { AgeRequirement } from "@/lib/enums/age-requirement.enum";
import { Recurrence } from "@/lib/enums/recurrence.enum";
import { TableStatus } from "@/lib/enums/table-status.enum";
import { TableType } from "@/lib/enums/table-type.enum";

// a user as seen in table detail — public fields + reputation summary
export type TableUser = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  badges: Record<string, number>; // e.g. { FRIENDLY: 3 } — empty {} if none
  reviewCount: number;
};

export type TableDetail = {
  id: string;
  title: string;
  system: string;
  description: string | null;
  tableType: TableType;
  recurrence: Recurrence;
  scheduledAt: string;
  timezone: string;
  estimatedDurationHours: number | null;
  isOnline: boolean;
  platform: string;
  location: string | null;
  seatsTotal: number;
  language: string;
  ageRequirement: AgeRequirement;
  status: TableStatus;
  dm: TableUser;
  players: TableUser[];
};
