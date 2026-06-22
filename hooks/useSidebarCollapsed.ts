"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "sidebar-collapsed";

export function useSidebarCollapsed() {
  // start expanded on both server and first client render to avoid hydration mismatch
  const [collapsed, setCollapsed] = useState(false);

  // read the saved preference only after mount (localStorage doesn't exist on the server)
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) setCollapsed(saved === "true");
  }, []);

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  return { collapsed, toggle };
}
