import Link from "next/link";
import "@/styles/kapak.css";

export default function KapakLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "white", borderBottom: "1px solid #e5e7eb",
        height: "56px", padding: "0 1.5rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/" style={{ fontWeight: 700, fontSize: "1rem", color: "#1a1a1a", textDecoration: "none" }}>
          Hatıra Dergi
        </Link>
        <Link href="/" style={{ fontSize: "0.8125rem", color: "#6b7280", textDecoration: "none" }}>
          ← Ana Sayfa
        </Link>
      </header>
      <main>{children}</main>
    </div>
  );
}
