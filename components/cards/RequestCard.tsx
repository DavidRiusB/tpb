"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { api, ApiError } from "@/lib/api";
import { JoinRequestStatus } from "@/lib/enums/join-request-status-enum";
import type { ManagementRequest } from "@/types/table-management";

export function RequestCard({
  tableId,
  request,
  onActionDone,
}: {
  tableId: string;
  request: ManagementRequest;
  onActionDone: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function act(status: JoinRequestStatus) {
    setError(null);
    setSubmitting(true);
    try {
      await api(`/tables/${tableId}/requests/${request.id}`, {
        method: "PATCH",
        json: { status },
      });
      onActionDone(); // tell the page to refetch
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action failed");
      setSubmitting(false); // only reset on error — on success the card unmounts
    }
  }

  return (
    <div className="rounded-lg border border-gray-300 bg-white p-3">
      <div className="mb-2 flex items-center gap-2">
        <Avatar name={request.user.displayName ?? request.user.username} />
        <span className="text-sm font-medium">
          {request.user.displayName ?? request.user.username}
        </span>
      </div>

      {request.message && (
        <p className="mb-2 border-l-2 border-gray-200 pl-2 text-xs italic text-gray-600">
          {request.message}
        </p>
      )}

      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={() => act(JoinRequestStatus.APPROVED)}
          disabled={submitting}
          className="flex-1 rounded bg-gray-800 px-3 py-1 text-xs text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {submitting ? "…" : "Accept"}
        </button>
        <button
          onClick={() => act(JoinRequestStatus.REJECTED)}
          disabled={submitting}
          className="flex-1 rounded border border-gray-300 px-3 py-1 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
