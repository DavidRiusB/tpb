import { JoinRequestStatus } from "@/lib/enums/join-request-status-enum";
import { MembershipStatus } from "@/lib/enums/membership-status.enum";

type PublicUser = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export type ManagementMembership = {
  id: string;
  status: MembershipStatus;
  joinedAt: string;
  endedAt: string | null;
  user: PublicUser;
};

export type ManagementRequest = {
  id: string;
  status: JoinRequestStatus;
  message: string | null;
  createdAt: string;
  user: PublicUser;
};

export type TableManagement = {
  table: {
    id: string;
    title: string;
    system: string;
    description: string | null;
    tableType: string;
    recurrence: string;
    scheduledAt: string;
    timezone: string;
    estimatedDurationHours: number | null;
    isOnline: boolean;
    platform: string;
    location: string | null;
    seatsTotal: number;
    language: string;
    ageRequirement: string;
    status: string;
  };
  memberships: ManagementMembership[];
  requests: ManagementRequest[];
};
