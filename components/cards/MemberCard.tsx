"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { api, ApiError } from "@/lib/api";
import type { ManagementMembership } from "@/types/table-management";

export function MemberCard({
  tableId,
  membership,
  onActionDone,
}: {
  tableId: string;
  membership: ManagementMembership;
  onActionDone: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function kick() {
    setError(null);
    setSubmitting(true);
    try {
      await api(`/tables/${tableId}/members/${membership.id}`, {
        method: "DELETE",
      });
      onActionDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Kick failed");
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-lg border border-gray-300 bg-white p-3">
      <div className="mb-2 flex items-center gap-2">
        <Avatar
          name={membership.user.displayName ?? membership.user.username}
        />
        <Link
          href={`/me/tables/${tableId}/manage/members/${membership.user.id}`}
          className="text-sm font-medium hover:underline"
        >
          {membership.user.displayName ?? membership.user.username}
        </Link>
      </div>

      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={kick}
          disabled={submitting}
          className="flex-1 rounded border border-red-300 px-3 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
        >
          {submitting ? "…" : "Kick"}
        </button>
      </div>
    </div>
  );
}
