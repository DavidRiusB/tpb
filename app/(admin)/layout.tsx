import Sidebar, { type SidebarLink } from "@/components/layout/Sidebar";

const adminLinks: SidebarLink[] = [
  { href: "/admin/users", label: "User Search", icon: "users" },
  { href: "/admin/reviews", label: "Review Moderation", icon: "flag" },
  { href: "/me", label: "Back to App", icon: "back" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar links={adminLinks} brand="TPB Admin" />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
