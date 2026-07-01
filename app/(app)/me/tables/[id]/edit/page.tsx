"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import { TableForm, type TableFormValues } from "@/components/tables/TableForm";
import type { TableDetail } from "@/types/table-detail";
import { TableStatus } from "@/lib/enums/table-status.enum";

// ISO string -> "YYYY-MM-DDTHH:mm" for datetime-local input.
// naive (uses browser local time); flagged with the datetime-helper debt.
function toDateTimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function tableToFormValues(t: TableDetail): TableFormValues {
  return {
    title: t.title,
    system: t.system,
    summary: t.summary,
    details: t.details ?? "",
    tableType: t.tableType,
    experienceLevel: t.experienceLevel,
    recurrence: t.recurrence,
    scheduledAt: toDateTimeLocal(t.scheduledAt),
    timezone: t.timezone,
    estimatedDurationHours: t.estimatedDurationHours?.toString() ?? "",
    seatsTotal: t.seatsTotal,
    language: t.language,
    ageRequirement: t.ageRequirement,
    isOnline: t.isOnline,
    platform: t.platform ?? "",
    location: t.location ?? "",
    autoAccept: t.autoAccept ?? false,
    houseRules: t.houseRules ?? "",
    links: t.links ?? "",
  };
}

export default function EditTablePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [values, setValues] = useState<TableFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState<TableStatus | "">("");
  const [statusSaving, setStatusSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=/me/tables/${id}/edit`);
    }
  }, [authLoading, user, id, router]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      try {
        // member-view returns the full table incl links (owner is a member-level viewer)
        const table = await api<TableDetail>(`/tables/${id}/member-view`);
        if (active) setValues(tableToFormValues(table));
        setStatus(table.status);
      } catch (err) {
        if (active) {
          setError(
            err instanceof ApiError && err.status === 403
              ? "Only the table owner can edit this table."
              : "Table not found.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user, id]);

  if (authLoading || loading)
    return <main className="p-8 text-gray-500">Loading…</main>;
  if (error) {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <p className="text-gray-600">{error}</p>
        <Link href={`/me/tables/${id}/manage`} className="text-sm underline">
          Back to manage
        </Link>
      </main>
    );
  }
  if (!values) return null;

  async function handleStatusChange(next: TableStatus) {
    if (next === status) return;
    if (
      !window.confirm(
        `Change table status to ${next.replace(/_/g, " ").toLowerCase()}?`,
      )
    )
      return;
    setStatusSaving(true);
    try {
      await api(`/tables/${id}`, { method: "PATCH", json: { status: next } });
      setStatus(next);
    } catch {
      alert("Couldn't update status.");
    } finally {
      setStatusSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl p-8">
      <Link
        href={`/me/tables/${id}/manage`}
        className="text-sm text-gray-400 hover:underline"
      >
        ← Back to manage
      </Link>
      <h1 className="mt-1 mb-6 text-2xl font-bold">Edit table</h1>

      {/* Status — its own section, uses this page's state/handler */}
      <section className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h2 className="mb-2 text-lg font-semibold">Status</h2>
        <div className="flex items-center gap-3">
          <select
            className="rounded border border-gray-300 px-3 py-2 text-sm"
            value={status}
            onChange={(e) => handleStatusChange(e.target.value as TableStatus)}
            disabled={statusSaving}
          >
            <option value={TableStatus.OPEN}>Open (recruiting)</option>
            <option value={TableStatus.FULL}>Full</option>
            <option value={TableStatus.IN_PROGRESS}>In progress</option>
            <option value={TableStatus.COMPLETED}>Completed</option>
            <option value={TableStatus.CANCELLED}>Cancelled</option>
          </select>
          {statusSaving && (
            <span className="text-xs text-gray-400">Saving…</span>
          )}
        </div>
      </section>

      <TableForm
        initialValues={values}
        submitLabel="Save changes"
        onSubmit={async (payload) => {
          await api(`/tables/${id}`, { method: "PATCH", json: payload });
          router.push(`/me/tables/${id}/manage`);
        }}
      />
    </main>
  );
}
