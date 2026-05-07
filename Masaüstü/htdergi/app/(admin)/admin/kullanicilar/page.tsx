import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata = { title: "Kullanıcılar | Admin" };

type Props = {
  searchParams: Promise<{ rol?: string; q?: string; sayfa?: string }>;
};

const PAGE_SIZE = 25;

export default async function KullanicilarPage({ searchParams }: Props) {
  const params = await searchParams;
  const rol = params.rol || "ALL";
  const q = params.q || "";
  const sayfa = parseInt(params.sayfa || "1", 10);
  const skip = (sayfa - 1) * PAGE_SIZE;

  const where = {
    deletedAt: null as null | Date,
    ...(rol !== "ALL" ? { role: rol as "FREE" | "SUBSCRIBER" | "SERIAL_USER" | "COVER_BUYER" } : {}),
    ...(q
      ? {
          OR: [
            { email:     { contains: q } },
            { firstName: { contains: q } },
            { lastName:  { contains: q } },
          ],
        }
      : {}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const roles = [
    { key: "ALL", label: "Tümü" },
    { key: "FREE", label: "Ücretsiz" },
    { key: "SUBSCRIBER", label: "Abonelikli" },
    { key: "SERIAL_USER", label: "Seri Numaralı" },
    { key: "COVER_BUYER", label: "Kapak" },
  ];

  const roleClasses: Record<string, string> = {
    FREE: "role-badge role-free",
    SUBSCRIBER: "role-badge role-subscriber",
    SERIAL_USER: "role-badge role-serial",
    COVER_BUYER: "role-badge role-cover",
    ADMIN: "role-badge role-admin",
  };

  return (
    <div>
      <h1 className="admin-section-title">Kullanıcılar</h1>

      {/* Filtreler */}
      <div className="admin-filters">
        {roles.map((r) => (
          <Link
            key={r.key}
            href={`/admin/kullanicilar?rol=${r.key}${q ? `&q=${q}` : ""}`}
            className={`admin-filter-btn ${rol === r.key ? "active" : ""}`}
          >
            {r.label}
          </Link>
        ))}
        <form method="GET" action="/admin/kullanicilar" style={{ marginLeft: "auto" }}>
          <input type="hidden" name="rol" value={rol} />
          <input
            name="q"
            defaultValue={q}
            placeholder="Ad, soyad veya e-posta ara..."
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "0.375rem 0.75rem",
              fontSize: "0.8125rem",
              outline: "none",
              width: "240px",
            }}
          />
        </form>
      </div>

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ad Soyad</th>
                <th>E-posta</th>
                <th>Rol</th>
                <th>Durum</th>
                <th>Kayıt Tarihi</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.firstName} {u.lastName}</td>
                  <td style={{ color: "#64748b" }}>{u.email}</td>
                  <td><span className={roleClasses[u.role] || "role-badge"}>{u.role}</span></td>
                  <td>
                    <span className={u.status === "ACTIVE" ? "badge-active" : "badge-expired"}>
                      {u.status === "ACTIVE" ? "Aktif" : u.status === "SUSPENDED" ? "Askıda" : "Silindi"}
                    </span>
                  </td>
                  <td style={{ color: "#94a3b8", fontSize: "0.8125rem" }}>
                    {new Date(u.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                  <td>
                    <Link href={`/admin/kullanicilar/${u.id}`}>Detay</Link>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "#94a3b8", padding: "2rem" }}>
                    Kullanıcı bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Sayfalama */}
        {totalPages > 1 && (
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "1rem", flexWrap: "wrap" }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/admin/kullanicilar?rol=${rol}&q=${q}&sayfa=${p}`}
                className={`admin-filter-btn ${p === sayfa ? "active" : ""}`}
                style={{ padding: "0.25rem 0.625rem", minWidth: "32px", textAlign: "center" }}
              >
                {p}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>
        Toplam: {total} kullanıcı
      </div>
    </div>
  );
}
