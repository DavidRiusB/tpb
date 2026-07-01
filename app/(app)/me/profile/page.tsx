"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import type { User } from "@/types/user";
import type { PlayerReview } from "@/types/player-detail";
import { ReviewSections } from "@/components/reviews/ReviewSections";

export default function ProfilePage() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();

  const [user, setUser] = useState<User | null>(null);
  const [reviews, setReviews] = useState<PlayerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [form, setForm] = useState({
    displayName: "",
    notificationEmail: "",
    bio: "",
    preferredSystems: "",
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
        const [me, myReviews] = await Promise.all([
          api<User>("/users/me"),
          api<PlayerReview[]>("/reviews/me"),
        ]);
        if (!active) return;
        setUser(me);
        setReviews(myReviews);
        resetForm(me);
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

  function resetForm(u: User) {
    setForm({
      displayName: u.displayName ?? "",
      notificationEmail: u.notificationEmail ?? "",
      bio: u.bio ?? "",
      preferredSystems: u.preferredSystems.join(", "),
      playStyleTags: u.playStyleTags.join(", "),
      timezone: u.timezone ?? "",
      location: u.location ?? "",
      avatarUrl: u.avatarUrl ?? "",
    });
  }

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function startEdit() {
    if (user) resetForm(user);
    setSaveError(null);
    setEditing(true);
  }

  function cancelEdit() {
    if (user) resetForm(user);
    setSaveError(null);
    setEditing(false);
  }

  const splitCsv = (s: string) =>
    s
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

  async function handleSave() {
    setSaveError(null);
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
      setEditing(false);
    } catch (err) {
      setSaveError(
        err instanceof ApiError ? err.message : "Couldn't save changes.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || loading)
    return <main className="p-8 text-gray-500">Loading…</main>;
  if (error || !user) {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <p className="text-gray-600">{error ?? "Not found."}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="mb-6 text-2xl font-bold">My profile</h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <aside className="md:col-span-1 rounded-lg border border-gray-300 bg-white p-5">
          {/* LEFT — identity card */}
          {/* avatar */}
          <div className="mb-4 flex flex-col items-center">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt=""
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 text-3xl font-medium text-gray-600">
                {(user.displayName ?? user.username).charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {editing ? (
            /* EDIT MODE */
            <div className="flex flex-col gap-3">
              <Field label="Display name">
                <input
                  className={inputCls}
                  value={form.displayName}
                  onChange={(e) => set("displayName", e.target.value)}
                  maxLength={100}
                />
              </Field>
              <Field label="Email">
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
              <Field label="Systems (comma-separated)">
                <input
                  className={inputCls}
                  value={form.preferredSystems}
                  onChange={(e) => set("preferredSystems", e.target.value)}
                  placeholder="D&D 5e, Pathfinder 2e"
                />
              </Field>
              <Field label="Play style (comma-separated)">
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

              {saveError && <p className="text-sm text-red-600">{saveError}</p>}

              <div className="mt-2 flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
                <button
                  onClick={cancelEdit}
                  disabled={saving}
                  className="rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* VIEW MODE */
            <div>
              <div className="mb-3 text-center">
                <h2 className="text-xl font-bold">
                  {user.displayName ?? user.username}
                </h2>
                <p className="text-sm text-gray-500">@{user.username}</p>
              </div>

              {user.bio && (
                <p className="mb-4 text-sm text-gray-700">{user.bio}</p>
              )}

              {user.preferredSystems.length > 0 && (
                <TagRow label="Systems" tags={user.preferredSystems} />
              )}
              {user.playStyleTags.length > 0 && (
                <TagRow label="Play style" tags={user.playStyleTags} />
              )}

              <dl className="mt-4 space-y-1 border-t border-gray-100 pt-4 text-sm">
                <ReadRow label="Email" value={user.notificationEmail} />
                {user.timezone && (
                  <ReadRow label="Timezone" value={user.timezone} />
                )}
                {user.location && (
                  <ReadRow label="Location" value={user.location} />
                )}
                <ReadRow label="Role" value={user.role} />
                {user.birthDate && (
                  <ReadRow
                    label="Birth date"
                    value={new Date(user.birthDate).toLocaleDateString()}
                  />
                )}
                <ReadRow
                  label="Member since"
                  value={new Date(user.createdAt).toLocaleDateString()}
                />
              </dl>

              <button
                onClick={startEdit}
                className="mt-4 w-full rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
              >
                Edit profile
              </button>
            </div>
          )}
        </aside>

        {/* RIGHT — reviews */}
        <section>
          <h2 className="md:col-span-2">Reviews about me</h2>
          <ReviewSections reviews={reviews} />
        </section>
      </div>
    </main>
  );
}

const inputCls =
  "w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-gray-500">{label}</label>
      {children}
    </div>
  );
}

function TagRow({ label, tags }: { label: string; tags: string[] }) {
  return (
    <div className="mb-2 flex flex-wrap items-center gap-1 text-sm">
      <span className="text-gray-400">{label}:</span>
      {tags.map((t) => (
        <span key={t} className="rounded bg-gray-100 px-2 py-0.5 text-xs">
          {t}
        </span>
      ))}
    </div>
  );
}

function ReadRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-gray-400">{label}</dt>
      <dd className="text-right text-gray-700">{value}</dd>
    </div>
  );
}
