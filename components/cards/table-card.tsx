import Link from "next/link";

import { TableType } from "@/lib/enums/table-type.enum";
import { Recurrence } from "@/lib/enums/recurrence.enum";
import { TableBoard } from "@/types/table-board";

function formatSchedule(iso: string, timezone: string): string {
  // iso is a string over the wire — convert to Date only here, at display time
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timezone,
  });
}

export function TableCard({ table }: { table: TableBoard }) {
  const isRecurring = table.recurrence !== Recurrence.NONE;

  return (
    <Link
      href={`/tables/${table.id}`}
      className="block rounded-lg border border-gray-300 bg-white p-4 transition-colors hover:border-gray-500 hover:bg-gray-50"
    >
      {/* Title + system */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="font-bold text-lg leading-tight">{table.title}</h3>
        <span className="shrink-0 rounded bg-gray-200 px-2 py-0.5 text-xs font-medium">
          {table.system}
        </span>
      </div>

      {/* Type + recurrence + experienceLevel*/}
      <p className="mb-2 text-sm text-gray-600">
        {table.tableType === TableType.CAMPAIGN ? "Campaign" : "One-shot"}
        {isRecurring && ` · ${table.recurrence.toLowerCase()}`}
        {` · ${table.experienceLevel.toLowerCase().replace(/_/g, " ")}`}
      </p>

      {/* Description (truncated) */}
      {table.summary && (
        <p className="mb-3  text-sm text-gray-700">{table.summary}</p>
      )}

      {/* Meta row: when, where, language */}
      <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
        <span>{formatSchedule(table.scheduledAt, table.timezone)}</span>
        <span>
          {table.isOnline
            ? `Online · ${table.platform}`
            : (table.location ?? "In person")}
        </span>
        <span>{table.language}</span>
      </div>

      {/* Footer: DM + seats */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-sm">
        <span className="text-gray-600">
          DM: {table.dm.displayName ?? table.dm.username}
        </span>
        <span className="text-gray-500">
          {table.seatsTotal - table.activeMemberCount}/{table.seatsTotal} open
        </span>
      </div>
    </Link>
  );
}
