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
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export default function MemberTablePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [table, setTable] = useState<TableDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);

  async function handleLeave() {
    setLeaving(true);
    try {
      await api(`/tables/${table!.id}/members/me`, { method: "DELETE" });
      router.push("/me/games"); // no longer a member, leave the page
    } catch {
      alert("Couldn't leave the table.");
      setLeaving(false);
    }
  }

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
      <button
        onClick={() => setLeaveOpen(true)}
        className="rounded border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
      >
        Leave table
      </button>

      <ConfirmModal
        open={leaveOpen}
        title="Leave this table?"
        message="You'll be removed from the table. You can request to join again later."
        confirmLabel="Leave"
        danger
        loading={leaving}
        onConfirm={handleLeave}
        onCancel={() => setLeaveOpen(false)}
      />
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

      {/* Summary — short pitch */}
      {table.summary && <p className="mb-4 text-gray-700">{table.summary}</p>}

      {/* Details — story/setting/lore */}
      {table.details && (
        <div className="mb-6">
          <h2 className="mb-2 text-lg font-semibold">About this game</h2>
          <p className="whitespace-pre-line text-gray-700">{table.details}</p>
        </div>
      )}

      {/* House rules — table meta (homebrew, allowed material). public,
    so players can decide before joining. */}
      {table.houseRules && (
        <div className="mb-6">
          <h2 className="mb-2 text-lg font-semibold">House rules</h2>
          <p className="whitespace-pre-line text-gray-700">
            {table.houseRules}
          </p>
        </div>
      )}
      {table.links && (
        <div className="mb-6">
          <h2 className="mb-2 text-lg font-semibold">Links</h2>
          <p className="whitespace-pre-line text-gray-700">{table.links}</p>
        </div>
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
