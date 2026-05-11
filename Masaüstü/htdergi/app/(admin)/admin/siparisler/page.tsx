import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata = { title: "Siparişler | Admin" };

const PAGE_SIZE = 25;

const STATUS_OPTS = [
  { key: "ALL",           label: "Tümü" },
  { key: "PENDING",       label: "Beklemede" },
  { key: "CONFIRMED",     label: "Onaylandı" },
  { key: "IN_PRODUCTION", label: "Üretimde" },
  { key: "SHIPPED",       label: "Kargoda" },
  { key: "DELIVERED",     label: "Teslim" },
  { key: "CANCELLED",     label: "İptal" },
];

const STATUS_CLASS: Record<string, string> = {
  PENDING:       "ad-badge order-pending",
  CONFIRMED:     "ad-badge order-confirmed",
  IN_PRODUCTION: "ad-badge order-in-production",
  SHIPPED:       "ad-badge order-shipped",
  DELIVERED:     "ad-badge order-delivered",
  CANCELLED:     "ad-badge order-cancelled",
  REFUNDED:      "ad-badge order-refunded",
};
const STATUS_LABEL: Record<string, string> = {
  PENDING: "Beklemede", CONFIRMED: "Onaylandı", IN_PRODUCTION: "Üretimde",
  SHIPPED: "Kargoda", DELIVERED: "Teslim", CANCELLED: "İptal", REFUNDED: "İade",
};
const CARGO_LABEL: Record<string, string> = {
  PENDING: "Hazırlanıyor", PICKED_UP: "Alındı", IN_TRANSIT: "Yolda",
  DELIVERED: "Teslim", FAILED: "Başarısız", RETURNED: "İade",
};

type Props = {
  searchParams: Promise<{ durum?: string; q?: string; sayfa?: string }>;
};

export default async function SiparislerPage({ searchParams }: Props) {
  const params = await searchParams;
  const durum  = params.durum || "ALL";
  const q      = params.q || "";
  const sayfa  = Math.max(1, parseInt(params.sayfa || "1"));
  const skip   = (sayfa - 1) * PAGE_SIZE;

  const where: Record<string, unknown> = {};
  if (durum !== "ALL") where["status"] = durum;
  if (q) {
    where["user"] = {
      OR: [
        { email:     { contains: q } },
        { firstName: { contains: q } },
        { lastName:  { contains: q } },
      ],
    };
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
      select: {
        id: true, status: true, quantity: true,
        totalPrice: true, createdAt: true, notes: true,
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        cargoTracking: { select: { status: true, trackingNumber: true, carrier: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <div className="admin-page-head">
        <h1 className="admin-section-title" style={{ marginBottom: 0 }}>
          Siparişler
        </h1>
      </div>

      {/* Filtreler */}
      <div className="admin-filters">
        {STATUS_OPTS.map((s) => (
          <Link
            key={s.key}
            href={`/admin/siparisler?durum=${s.key}${q ? `&q=${q}` : ""}`}
            className={`admin-filter-btn ${durum === s.key ? "active" : ""}`}
          >
            {s.label}
          </Link>
        ))}
        <form method="GET" action="/admin/siparisler" style={{ marginLeft: "auto" }}>
          <input type="hidden" name="durum" value={durum} />
          <input
            name="q"
            defaultValue={q}
            placeholder="İsim veya e-posta ara…"
            className="admin-input"
            style={{ width: 220 }}
          />
        </form>
      </div>

      <div className="admin-card" style={{ padding: 0 }}>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Kapak</th>
                <th>Kişi</th>
                <th>Kategori</th>
                <th>Durum</th>
                <th>Kargo</th>
                <th>Takip No</th>
                <th>Tarih / Saat</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                let notesData: { personName?: string; categoryName?: string; coverBase64?: string; interviewDraftId?: string; photo1Base64?: string; photo2Base64?: string } = {};
                try { if (o.notes) notesData = JSON.parse(o.notes); } catch { /* */ }
                const personName = notesData.personName || `${o.user.firstName ?? ""} ${o.user.lastName ?? ""}`.trim();
                return (
                <tr key={o.id}>
                  <td style={{ width: 52 }}>
                    {notesData.coverBase64 ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={notesData.coverBase64} alt="kapak"
                        style={{ width: 36, height: 46, objectFit: "cover", border: "1px solid #e5e7eb", borderRadius: 2 }} />
                    ) : (
                      <div style={{ width: 36, height: 46, background: "#f3f2ee", border: "1px solid #e5e7eb", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#aaa" }}>—</div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{personName || "—"}</div>
                    <div style={{ fontSize: 11, color: "var(--ad-muted)" }}>{o.user.email}</div>
                  </td>
                  <td style={{ fontSize: 12 }}>{notesData.categoryName || "—"}</td>
                  <td>
                    <span className={STATUS_CLASS[o.status] || "ad-badge"}>
                      {STATUS_LABEL[o.status] || o.status}
                    </span>
                  </td>
                  <td>
                    {o.cargoTracking ? (
                      <span style={{ fontSize: 11, color: "var(--ad-muted)" }}>
                        {CARGO_LABEL[o.cargoTracking.status] || o.cargoTracking.status}
                        {o.cargoTracking.carrier && ` · ${o.cargoTracking.carrier}`}
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, color: "var(--ad-line)" }}>—</span>
                    )}
                  </td>
                  <td style={{ fontSize: 12, color: "var(--ad-muted)", fontFamily: "monospace" }}>
                    {o.cargoTracking?.trackingNumber || "—"}
                  </td>
                  <td style={{ fontSize: 11, color: "var(--ad-muted)", whiteSpace: "nowrap" }}>
                    {new Date(o.createdAt).toLocaleDateString("tr-TR")}<br />
                    <span style={{ fontSize: 10 }}>{new Date(o.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</span>
                  </td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5, alignItems: "flex-start" }}>
                      {notesData.coverBase64 && (
                        <a href={`/api/admin/siparis/${o.id}/kapak-yazdir`} target="_blank"
                          className="admin-btn ghost" style={{ fontSize: 10, padding: "3px 8px", whiteSpace: "nowrap" }}>
                          🖨 Kapak PDF
                        </a>
                      )}
                      {notesData.interviewDraftId && (
                        <a href={`/api/admin/roportaj/${notesData.interviewDraftId}/yazdir`} target="_blank"
                          className="admin-btn ghost" style={{ fontSize: 10, padding: "3px 8px", whiteSpace: "nowrap" }}>
                          🖨 Röportaj PDF
                        </a>
                      )}
                      <Link href={`/admin/siparisler/${o.id}`} className="admin-filter-btn" style={{ fontSize: 10, padding: "3px 8px", whiteSpace: "nowrap" }}>
                        Detay →
                      </Link>
                    </div>
                  </td>
                </tr>
              );})}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", color: "var(--ad-muted)", padding: "36px" }}>
                    Sipariş bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Sayfalama */}
        {totalPages > 1 && (
          <div className="admin-pagination" style={{ padding: "16px 24px" }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/admin/siparisler?durum=${durum}&q=${q}&sayfa=${p}`}
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
        Toplam {total} sipariş
      </div>
    </div>
  );
}
