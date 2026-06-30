"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { MyTablesResponse } from "@/types/my-games";

export default function MyTablesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [data, setData] = useState<MyTablesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/me/tables");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      try {
        const res = await api<MyTablesResponse>("/tables/me");
        if (active) setData(res);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user]);

  if (authLoading || loading) {
    return <main className="p-8 text-gray-500">Loading…</main>;
  }

  if (!data) return null;

  return (
    <main className="mx-auto max-w-3xl p-8">
      <Link
        href="/me/games"
        className="mb-4 inline-block text-sm text-gray-400 hover:underline"
      >
        ← Back to Games
      </Link>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Tables</h1>
        <Link
          href="/me/tables/new"
          className="rounded bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700"
        >
          Create Table
        </Link>
      </div>

      {data.dmTables.length === 0 ? (
        <p className="text-sm text-gray-500">
          You aren&apos;t running any tables yet.{" "}
          <Link href="/me/tables/new" className="underline">
            Create one
          </Link>{" "}
          to start.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {data.dmTables.map((table) => (
            <Link
              key={table.id}
              href={`/me/tables/${table.id}/manage`}
              className="flex items-center justify-between rounded-lg border border-gray-300 bg-white p-4 hover:bg-gray-50"
            >
              <div>
                <span className="font-medium">{table.title}</span>
                <span className="ml-2 text-sm text-gray-500">
                  {table.system}
                </span>
                <p className="text-xs text-gray-400">
                  {table.tableType} · {table.status}
                </p>
              </div>
              <span className="text-sm text-gray-400">Manage →</span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
