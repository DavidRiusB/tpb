"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronsLeft,
  ChevronsRight,
  LayoutDashboard,
  Compass,
  PlusSquare,
  MessageSquare,
  Bell,
  Settings,
  Users,
  Flag,
  ArrowLeft,
  type LucideIcon,
} from "lucide-react";
import { useSidebarCollapsed } from "@/hooks/useSidebarCollapsed";
import clsx from "clsx";

// map string keys -> icon components, lives in the client component
const iconMap: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  compass: Compass,
  create: PlusSquare,
  messages: MessageSquare,
  bell: Bell,
  settings: Settings,
  users: Users,
  flag: Flag,
  back: ArrowLeft,
};

export type SidebarLink = {
  href: string;
  label: string;
  icon: keyof typeof iconMap; // a string, not a component
};

type SidebarProps = {
  links: SidebarLink[];
  brand?: string;
};

export default function Sidebar({
  links,
  brand = "Total Party Builder",
}: SidebarProps) {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebarCollapsed();

  return (
    <aside
      className={clsx(
        "h-screen flex flex-col border-r border-gray-300 bg-gray-100 transition-all duration-200",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div
        className={clsx(
          "py-6 border-b border-gray-300 flex items-center gap-3",
          collapsed ? "justify-center px-3" : "px-6",
        )}
      >
        {collapsed ? (
          <button
            onClick={toggle}
            aria-label="Expand sidebar"
            className="p-2 rounded hover:bg-gray-200 transition-colors"
          >
            <ChevronsRight size={18} />
          </button>
        ) : (
          <>
            <span className="text-base font-bold flex-1">{brand}</span>
            <button
              onClick={toggle}
              aria-label="Collapse sidebar"
              className="p-2 rounded hover:bg-gray-200 transition-colors"
            >
              <ChevronsLeft size={18} />
            </button>
          </>
        )}
      </div>

      <nav className="flex flex-col gap-1 px-3 py-4">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = iconMap[link.icon];

          return (
            <Link
              key={link.href}
              href={link.href}
              title={collapsed ? link.label : undefined}
              className={clsx(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                collapsed && "justify-center",
                isActive
                  ? "bg-gray-200 border-l-4 border-gray-600 font-medium"
                  : "text-gray-600 hover:bg-gray-200 hover:text-black",
              )}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
