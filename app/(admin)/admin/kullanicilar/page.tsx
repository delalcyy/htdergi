import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata = { title: "Kullanıcılar | Admin" };

const PAGE_SIZE = 25;

const ROLES = [
  { key: "ALL",          label: "Tümü" },
  { key: "FREE",         label: "Ücretsiz" },
  { key: "SUBSCRIBER",   label: "Abonelikli" },
  { key: "SERIAL_USER",  label: "Seri" },
  { key: "COVER_BUYER",  label: "Kapak" },
];

const ROLE_CLASS: Record<string, string> = {
  FREE:        "role-badge role-free",
  SUBSCRIBER:  "role-badge role-subscriber",
  SERIAL_USER: "role-badge role-serial",
  COVER_BUYER: "role-badge role-cover",
  ADMIN:       "role-badge role-admin",
};
const ROLE_LABEL: Record<string, string> = {
  FREE: "Ücretsiz", SUBSCRIBER: "Abonelikli", SERIAL_USER: "Seri",
  COVER_BUYER: "Kapak", ADMIN: "Admin",
};

type Props = {
  searchParams: Promise<{ rol?: string; q?: string; sayfa?: string }>;
};

export default async function KullanicilarPage({ searchParams }: Props) {
  const params = await searchParams;
  const rol   = params.rol  || "ALL";
  const q     = params.q    || "";
  const sayfa = Math.max(1, parseInt(params.sayfa || "1"));
  const skip  = (sayfa - 1) * PAGE_SIZE;

  const where: Record<string, unknown> = { deletedAt: null };
  if (rol !== "ALL") where["role"] = rol;
  if (q) {
    where["OR"] = [
      { email:     { contains: q } },
      { firstName: { contains: q } },
      { lastName:  { contains: q } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
      select: {
        id: true, email: true, firstName: true, lastName: true,
        phone: true, age: true, city: true, district: true, supportedTeam: true,
        role: true, status: true, emailVerified: true, createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <div className="admin-page-head">
        <h1 className="admin-section-title" style={{ marginBottom: 0 }}>
          Kullanıcılar
        </h1>
      </div>

      <div className="admin-filters">
        {ROLES.map((r) => (
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
            placeholder="Ad, soyad veya e-posta ara…"
            className="admin-input"
            style={{ width: 240 }}
          />
        </form>
      </div>

      <div className="admin-card" style={{ padding: 0 }}>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ad Soyad</th>
                <th>E-posta</th>
                <th>Telefon</th>
                <th>Yaş</th>
                <th>İl / İlçe</th>
                <th>Takım</th>
                <th>Rol</th>
                <th>Kayıt</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 500, fontSize: 13 }}>
                    {u.firstName} {u.lastName}
                    {u.status !== "ACTIVE" && (
                      <div style={{ fontSize: 10, color: "#dc2626" }}>
                        {u.status === "SUSPENDED" ? "Askıda" : "Silindi"}
                      </div>
                    )}
                  </td>
                  <td style={{ color: "var(--ad-muted)", fontSize: 11 }}>{u.email}</td>
                  <td style={{ fontSize: 12 }}>{u.phone || "—"}</td>
                  <td style={{ fontSize: 12 }}>{u.age ?? "—"}</td>
                  <td style={{ fontSize: 12 }}>
                    {u.city ? <>{u.city}<br /><span style={{ fontSize: 10, color: "var(--ad-muted)" }}>{u.district}</span></> : "—"}
                  </td>
                  <td style={{ fontSize: 12 }}>{u.supportedTeam || "—"}</td>
                  <td>
                    <span className={ROLE_CLASS[u.role] || "role-badge role-free"}>
                      {ROLE_LABEL[u.role] || u.role}
                    </span>
                    {!u.emailVerified && (
                      <div style={{ fontSize: 10, color: "#d97706", marginTop: 2 }}>
                        E-posta doğrulanmadı
                      </div>
                    )}
                  </td>
                  <td style={{ fontSize: 11, color: "var(--ad-muted)", whiteSpace: "nowrap" }}>
                    {new Date(u.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                  <td>
                    <Link href={`/admin/kullanicilar/${u.id}`} className="admin-filter-btn" style={{ fontSize: 11, whiteSpace: "nowrap" }}>
                      Detay →
                    </Link>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", color: "var(--ad-muted)", padding: "36px" }}>
                    Kullanıcı bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="admin-pagination" style={{ padding: "16px 24px" }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/admin/kullanicilar?rol=${rol}&q=${q}&sayfa=${p}`}
                className={`admin-filter-btn ${p === sayfa ? "active" : ""}`}
                style={{ padding: "4px 10px", minWidth: 32, textAlign: "center" }}
              >
                {p}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div style={{ fontSize: 11, color: "var(--ad-muted)", marginTop: 8 }}>
        Toplam {total} kullanıcı
      </div>
    </div>
  );
}
