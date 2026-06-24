import { AgeRequirement } from "@/lib/enums/age-requirement.enum";
import { Recurrence } from "@/lib/enums/recurrence.enum";
import { TableStatus } from "@/lib/enums/table-status.enum";
import { TableType } from "@/lib/enums/table-type.enum";

export type LeanTable = {
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
};
