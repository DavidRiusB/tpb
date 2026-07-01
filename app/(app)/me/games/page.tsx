"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { MyTablesResponse } from "@/types/my-games";
import { MembershipStatus } from "@/lib/enums/membership-status.enum";
import { JoinRequestStatus } from "@/lib/enums/join-request-status-enum";

export default function MyGamesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [data, setData] = useState<MyTablesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState<string | null>(null);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // callable fetch — used on mount AND after withdraw
  const loadMyGames = useCallback(async () => {
    try {
      const res = await api<MyTablesResponse>("/tables/me");
      setData(res);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/me/games");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) loadMyGames();
  }, [user, loadMyGames]);

  async function handleWithdraw(tableId: string, requestId: string) {
    if (!window.confirm("Withdraw this join request?")) return;
    setWithdrawing(requestId);
    try {
      await api(`/tables/${tableId}/requests/${requestId}`, {
        method: "DELETE",
      });
      await loadMyGames(); // request drops from pending
    } catch {
      alert("Couldn't withdraw the request.");
    } finally {
      setWithdrawing(null);
    }
  }

  if (authLoading || loading) {
    return <main className="p-8 text-gray-500">Loading…</main>;
  }

  if (!data) return null;

  const activeMemberships = data.memberships.filter(
    (m) => m.status === MembershipStatus.ACTIVE,
  );
  const pendingRequests = data.joinRequests.filter(
    (r) => r.status === JoinRequestStatus.PENDING,
  );

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="mb-6 text-2xl font-bold">My Games</h1>

      {/* Tables I'm playing in */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Playing in</h2>
        {activeMemberships.length === 0 ? (
          <p className="text-sm text-gray-500">
            You haven&apos;t joined any tables yet.{" "}
            <Link href="/tables" className="underline">
              Browse tables
            </Link>
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {activeMemberships.map((m) => (
              <Link
                key={m.id}
                href={`/me/games/${m.table.id}`}
                className="rounded-lg border border-gray-300 bg-white p-3 hover:bg-gray-50"
              >
                <span className="font-medium">{m.table.title}</span>
                <span className="ml-2 text-sm text-gray-500">
                  {m.table.system}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Requests I've sent */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Pending requests</h2>
        {pendingRequests.length === 0 ? (
          <p className="text-sm text-gray-500">No pending requests.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {pendingRequests.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-lg border border-gray-300 bg-white p-3"
              >
                <Link
                  href={`/tables/${r.table.id}`}
                  className="flex-1 hover:underline"
                >
                  <span className="font-medium">{r.table.title}</span>
                  <span className="ml-2 text-xs text-gray-400">
                    Awaiting DM
                  </span>
                </Link>
                <button
                  onClick={() => handleWithdraw(r.table.id, r.id)}
                  disabled={withdrawing === r.id}
                  className="ml-3 rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  {withdrawing === r.id ? "…" : "Withdraw"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
