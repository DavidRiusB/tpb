import { JoinRequestStatus } from "@/lib/enums/join-request-status-enum";
import { MembershipStatus } from "@/lib/enums/membership-status.enum";
import { Table } from "./table";
import { TableDetail } from "./table-detail";

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
  table: TableDetail;
  memberships: ManagementMembership[];
  requests: ManagementRequest[];
};
