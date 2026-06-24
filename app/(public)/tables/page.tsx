import { TableCard } from "@/components/cards/Table-card";

import { TableFilters } from "@/components/tables/TableFilters";
import { Pagination } from "@/components/ui/Pagination";
import type { Table } from "@/types/table";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

type TablesResponse = { data: Table[]; total: number };

// the filter keys we forward to the backend, straight from FindTablesDto
const FILTER_KEYS = [
  "system",
  "language",
  "isOnline",
  "ageRequirement",
  "tableType",
  "platform",
  "location",
  "from",
  "to",
  "recurrence",
  "page",
  "limit",
] as const;

async function getTables(
  searchParams: Record<string, string | string[] | undefined>,
): Promise<TablesResponse> {
  const qs = new URLSearchParams();
  for (const key of FILTER_KEYS) {
    const value = searchParams[key];
    if (typeof value === "string" && value !== "") {
      qs.set(key, value);
    }
  }

  const res = await fetch(`${API_URL}/tables?${qs.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to load tables: ${res.status}`);
  return res.json();
}

export default async function TablesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { data: tables, total } = await getTables(params);

  const limit = Number(params.limit) || 20;
  const page = Number(params.page) || 1;

  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="mb-1 text-2xl font-bold">Open Tables</h1>
      <p className="mb-6 text-sm text-gray-500">
        {total} {total === 1 ? "table" : "tables"} looking for players
      </p>

      <TableFilters />

      {tables.length === 0 ? (
        <p className="mt-6 text-gray-500">No tables match your filters.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tables.map((table) => (
            <TableCard key={table.id} table={table} />
          ))}
        </div>
      )}

      <Pagination total={total} page={page} limit={limit} />
    </main>
  );
}
