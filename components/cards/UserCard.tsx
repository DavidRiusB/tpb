import type { TableUser } from "@/types/table-detail";

export function UserCard({
  user,
  isDm = false,
}: {
  user: TableUser;
  isDm?: boolean;
}) {
  const badgeEntries = Object.entries(user.badges);

  return (
    <div className="flex items-start gap-3 rounded-lg border border-gray-300 bg-white p-3">
      {/* Avatar placeholder */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600">
        {(user.displayName ?? user.username).charAt(0).toUpperCase()}
      </div>

      <div className="min-w-0 flex-1">
        {/* Name + DM tag */}
        <div className="flex items-center gap-2">
          <span className="font-medium">
            {user.displayName ?? user.username}
          </span>
          {isDm && (
            <span className="rounded bg-gray-800 px-1.5 py-0.5 text-xs text-white">
              DM
            </span>
          )}
        </div>

        {/* Review count */}
        <p className="text-xs text-gray-500">
          {user.reviewCount === 0
            ? "No reviews yet"
            : `${user.reviewCount} ${user.reviewCount === 1 ? "review" : "reviews"}`}
        </p>

        {/* Badges — text pills for now, icons later */}
        {badgeEntries.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {badgeEntries.map(([badge, count]) => (
              <span
                key={badge}
                title={`${badge} ×${count}`}
                className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-700"
              >
                {badge} ×{count}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
