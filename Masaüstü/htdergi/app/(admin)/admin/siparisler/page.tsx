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
        totalPrice: true, createdAt: true,
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
                <th>Müşteri</th>
                <th>Tutar</th>
                <th>Adet</th>
                <th>Sipariş Durumu</th>
                <th>Kargo</th>
                <th>Takip No</th>
                <th>Tarih</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <Link href={`/admin/kullanicilar/${o.user.id}`} style={{ fontWeight: 500 }}>
                      {o.user.firstName} {o.user.lastName}
                    </Link>
                    <div style={{ fontSize: 11, color: "var(--ad-muted)" }}>{o.user.email}</div>
                  </td>
                  <td style={{ fontWeight: 600, fontFamily: "var(--ad-serif)", fontSize: 15 }}>
                    ₺{Number(o.totalPrice).toLocaleString("tr-TR")}
                  </td>
                  <td style={{ color: "var(--ad-muted)" }}>{o.quantity}</td>
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
                  <td style={{ fontSize: 12, color: "var(--ad-muted)", whiteSpace: "nowrap" }}>
                    {new Date(o.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                  <td>
                    <Link href={`/admin/siparisler/${o.id}`} className="admin-filter-btn" style={{ whiteSpace: "nowrap" }}>
                      Detay →
                    </Link>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", color: "var(--ad-muted)", padding: "36px" }}>
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
