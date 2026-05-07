import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import KargoGuncelle from "@/components/admin/KargoGuncelle";

export const metadata = { title: "Sipariş Detayı | Admin" };

type Props = { params: Promise<{ id: string }> };

const STATUS_CLASS: Record<string, string> = {
  PENDING: "ad-badge order-pending", CONFIRMED: "ad-badge order-confirmed",
  IN_PRODUCTION: "ad-badge order-in-production", SHIPPED: "ad-badge order-shipped",
  DELIVERED: "ad-badge order-delivered", CANCELLED: "ad-badge order-cancelled",
  REFUNDED: "ad-badge order-refunded",
};
const STATUS_LABEL: Record<string, string> = {
  PENDING: "Beklemede", CONFIRMED: "Onaylandı", IN_PRODUCTION: "Üretimde",
  SHIPPED: "Kargoda", DELIVERED: "Teslim Edildi", CANCELLED: "İptal Edildi",
  REFUNDED: "İade Edildi",
};
const CARGO_LABEL: Record<string, string> = {
  PENDING: "Hazırlanıyor", PICKED_UP: "Kargoya Verildi", IN_TRANSIT: "Yolda",
  DELIVERED: "Teslim Edildi", FAILED: "Teslim Başarısız", RETURNED: "İade Edildi",
};

export default async function SiparisDetayPage({ params }: Props) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true, email: true, firstName: true, lastName: true,
          phone: true, role: true,
        },
      },
      cargoTracking: true,
    },
  });

  if (!order) notFound();

  const infoRows = [
    { key: "Sipariş ID",   val: order.id },
    { key: "Oluşturma",    val: new Date(order.createdAt).toLocaleString("tr-TR") },
    { key: "Güncelleme",   val: new Date(order.updatedAt).toLocaleString("tr-TR") },
    { key: "Adet",         val: String(order.quantity) },
    { key: "Birim Fiyat",  val: `₺${Number(order.unitPrice).toLocaleString("tr-TR")}` },
    { key: "Toplam",       val: `₺${Number(order.totalPrice).toLocaleString("tr-TR")}` },
    { key: "Ödeme ID",     val: order.paymentId || "—" },
  ];

  const cargoRows = order.cargoTracking ? [
    { key: "Kargo Firması",    val: order.cargoTracking.carrier          || "—" },
    { key: "Takip No",         val: order.cargoTracking.trackingNumber   || "—" },
    { key: "Kargo Durumu",     val: CARGO_LABEL[order.cargoTracking.status] || order.cargoTracking.status },
    { key: "Güncel Konum",     val: order.cargoTracking.currentLocation  || "—" },
    { key: "Tahmini Teslim",   val: order.cargoTracking.estimatedDate
        ? new Date(order.cargoTracking.estimatedDate).toLocaleDateString("tr-TR") : "—" },
    { key: "Kargoya Verildi",  val: order.cargoTracking.shippedAt
        ? new Date(order.cargoTracking.shippedAt).toLocaleDateString("tr-TR")    : "—" },
    { key: "Teslim Tarihi",    val: order.cargoTracking.deliveredAt
        ? new Date(order.cargoTracking.deliveredAt).toLocaleDateString("tr-TR")  : "—" },
  ] : null;

  return (
    <div>
      {/* Başlık */}
      <div className="admin-page-head">
        <div>
          <Link href="/admin/siparisler"
            style={{ fontSize: 11, color: "var(--ad-muted)", letterSpacing: "0.1em",
              textTransform: "uppercase", textDecoration: "none", marginBottom: 8, display: "block" }}>
            ← Siparişler
          </Link>
          <h1 className="admin-section-title" style={{ marginBottom: 6 }}>
            Sipariş Detayı
          </h1>
          <span className={STATUS_CLASS[order.status] || "ad-badge"}>
            {STATUS_LABEL[order.status] || order.status}
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 16, alignItems: "start" }}>
        {/* Sol: bilgiler */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Müşteri */}
          <div className="admin-card">
            <div className="admin-card-title">Müşteri</div>
            <div className="admin-mini-list">
              <div className="admin-mini-item">
                <span className="admin-mini-label">Ad Soyad</span>
                <Link href={`/admin/kullanicilar/${order.user.id}`} style={{ fontWeight: 600 }}>
                  {order.user.firstName} {order.user.lastName}
                </Link>
              </div>
              <div className="admin-mini-item">
                <span className="admin-mini-label">E-posta</span>
                <span style={{ fontSize: 13 }}>{order.user.email}</span>
              </div>
              {order.user.phone && (
                <div className="admin-mini-item">
                  <span className="admin-mini-label">Telefon</span>
                  <span style={{ fontSize: 13 }}>{order.user.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Teslimat Adresi */}
          <div className="admin-card">
            <div className="admin-card-title">Teslimat Adresi</div>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--ad-ink)", whiteSpace: "pre-line" }}>
              {order.shippingAddress}
            </p>
          </div>

          {/* Sipariş Bilgileri */}
          <div className="admin-card">
            <div className="admin-card-title">Sipariş Bilgileri</div>
            <div className="admin-mini-list">
              {infoRows.map((r) => (
                <div key={r.key} className="admin-mini-item">
                  <span className="admin-mini-label">{r.key}</span>
                  <span style={{ fontSize: 13, fontFamily: r.key === "Sipariş ID" || r.key === "Ödeme ID" ? "monospace" : undefined }}>
                    {r.val}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Mevcut kargo bilgileri */}
          {cargoRows && (
            <div className="admin-card">
              <div className="admin-card-title">Kargo Bilgileri</div>
              <div className="admin-mini-list">
                {cargoRows.map((r) => (
                  <div key={r.key} className="admin-mini-item">
                    <span className="admin-mini-label">{r.key}</span>
                    <span style={{ fontSize: 13 }}>{r.val}</span>
                  </div>
                ))}
              </div>
              {order.cargoTracking?.notes && (
                <div style={{ marginTop: 12, padding: "10px 0", borderTop: "1px solid var(--ad-line)",
                  fontSize: 13, color: "var(--ad-muted)", lineHeight: 1.6 }}>
                  {order.cargoTracking.notes}
                </div>
              )}
            </div>
          )}

          {/* Notlar */}
          {order.notes && (
            <div className="admin-card">
              <div className="admin-card-title">Sipariş Notu</div>
              <p style={{ fontSize: 14, color: "var(--ad-muted)", lineHeight: 1.7 }}>{order.notes}</p>
            </div>
          )}
        </div>

        {/* Sağ: güncelleme formu */}
        <div className="admin-card" style={{ position: "sticky", top: 20 }}>
          <div className="admin-card-title">Durum & Kargo Güncelle</div>
          <KargoGuncelle
            orderId={order.id}
            current={order.cargoTracking || undefined}
            orderStatus={order.status}
          />
        </div>
      </div>
    </div>
  );
}
