"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { TableType } from "@/lib/enums/table-type.enum";
import { Recurrence } from "@/lib/enums/recurrence.enum";
import { AgeRequirement } from "@/lib/enums/age-requirement.enum";

export function TableFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // local state for text inputs (so typing doesn't fire a request per keystroke)
  const [system, setSystem] = useState(searchParams.get("system") ?? "");
  const [language, setLanguage] = useState(searchParams.get("language") ?? "");

  // keep local text state in sync if the URL changes externally (back button etc.)
  useEffect(() => {
    setSystem(searchParams.get("system") ?? "");
    setLanguage(searchParams.get("language") ?? "");
  }, [searchParams]);

  // build a new URL with one param changed, reset to page 1 on any filter change
  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page"); // changing a filter resets pagination
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearAll() {
    router.push(pathname);
  }

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-gray-300 bg-gray-50 p-4">
      {/* System — text, applied on Enter or blur */}
      <label className="flex flex-col gap-1 text-xs text-gray-600">
        System
        <input
          type="text"
          value={system}
          onChange={(e) => setSystem(e.target.value)}
          onBlur={() => setParam("system", system)}
          onKeyDown={(e) => e.key === "Enter" && setParam("system", system)}
          placeholder="D&D, Pathfinder…"
          className="rounded border border-gray-300 px-2 py-1 text-sm"
        />
      </label>

      {/* Language — text */}
      <label className="flex flex-col gap-1 text-xs text-gray-600">
        Language
        <input
          type="text"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          onBlur={() => setParam("language", language)}
          onKeyDown={(e) => e.key === "Enter" && setParam("language", language)}
          placeholder="English, Spanish…"
          className="rounded border border-gray-300 px-2 py-1 text-sm"
        />
      </label>

      {/* Online — select */}
      <label className="flex flex-col gap-1 text-xs text-gray-600">
        Format
        <select
          value={searchParams.get("isOnline") ?? ""}
          onChange={(e) => setParam("isOnline", e.target.value)}
          className="rounded border border-gray-300 px-2 py-1 text-sm"
        >
          <option value="">Any</option>
          <option value="true">Online</option>
          <option value="false">In person</option>
        </select>
      </label>

      {/* Type — select */}
      <label className="flex flex-col gap-1 text-xs text-gray-600">
        Type
        <select
          value={searchParams.get("tableType") ?? ""}
          onChange={(e) => setParam("tableType", e.target.value)}
          className="rounded border border-gray-300 px-2 py-1 text-sm"
        >
          <option value="">Any</option>
          {Object.values(TableType).map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>

      {/* Recurrence — select */}
      <label className="flex flex-col gap-1 text-xs text-gray-600">
        Recurrence
        <select
          value={searchParams.get("recurrence") ?? ""}
          onChange={(e) => setParam("recurrence", e.target.value)}
          className="rounded border border-gray-300 px-2 py-1 text-sm"
        >
          <option value="">Any</option>
          {Object.values(Recurrence).map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>

      {/* Age — select */}
      <label className="flex flex-col gap-1 text-xs text-gray-600">
        Age
        <select
          value={searchParams.get("ageRequirement") ?? ""}
          onChange={(e) => setParam("ageRequirement", e.target.value)}
          className="rounded border border-gray-300 px-2 py-1 text-sm"
        >
          <option value="">Any</option>
          {Object.values(AgeRequirement).map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </label>

      {/* Date range */}
      <label className="flex flex-col gap-1 text-xs text-gray-600">
        From
        <input
          type="date"
          value={searchParams.get("from") ?? ""}
          onChange={(e) => setParam("from", e.target.value)}
          className="rounded border border-gray-300 px-2 py-1 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-gray-600">
        To
        <input
          type="date"
          value={searchParams.get("to") ?? ""}
          onChange={(e) => setParam("to", e.target.value)}
          className="rounded border border-gray-300 px-2 py-1 text-sm"
        />
      </label>

      <button
        onClick={clearAll}
        className="ml-auto rounded border border-gray-300 px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
      >
        Clear
      </button>
    </div>
  );
}
