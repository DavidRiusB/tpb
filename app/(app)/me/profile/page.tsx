"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import type { User } from "@/types/user";

export default function ProfilePage() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // editable form state — strings for inputs; arrays edited as comma text
  const [form, setForm] = useState({
    displayName: "",
    notificationEmail: "",
    bio: "",
    preferredSystems: "", // comma-separated in the input
    playStyleTags: "",
    timezone: "",
    location: "",
    avatarUrl: "",
  });

  useEffect(() => {
    if (!authLoading && !authUser) router.push("/login?redirect=/me/profile");
  }, [authLoading, authUser, router]);

  useEffect(() => {
    if (!authUser) return;
    let active = true;
    (async () => {
      try {
        const me = await api<User>("/users/me");
        if (!active) return;
        setUser(me);
        setForm({
          displayName: me.displayName ?? "",
          notificationEmail: me.notificationEmail ?? "",
          bio: me.bio ?? "",
          preferredSystems: me.preferredSystems.join(", "),
          playStyleTags: me.playStyleTags.join(", "),
          timezone: me.timezone ?? "",
          location: me.location ?? "",
          avatarUrl: me.avatarUrl ?? "",
        });
      } catch {
        if (active) setError("Couldn't load your profile.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [authUser]);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  // "D&D 5e, Pathfinder" -> ["D&D 5e", "Pathfinder"]; drops blanks
  function splitCsv(s: string): string[] {
    return s
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  }

  async function handleSave() {
    setError(null);
    setSaved(false);
    setSaving(true);
    try {
      const payload = {
        displayName: form.displayName || undefined,
        notificationEmail: form.notificationEmail || undefined,
        bio: form.bio || undefined,
        preferredSystems: splitCsv(form.preferredSystems),
        playStyleTags: splitCsv(form.playStyleTags),
        timezone: form.timezone || undefined,
        location: form.location || undefined,
        avatarUrl: form.avatarUrl || undefined,
      };
      const updated = await api<User>("/users/me", {
        method: "PATCH",
        json: payload,
      });
      setUser(updated);
      setSaved(true);
      // if AuthContext exposes a refresh, call it so nav/cached user updates.
      // otherwise the nav shows the old displayName until next reload (acceptable).
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Couldn't save changes.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || loading)
    return <main className="p-8 text-gray-500">Loading…</main>;
  if (error && !user) {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <p className="text-gray-600">{error}</p>
      </main>
    );
  }
  if (!user) return null;

  return (
    <main className="mx-auto max-w-2xl p-8">
      <Link href="/me" className="text-sm text-gray-400 hover:underline">
        ← Back
      </Link>
      <h1 className="mt-1 mb-6 text-2xl font-bold">My profile</h1>

      {/* Display-only identity */}
      <section className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
        <Read label="Username" value={user.username} />
        <Read label="Role" value={user.role} />
        <Read
          label="Member since"
          value={new Date(user.createdAt).toLocaleDateString()}
        />
        {user.birthDate && (
          <Read
            label="Birth date"
            value={new Date(user.birthDate).toLocaleDateString()}
          />
        )}
      </section>

      {/* Editable */}
      <div className="flex flex-col gap-4">
        <Field label="Display name">
          <input
            className={inputCls}
            value={form.displayName}
            onChange={(e) => set("displayName", e.target.value)}
            maxLength={100}
          />
        </Field>
        <Field label="Notification email">
          <input
            className={inputCls}
            type="email"
            value={form.notificationEmail}
            onChange={(e) => set("notificationEmail", e.target.value)}
          />
        </Field>
        <Field label="Bio">
          <textarea
            className={inputCls}
            value={form.bio}
            onChange={(e) => set("bio", e.target.value)}
            rows={3}
          />
        </Field>
        <Field label="Preferred systems (comma-separated)">
          <input
            className={inputCls}
            value={form.preferredSystems}
            onChange={(e) => set("preferredSystems", e.target.value)}
            placeholder="D&D 5e, Pathfinder 2e"
          />
        </Field>
        <Field label="Play style tags (comma-separated)">
          <input
            className={inputCls}
            value={form.playStyleTags}
            onChange={(e) => set("playStyleTags", e.target.value)}
            placeholder="roleplay-heavy, tactical"
          />
        </Field>
        <Field label="Timezone">
          <input
            className={inputCls}
            value={form.timezone}
            onChange={(e) => set("timezone", e.target.value)}
            placeholder="America/Bogota"
          />
        </Field>
        <Field label="Location">
          <input
            className={inputCls}
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            maxLength={100}
          />
        </Field>
        <Field label="Avatar URL">
          <input
            className={inputCls}
            value={form.avatarUrl}
            onChange={(e) => set("avatarUrl", e.target.value)}
            placeholder="https://…"
          />
        </Field>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {saved && <p className="text-sm text-green-600">Saved.</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          className="self-start rounded bg-gray-800 px-4 py-2 text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </main>
  );
}

const inputCls =
  "w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none";

function Read({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-0.5">
      <span className="text-gray-400">{label}</span>
      <span className="text-gray-700">{value}</span>
    </div>
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
      <label className="mb-1 block text-sm text-gray-600">{label}</label>
      {children}
    </div>
  );
}
