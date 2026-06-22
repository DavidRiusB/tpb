import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <nav
        style={{
          display: "flex",
          gap: 12,
          padding: 12,
          borderBottom: "1px solid #ccc",
        }}
      >
        <Link href="/tables">Browse Tables</Link>
        <Link href="/login">Login</Link>
        <Link href="/register">Register</Link>
        <span style={{ marginLeft: "auto", opacity: 0.5 }}>[public]</span>
      </nav>
      <div>{children}</div>
    </div>
  );
}
