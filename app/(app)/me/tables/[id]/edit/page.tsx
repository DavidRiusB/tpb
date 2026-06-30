"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import { TableForm, type TableFormValues } from "@/components/tables/TableForm";
import type { TableDetail } from "@/types/table-detail";

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

  return (
    <main className="mx-auto max-w-2xl p-8">
      <Link
        href={`/me/tables/${id}/manage`}
        className="text-sm text-gray-400 hover:underline"
      >
        ← Back to manage
      </Link>
      <h1 className="mt-1 mb-6 text-2xl font-bold">Edit table</h1>

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
