"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import { TableForm, type TableFormValues } from "@/components/tables/TableForm";
import { TableType } from "@/lib/enums/table-type.enum";
import { Recurrence } from "@/lib/enums/recurrence.enum";
import { AgeRequirement } from "@/lib/enums/age-requirement.enum";
import { ExperienceLevel } from "@/lib/enums/experience-level.enum";

const localTz =
  Intl.DateTimeFormat().resolvedOptions().timeZone ?? "America/Bogota";

const EMPTY: TableFormValues = {
  title: "",
  system: "",
  summary: "",
  details: "",
  tableType: TableType.ONE_SHOT,
  experienceLevel: ExperienceLevel.ALL,
  recurrence: Recurrence.NONE,
  scheduledAt: "",
  timezone: localTz,
  estimatedDurationHours: "",
  seatsTotal: 4,
  language: "",
  ageRequirement: AgeRequirement.ALL_AGES,
  isOnline: true,
  platform: "",
  location: "",
  autoAccept: false,
  houseRules: "",
  links: "",
};

export default function CreateTablePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) router.push("/login?redirect=/me/tables/new");
  }, [authLoading, user, router]);

  if (authLoading) return <main className="p-8 text-gray-500">Loading…</main>;
  if (!user) return null;

  return (
    <main className="mx-auto max-w-2xl p-8">
      <Link href="/me/tables" className="text-sm text-gray-400 hover:underline">
        ← My tables
      </Link>
      <h1 className="mt-1 mb-6 text-2xl font-bold">Create a table</h1>

      <TableForm
        initialValues={EMPTY}
        submitLabel="Create table"
        onSubmit={async (payload) => {
          const created = await api<{ id: string }>("/tables", {
            method: "POST",
            json: payload,
          });
          router.push(`/me/tables/${created.id}/manage`);
        }}
      />
    </main>
  );
}
