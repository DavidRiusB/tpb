// components/cards/HistoryRow.tsx
import { Avatar } from "@/components/ui/Avatar";

export function HistoryRow({ name, status }: { name: string; status: string }) {
  return (
    <div className="flex items-center gap-2 rounded border border-gray-200 bg-gray-50 p-2">
      <Avatar name={name} />
      <span className="text-sm text-gray-600">{name}</span>
      <span className="ml-auto rounded bg-gray-200 px-1.5 py-0.5 text-xs text-gray-500">
        {status}
      </span>
    </div>
  );
}
