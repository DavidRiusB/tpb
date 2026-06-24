"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";

type Status = "idle" | "sending" | "sent";

export function JoinRequestButton({ tableId }: { tableId: string }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  // still resolving who the user is
  if (loading) {
    return (
      <button disabled className="rounded bg-gray-300 px-4 py-2 text-white">
        …
      </button>
    );
  }

  // not logged in — send to login, come back here after
  if (!user) {
    return (
      <button
        onClick={() => router.push(`/login?redirect=/tables/${tableId}`)}
        className="rounded bg-gray-800 px-4 py-2 text-white hover:bg-gray-700"
      >
        Log in to join
      </button>
    );
  }

  async function handleJoin() {
    setError(null);
    setStatus("sending");
    try {
      await api(`/tables/${tableId}/requests`, {
        method: "POST",
        json: {}, // message is optional; sending none for now
      });
      setStatus("sent");
    } catch (err) {
      setStatus("idle");
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    }
  }

  if (status === "sent") {
    return (
      <p className="text-sm font-medium text-green-700">
        Request sent — the DM will review it.
      </p>
    );
  }

  return (
    <div>
      <button
        onClick={handleJoin}
        disabled={status === "sending"}
        className="rounded bg-gray-800 px-4 py-2 text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {status === "sending" ? "Sending…" : "Request to join"}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
