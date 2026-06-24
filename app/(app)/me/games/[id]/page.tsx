"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import type { TableDetail } from "@/types/table-detail";
import { UserCard } from "@/components/cards/UserCard";
import { TableType } from "@/lib/enums/table-type.enum";
import { Recurrence } from "@/lib/enums/recurrence.enum";

export default function MemberTablePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params); // unwrap the params promise in a client component
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [table, setTable] = useState<TableDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // per-page auth gate (interim until route-group gate)
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=/me/games/${id}`);
    }
  }, [authLoading, user, id, router]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      try {
        const res = await api<TableDetail>(`/tables/${id}/member-view`);
        if (active) setTable(res);
      } catch (err) {
        if (active) {
          // 403 = not a member; 404 = no such table
          setError(
            err instanceof ApiError && err.status === 403
              ? "You are not a member of this table."
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

  if (authLoading || loading) {
    return <main className="p-8 text-gray-500">Loading…</main>;
  }

  if (error) {
    return (
      <main className="mx-auto max-w-3xl p-8">
        <p className="text-gray-600">{error}</p>
        <Link href="/me/games" className="text-sm underline">
          Back to my games
        </Link>
      </main>
    );
  }

  if (!table) return null;

  const openSeats = table.seatsTotal - table.players.length;
  const isRecurring = table.recurrence !== Recurrence.NONE;

  return (
    <main className="mx-auto max-w-3xl p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold">{table.title}</h1>
          <span className="shrink-0 rounded bg-gray-200 px-2 py-1 text-sm font-medium">
            {table.system}
          </span>
        </div>
        <p className="text-sm text-gray-600">
          {table.tableType === TableType.CAMPAIGN ? "Campaign" : "One-shot"}
          {isRecurring && ` · ${table.recurrence.toLowerCase()}`}
        </p>
      </div>

      {/* Table chat entry — the member-only action */}
      <div className="mb-6">
        {/* TODO: links to table chat once chat UI exists */}
        <button
          className="rounded bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700"
          onClick={() => router.push(`/conversations/table/${table.id}`)}
        >
          Open table chat
        </button>
      </div>

      {table.description && (
        <p className="mb-6 text-gray-700">{table.description}</p>
      )}

      {/* Details grid */}
      <div className="mb-8 grid grid-cols-2 gap-3 text-sm">
        <Detail
          label="Where"
          value={
            table.isOnline
              ? `Online · ${table.platform}`
              : (table.location ?? "In person")
          }
        />
        <Detail label="Language" value={table.language} />
        <Detail label="Seats" value={`${openSeats}/${table.seatsTotal} open`} />
        <Detail label="Status" value={table.status} />
      </div>

      {/* DM — clickable to their profile */}
      <section className="mb-8">
        <h2 className="mb-2 text-lg font-semibold">Game Master</h2>
        <Link href={`/me/games/${table.id}/users/${table.dm.id}`}>
          <UserCard user={table.dm} isDm />
        </Link>
      </section>

      {/* Players — clickable to their profiles */}
      <section>
        <h2 className="mb-2 text-lg font-semibold">
          Players ({table.players.length})
        </h2>
        {table.players.length === 0 ? (
          <p className="text-sm text-gray-500">No other players yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {table.players.map((player) => (
              <Link
                key={player.id}
                href={`/me/games/${table.id}/users/${player.id}`}
              >
                <UserCard user={player} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="block text-xs uppercase tracking-wide text-gray-400">
        {label}
      </span>
      <span className="text-gray-800">{value}</span>
    </div>
  );
}
