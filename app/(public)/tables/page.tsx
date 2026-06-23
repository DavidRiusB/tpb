import { TableCard } from "@/components/cards/Table-card";
import type { Table } from "@/types/table";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

type TablesResponse = {
  data: Table[];
  total: number;
};

async function getTables(): Promise<TablesResponse> {
  const res = await fetch(`${API_URL}/tables`, {
    // server-side fetch; this public endpoint needs no credentials
    cache: "no-store", // always fresh — the board changes constantly
  });

  if (!res.ok) {
    throw new Error(`Failed to load tables: ${res.status}`);
  }

  return res.json();
}

export default async function TablesPage() {
  const { data: tables, total } = await getTables();

  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="mb-1 text-2xl font-bold">Open Tables</h1>
      <p className="mb-6 text-sm text-gray-500">
        {total} {total === 1 ? "table" : "tables"} looking for players
      </p>

      {tables.length === 0 ? (
        <p className="text-gray-500">
          No open tables right now. Check back soon.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tables.map((table) => (
            <TableCard key={table.id} table={table} />
          ))}
        </div>
      )}
    </main>
  );
}
