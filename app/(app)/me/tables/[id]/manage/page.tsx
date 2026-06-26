// app/(app)/me/tables/[id]/manage/page.tsx
"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import type { TableManagement } from "@/types/table-management";
import { MembershipStatus } from "@/lib/enums/membership-status.enum";
import { JoinRequestStatus } from "@/lib/enums/join-request-status-enum";
import { RequestCard } from "@/components/cards/RequestCard";
import { Avatar } from "@/components/ui/Avatar";

export default function ManageTablePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // inside ManageTablePage, replace the data-fetching useEffect with this pattern:

  const [data, setData] = useState<TableManagement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // callable fetch — used on mount AND after an action
  const loadManagement = useCallback(async () => {
    try {
      const res = await api<TableManagement>(`/tables/${id}/manage`);
      setData(res);
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 403
          ? "Only the table owner can manage this table."
          : "Table not found.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=/me/tables/${id}/manage`);
    }
  }, [authLoading, user, id, router]);

  useEffect(() => {
    if (user) loadManagement();
  }, [user, loadManagement]);

  if (authLoading || loading) {
    return <main className="p-8 text-gray-500">Loading…</main>;
  }

  if (error) {
    return (
      <main className="mx-auto max-w-3xl p-8">
        <p className="text-gray-600">{error}</p>
        <Link href="/me/tables" className="text-sm underline">
          Back to my tables
        </Link>
      </main>
    );
  }

  if (!data) return null;

  const { table, memberships, requests } = data;

  const activeMembers = memberships.filter(
    (m) => m.status === MembershipStatus.ACTIVE,
  );
  const pendingRequests = requests.filter(
    (r) => r.status === JoinRequestStatus.PENDING,
  );

  return (
    <main className="mx-auto max-w-6xl p-8">
      <div className="mb-6">
        <Link
          href="/me/tables"
          className="text-sm text-gray-400 hover:underline"
        >
          ← My tables
        </Link>
        <h1 className="mt-1 text-2xl font-bold">Manage: {table.title}</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Column 1 — table info */}
        <section className="rounded-lg border border-gray-300 bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">Table</h2>
          <dl className="space-y-2 text-sm">
            <Row label="System" value={table.system} />
            <Row label="Type" value={table.tableType} />
            <Row label="Recurrence" value={table.recurrence} />
            <Row label="Status" value={table.status} />
            <Row
              label="Where"
              value={
                table.isOnline
                  ? `Online · ${table.platform}`
                  : (table.location ?? "In person")
              }
            />
            <Row label="Language" value={table.language} />
            <Row label="Age" value={table.ageRequirement} />
            <Row
              label="Seats"
              value={`${activeMembers.length}/${table.seatsTotal}`}
            />
          </dl>
          {table.description && (
            <p className="mt-3 border-t border-gray-100 pt-3 text-sm text-gray-600">
              {table.description}
            </p>
          )}
        </section>

        {/* Column 2 — members */}
        <section className="rounded-lg border border-gray-300 bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">
            Members ({activeMembers.length})
          </h2>
          {activeMembers.length === 0 ? (
            <p className="text-sm text-gray-400">No active members yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {activeMembers.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-2 rounded border border-gray-200 p-2"
                >
                  <Avatar name={m.user.displayName ?? m.user.username} />
                  <span className="text-sm font-medium">
                    {m.user.displayName ?? m.user.username}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Column 3 — pending requests */}
        <section className="rounded-lg border border-gray-300 bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">
            Pending requests ({pendingRequests.length})
          </h2>
          {pendingRequests.length === 0 ? (
            <p className="text-sm text-gray-400">No pending requests.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {pendingRequests.map((r) => (
                <RequestCard
                  key={r.id}
                  tableId={table.id}
                  request={r}
                  onActionDone={loadManagement}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-gray-400">{label}</dt>
      <dd className="text-right text-gray-800">{value}</dd>
    </div>
  );
}
