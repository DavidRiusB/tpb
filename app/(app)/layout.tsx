import Sidebar, { type SidebarLink } from "@/components/layout/Sidebar";

const appLinks: SidebarLink[] = [
  { href: "/me", label: "Dashboard", icon: "dashboard" },
  { href: "/tables", label: "Browse Tables", icon: "compass" },
  { href: "/tables/new", label: "Create Table", icon: "create" },
  { href: "/conversations", label: "Messages", icon: "messages" },
  { href: "/notifications", label: "Notifications", icon: "bell" },
  { href: "/me/settings", label: "Settings", icon: "settings" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar links={appLinks} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
