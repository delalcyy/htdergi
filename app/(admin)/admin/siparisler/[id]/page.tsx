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
      user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true } },
      cargoTracking: true,
    },
  });

  if (!order) notFound();

  // Notes JSON'dan tasarım verisini çıkar
  type NotesData = {
    personName?:      string;
    categoryName?:    string;
    interviewDraftId?: string;
    coverBase64?:     string;
    photo1Base64?:    string;
    photo2Base64?:    string;
    submittedAt?:     string;
  };
  let nd: NotesData = {};
  try { if (order.notes) nd = JSON.parse(order.notes); } catch { /* */ }

  // Röportaj taslağını çek
  const interviewDraft = nd.interviewDraftId
    ? await prisma.interviewDraft.findUnique({
        where: { id: nd.interviewDraftId },
        include: {
          category: { include: { questions: { where: { isActive: true }, orderBy: { orderIndex: "asc" } } } },
          answers: true,
        },
      }).catch(() => null)
    : null;

  const answerMap = interviewDraft
    ? Object.fromEntries(interviewDraft.answers.map(a => [a.questionId, a.answerText]))
    : {};

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

          {/* ── Tasarım Verileri ── */}
          {(nd.coverBase64 || nd.photo1Base64 || nd.photo2Base64 || interviewDraft) && (
            <div className="admin-card">
              <div className="admin-card-title">Tasarım & Röportaj</div>

              {/* Kişi bilgisi */}
              {nd.personName && (
                <div style={{ marginBottom: 16, padding: "10px 12px", background: "#f9f7f4", borderRadius: 2 }}>
                  <span style={{ fontSize: 11, color: "var(--ad-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Kişi: </span>
                  <strong style={{ fontSize: 14 }}>{nd.personName}</strong>
                  {nd.categoryName && <span style={{ marginLeft: 12, fontSize: 12, color: "var(--ad-muted)" }}>{nd.categoryName}</span>}
                  {nd.submittedAt && (
                    <div style={{ fontSize: 11, color: "var(--ad-muted)", marginTop: 4 }}>
                      {new Date(nd.submittedAt).toLocaleString("tr-TR")}
                    </div>
                  )}
                </div>
              )}

              {/* Kapak PNG */}
              {nd.coverBase64 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ad-muted)", marginBottom: 8 }}>Kapak</div>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={nd.coverBase64} alt="Kapak" style={{ width: 80, height: 103, objectFit: "cover", border: "1px solid var(--ad-line)", borderRadius: 2 }} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <a href={nd.coverBase64} download={`kapak-${nd.personName ?? id}.png`}
                        className="admin-btn ghost" style={{ fontSize: 11 }}>
                        ↓ Kapak PNG İndir
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Yüklenen fotoğraflar */}
              {(nd.photo1Base64 || nd.photo2Base64) && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ad-muted)", marginBottom: 8 }}>Yüklenen Görseller</div>
                  <div style={{ display: "flex", gap: 10 }}>
                    {nd.photo1Base64 && (
                      <div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={nd.photo1Base64} alt="Görsel 1" style={{ width: 80, height: 80, objectFit: "cover", border: "1px solid var(--ad-line)", borderRadius: 2, display: "block" }} />
                        <a href={nd.photo1Base64} download={`gorsel1-${nd.personName ?? id}.jpg`}
                          style={{ fontSize: 10, color: "var(--ad-muted)", textDecoration: "none", display: "block", marginTop: 4, textAlign: "center" }}>↓ İndir</a>
                      </div>
                    )}
                    {nd.photo2Base64 && (
                      <div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={nd.photo2Base64} alt="Görsel 2" style={{ width: 80, height: 80, objectFit: "cover", border: "1px solid var(--ad-line)", borderRadius: 2, display: "block" }} />
                        <a href={nd.photo2Base64} download={`gorsel2-${nd.personName ?? id}.jpg`}
                          style={{ fontSize: 10, color: "var(--ad-muted)", textDecoration: "none", display: "block", marginTop: 4, textAlign: "center" }}>↓ İndir</a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Röportaj soruları */}
              {interviewDraft && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ad-muted)" }}>
                      Röportaj — {interviewDraft.category.name}
                    </div>
                    <Link href={`/admin/roportajlar/${interviewDraft.id}`} className="admin-btn ghost" style={{ fontSize: 10 }}>
                      Detay / Yazdır →
                    </Link>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {interviewDraft.category.questions.map((q, idx) => {
                      const cevap = answerMap[q.id];
                      return (
                        <div key={q.id} style={{ paddingBottom: 10, borderBottom: "1px solid var(--ad-line)" }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: "#a98947", marginBottom: 3 }}>
                            {String(idx + 1).padStart(2, "0")}. {q.body}
                          </div>
                          <div style={{ fontSize: 13, color: cevap ? "var(--ad-ink)" : "var(--ad-muted)", fontStyle: cevap ? "normal" : "italic" }}>
                            {cevap || "Cevaplanmadı"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
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
