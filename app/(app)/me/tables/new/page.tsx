"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import { TableType } from "@/lib/enums/table-type.enum";
import { Recurrence } from "@/lib/enums/recurrence.enum";
import { AgeRequirement } from "@/lib/enums/age-requirement.enum";
import { ExperienceLevel } from "@/lib/enums/experience-level.enum";

// detect the user's tz as a sensible default for the timezone field
const localTz =
  Intl.DateTimeFormat().resolvedOptions().timeZone ?? "America/Bogota";

export default function CreateTablePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [form, setForm] = useState({
    title: "",
    system: "",
    summary: "",
    details: "",
    tableType: TableType.ONE_SHOT,
    experienceLevel: ExperienceLevel.ALL,
    recurrence: Recurrence.NONE,
    scheduledAt: "", // datetime-local string
    timezone: localTz,
    estimatedDurationHours: "",
    isOnline: true,
    platform: "",
    location: "",
    seatsTotal: 4,
    language: "",
    ageRequirement: AgeRequirement.ALL_AGES,
    autoAccept: false,
    houseRules: "",
    links: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/me/tables/new");
    }
  }, [authLoading, user, router]);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit() {
    setError(null);

    // minimal client-side guard; backend validates fully
    if (
      !form.title ||
      !form.system ||
      !form.summary ||
      !form.language ||
      !form.scheduledAt
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      // build payload — convert types, drop empty optionals
      const payload = {
        title: form.title,
        system: form.system,
        summary: form.summary,
        details: form.details || undefined,
        tableType: form.tableType,
        experienceLevel: form.experienceLevel,
        recurrence: form.recurrence,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        timezone: form.timezone,
        estimatedDurationHours: form.estimatedDurationHours
          ? Number(form.estimatedDurationHours)
          : undefined,
        isOnline: form.isOnline,
        platform: form.isOnline ? form.platform || undefined : undefined,
        location: !form.isOnline ? form.location || undefined : undefined,
        seatsTotal: Number(form.seatsTotal),
        language: form.language,
        ageRequirement: form.ageRequirement,
        autoAccept: form.autoAccept,
        houseRules: form.houseRules || undefined,
        links: form.links || undefined,
      };

      const created = await api<{ id: string }>("/tables", {
        method: "POST",
        json: payload,
      });

      // success — go manage the new table
      router.push(`/me/tables/${created.id}/manage`);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to create table.",
      );
      setSubmitting(false);
    }
  }

  if (authLoading) return <main className="p-8 text-gray-500">Loading…</main>;
  if (!user) return null;

  return (
    <main className="mx-auto max-w-2xl p-8">
      <Link href="/me/tables" className="text-sm text-gray-400 hover:underline">
        ← My tables
      </Link>
      <h1 className="mt-1 mb-6 text-2xl font-bold">Create a table</h1>

      {error && (
        <p className="mb-4 rounded border border-red-300 bg-red-50 p-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-8">
        {/* Basics */}
        <Section title="Basics">
          <Field label="Title *">
            <input
              className={inputCls}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              maxLength={100}
            />
          </Field>
          <Field label="System *">
            <input
              className={inputCls}
              value={form.system}
              onChange={(e) => set("system", e.target.value)}
              placeholder="D&D 5e, Pathfinder 2e, Call of Cthulhu…"
              maxLength={100}
            />
          </Field>
          <Field label="Summary * (short pitch, max 280)">
            <textarea
              className={inputCls}
              value={form.summary}
              onChange={(e) => set("summary", e.target.value)}
              maxLength={280}
              rows={2}
            />
            <span className="text-xs text-gray-400">
              {form.summary.length}/280
            </span>
          </Field>
          <Field label="Details (longer description, optional)">
            <textarea
              className={inputCls}
              value={form.details}
              onChange={(e) => set("details", e.target.value)}
              rows={4}
            />
          </Field>
        </Section>

        {/* Format */}
        <Section title="Format">
          <Field label="Type">
            <select
              className={inputCls}
              value={form.tableType}
              onChange={(e) => set("tableType", e.target.value as TableType)}
            >
              <option value={TableType.ONE_SHOT}>One-shot</option>
              <option value={TableType.CAMPAIGN}>Campaign</option>
            </select>
          </Field>
          <Field label="Experience level">
            <select
              className={inputCls}
              value={form.experienceLevel}
              onChange={(e) =>
                set("experienceLevel", e.target.value as ExperienceLevel)
              }
            >
              <option value={ExperienceLevel.ALL}>All levels</option>
              <option value={ExperienceLevel.BEGINNER_FRIENDLY}>
                Beginner friendly
              </option>
              <option value={ExperienceLevel.EXPERIENCED}>Experienced</option>
            </select>
          </Field>
          <Field label="Recurrence">
            <select
              className={inputCls}
              value={form.recurrence}
              onChange={(e) => set("recurrence", e.target.value as Recurrence)}
            >
              <option value={Recurrence.NONE}>None</option>
              <option value={Recurrence.WEEKLY}>Weekly</option>
              <option value={Recurrence.BIWEEKLY}>Biweekly</option>
              <option value={Recurrence.MONTHLY}>Monthly</option>
            </select>
          </Field>
        </Section>

        {/* When */}
        <Section title="When">
          <Field label="First session *">
            <input
              type="datetime-local"
              className={inputCls}
              value={form.scheduledAt}
              onChange={(e) => set("scheduledAt", e.target.value)}
            />
          </Field>
          <Field label="Timezone">
            <input
              className={inputCls}
              value={form.timezone}
              onChange={(e) => set("timezone", e.target.value)}
            />
          </Field>
          <Field label="Estimated duration (hours, optional)">
            <input
              type="number"
              min={1}
              className={inputCls}
              value={form.estimatedDurationHours}
              onChange={(e) => set("estimatedDurationHours", e.target.value)}
            />
          </Field>
        </Section>

        {/* Where */}
        <Section title="Where">
          <Field label="Format">
            <div className="flex gap-3">
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="radio"
                  checked={form.isOnline}
                  onChange={() => set("isOnline", true)}
                />
                Online
              </label>
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="radio"
                  checked={!form.isOnline}
                  onChange={() => set("isOnline", false)}
                />
                In person
              </label>
            </div>
          </Field>
          {form.isOnline ? (
            <Field label="Platform">
              <input
                className={inputCls}
                value={form.platform}
                onChange={(e) => set("platform", e.target.value)}
                placeholder="Discord, Roll20, Foundry…"
                maxLength={100}
              />
            </Field>
          ) : (
            <Field label="Location">
              <input
                className={inputCls}
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="City, venue…"
                maxLength={150}
              />
            </Field>
          )}
        </Section>

        {/* Players */}
        <Section title="Players">
          <Field label="Seats *">
            <input
              type="number"
              min={1}
              className={inputCls}
              value={form.seatsTotal}
              onChange={(e) => set("seatsTotal", Number(e.target.value))}
            />
          </Field>
          <Field label="Language *">
            <input
              className={inputCls}
              value={form.language}
              onChange={(e) => set("language", e.target.value)}
              placeholder="English, Spanish…"
            />
          </Field>
          <Field label="Age requirement">
            <select
              className={inputCls}
              value={form.ageRequirement}
              onChange={(e) =>
                set("ageRequirement", e.target.value as AgeRequirement)
              }
            >
              <option value={AgeRequirement.ALL_AGES}>All ages</option>
              <option value={AgeRequirement.ADULTS_ONLY}>Adults only</option>
            </select>
          </Field>
          <Field label="">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.autoAccept}
                onChange={(e) => set("autoAccept", e.target.checked)}
              />
              Auto-accept join requests
            </label>
          </Field>
        </Section>

        {/* Table rules */}
        <Section title="Table rules">
          <Field label="House rules (public, optional)">
            <textarea
              className={inputCls}
              value={form.houseRules}
              onChange={(e) => set("houseRules", e.target.value)}
              rows={3}
            />
          </Field>
          <Field label="Links (members only — Discord/VTT, optional)">
            <textarea
              className={inputCls}
              value={form.links}
              onChange={(e) => set("links", e.target.value)}
              rows={2}
              placeholder="One per line"
            />
          </Field>
        </Section>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="rounded bg-gray-800 px-4 py-2 text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {submitting ? "Creating…" : "Create table"}
        </button>
      </div>
    </main>
  );
}

const inputCls =
  "w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 border-b border-gray-100 pb-1 text-lg font-semibold">
        {title}
      </h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      {label && (
        <label className="mb-1 block text-sm text-gray-600">{label}</label>
      )}
      {children}
    </div>
  );
}
