import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Siparişlerim | Hatıra Dergi" };

const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING:       "Beklemede",
  CONFIRMED:     "Onaylandı",
  IN_PRODUCTION: "Üretimde",
  SHIPPED:       "Kargoda",
  DELIVERED:     "Teslim Edildi",
  CANCELLED:     "İptal Edildi",
  REFUNDED:      "İade Edildi",
};

const ORDER_STATUS_COLOR: Record<string, string> = {
  PENDING:       "#d97706",
  CONFIRMED:     "#2563eb",
  IN_PRODUCTION: "#7c3aed",
  SHIPPED:       "#0891b2",
  DELIVERED:     "#16a34a",
  CANCELLED:     "#dc2626",
  REFUNDED:      "#6b7280",
};

const CARGO_STATUS_LABEL: Record<string, string> = {
  PENDING:    "Hazırlanıyor",
  PICKED_UP:  "Kargoya Verildi",
  IN_TRANSIT: "Yolda",
  DELIVERED:  "Teslim Edildi",
  FAILED:     "Teslim Başarısız",
  RETURNED:   "İade Edildi",
};

export default async function SiparislerimPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { cargoTracking: true },
  });

  return (
    <div>
      <h1 className="panel-section-title">Siparişlerim</h1>

      {orders.length === 0 ? (
        <div className="panel-card">
          <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>Henüz siparişiniz bulunmuyor.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {orders.map((order) => {
            let personName = "";
            try {
              if (order.notes) {
                const nd = JSON.parse(order.notes) as { personName?: string };
                personName = nd.personName || "";
              }
            } catch { /* */ }

            const cargo = order.cargoTracking;

            return (
              <div key={order.id} className="panel-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  <div>
                    <div style={{ fontWeight: 600, color: "#1a1a1a", fontSize: "0.9375rem" }}>
                      {personName || "Hatıra Dergi Siparişi"}
                    </div>
                    <div style={{ fontSize: "0.8125rem", color: "#6b7280", marginTop: "0.25rem" }}>
                      {new Date(order.createdAt).toLocaleDateString("tr-TR")} · ₺{Number(order.totalPrice).toLocaleString("tr-TR")}
                    </div>
                  </div>
                  <span style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    padding: "3px 10px",
                    borderRadius: "4px",
                    background: `${ORDER_STATUS_COLOR[order.status] || "#6b7280"}18`,
                    color: ORDER_STATUS_COLOR[order.status] || "#6b7280",
                  }}>
                    {ORDER_STATUS_LABEL[order.status] || order.status}
                  </span>
                </div>

                {cargo && (
                  <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "0.625rem", marginTop: "0.25rem", fontSize: "0.8125rem", color: "#374151" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                      <span>
                        <span style={{ color: "#9ca3af" }}>Kargo: </span>
                        {CARGO_STATUS_LABEL[cargo.status] || cargo.status}
                      </span>
                      {cargo.carrier && (
                        <span>
                          <span style={{ color: "#9ca3af" }}>Firma: </span>
                          {cargo.carrier}
                        </span>
                      )}
                      {cargo.trackingNumber && (
                        <span>
                          <span style={{ color: "#9ca3af" }}>Takip No: </span>
                          <span style={{ fontFamily: "monospace", fontWeight: 600 }}>{cargo.trackingNumber}</span>
                        </span>
                      )}
                      {cargo.estimatedDate && (
                        <span>
                          <span style={{ color: "#9ca3af" }}>Tahmini Teslim: </span>
                          {new Date(cargo.estimatedDate).toLocaleDateString("tr-TR")}
                        </span>
                      )}
                    </div>
                    {cargo.currentLocation && (
                      <div style={{ marginTop: "0.375rem", color: "#6b7280" }}>
                        Güncel Konum: {cargo.currentLocation}
                      </div>
                    )}
                  </div>
                )}

                {!cargo && (order.status === "PENDING" || order.status === "CONFIRMED" || order.status === "IN_PRODUCTION") && (
                  <div style={{ fontSize: "0.8125rem", color: "#9ca3af", borderTop: "1px solid #f1f5f9", paddingTop: "0.625rem", marginTop: "0.25rem" }}>
                    Kargo bilgisi siparişiniz hazırlandıktan sonra güncellenecektir.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
