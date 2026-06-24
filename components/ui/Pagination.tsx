"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

type PaginationProps = {
  total: number;
  page: number;
  limit: number;
  /** URL param to write the page number to. Override when a page has
   *  more than one paginated list (e.g. "reviewPage", "msgPage"). */
  paramName?: string;
};

export function Pagination({
  total,
  page,
  limit,
  paramName = "page",
}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null; // nothing to paginate

  function goTo(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(paramName, String(p));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="mt-8 flex items-center justify-center gap-4 text-sm">
      <button
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        className="rounded border border-gray-300 px-3 py-1 disabled:opacity-40"
      >
        Previous
      </button>
      <span className="text-gray-600">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages}
        className="rounded border border-gray-300 px-3 py-1 disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}
