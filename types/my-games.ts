import { JoinRequestStatus } from "@/lib/enums/join-request-status-enum";
import { MembershipStatus } from "@/lib/enums/membership-status.enum";

import { LeanTable } from "./lean-table";

export type Membership = {
  id: string;
  table: LeanTable;
  status: MembershipStatus;
  joinedAt: string;
  endedAt: string | null;
};

export type JoinRequest = {
  id: string;
  table: LeanTable;
  status: JoinRequestStatus;
  message: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MyTablesResponse = {
  dmTables: LeanTable[];
  memberships: Membership[];
  joinRequests: JoinRequest[];
};
