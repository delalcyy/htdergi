import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "#f9fafb",
        fontFamily: "inherit",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: "420px" }}>
        <div style={{ fontSize: "4rem", fontWeight: 800, color: "#1a1a1a", lineHeight: 1 }}>
          404
        </div>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#374151", margin: "1rem 0 0.5rem" }}>
          Sayfa Bulunamadı
        </h1>
        <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "2rem", lineHeight: 1.6 }}>
          Aradığınız sayfa taşınmış, silinmiş ya da hiç oluşturulmamış olabilir.
        </p>
        <Link
          href="/"
          style={{
            display: "inline-block",
            padding: "0.625rem 1.5rem",
            background: "#1a1a1a",
            color: "white",
            borderRadius: "8px",
            textDecoration: "none",
            fontSize: "0.875rem",
            fontWeight: 500,
          }}
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}
