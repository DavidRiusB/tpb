export function Avatar({ name }: { name: string }) {
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
