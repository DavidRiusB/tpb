import { AgeRequirement } from "@/lib/enums/age-requirement.enum";
import { ExperienceLevel } from "@/lib/enums/experience-level.enum";
import { Recurrence } from "@/lib/enums/recurrence.enum";
import { TableStatus } from "@/lib/enums/table-status.enum";
import { TableType } from "@/lib/enums/table-type.enum";

export type TableDm = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export type Table = {
  id: string;
  title: string;
  system: string;
  summary: string;
  tableType: TableType;
  experienceLevel: ExperienceLevel;
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
};
