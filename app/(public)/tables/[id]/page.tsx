import { notFound } from "next/navigation";
import { UserCard } from "@/components/cards/UserCard";
import type { TableDetail } from "@/types/table-detail";
import { TableType } from "@/lib/enums/table-type.enum";
import { Recurrence } from "@/lib/enums/recurrence.enum";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

async function getTableDetail(id: string): Promise<TableDetail | null> {
  const res = await fetch(`${API_URL}/tables/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load table: ${res.status}`);
  return res.json();
}

function formatSchedule(iso: string, timezone: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: timezone,
  });
}

export default async function TableDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const table = await getTableDetail(id);

  if (!table) notFound();

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

      {/* Description */}
      {table.description && (
        <p className="mb-6 text-gray-700">{table.description}</p>
      )}

      {/* Details grid */}
      <div className="mb-8 grid grid-cols-2 gap-3 text-sm">
        <Detail
          label="When"
          value={formatSchedule(table.scheduledAt, table.timezone)}
        />
        <Detail
          label="Duration"
          value={
            table.estimatedDurationHours
              ? `${table.estimatedDurationHours}h`
              : "—"
          }
        />
        <Detail
          label="Where"
          value={
            table.isOnline
              ? `Online · ${table.platform}`
              : (table.location ?? "In person")
          }
        />
        <Detail label="Language" value={table.language} />
        <Detail label="Age" value={table.ageRequirement} />
        <Detail label="Seats" value={`${openSeats}/${table.seatsTotal} open`} />
      </div>

      {/* DM */}
      <section className="mb-8">
        <h2 className="mb-2 text-lg font-semibold">Game Master</h2>
        <UserCard user={table.dm} isDm />
      </section>

      {/* Players */}
      <section>
        <h2 className="mb-2 text-lg font-semibold">
          Players ({table.players.length})
        </h2>
        {table.players.length === 0 ? (
          <p className="text-sm text-gray-500">No players have joined yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {table.players.map((player) => (
              <UserCard key={player.id} user={player} />
            ))}
          </div>
        )}
      </section>

      {/* TODO: "Request to join" button — needs auth + POST /tables/:id/requests */}
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
