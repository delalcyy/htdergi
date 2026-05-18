import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mesafeli Satış Sözleşmesi | Hatıra Dergi",
  description: "Hatıra Dergi mesafeli satış sözleşmesi — 6502 sayılı Tüketicinin Korunması Hakkında Kanun kapsamında hazırlanmıştır.",
};

const S = {
  page: { maxWidth: "760px", margin: "0 auto", padding: "4rem 1.5rem 6rem" } as React.CSSProperties,
  eyebrow: { fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "#b08d3c", marginBottom: "0.75rem", display: "block" },
  h1: { fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 700, color: "#111", lineHeight: 1.15, marginBottom: "0.5rem" },
  date: { fontSize: "0.8rem", color: "#999", marginBottom: "2.5rem", display: "block", borderBottom: "1px solid #ece8e1", paddingBottom: "1.5rem" },
  h2: { fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.125rem", fontWeight: 700, color: "#111", margin: "2.25rem 0 0.75rem" },
  p: { fontSize: "0.9rem", color: "#444", lineHeight: 1.8, margin: "0 0 0.75rem" },
  ul: { paddingLeft: "1.25rem", margin: "0 0 0.75rem" } as React.CSSProperties,
  li: { fontSize: "0.9rem", color: "#444", lineHeight: 1.8, marginBottom: "0.3rem" },
  row: { display: "grid", gridTemplateColumns: "160px 1fr", gap: "0.25rem 1rem", fontSize: "0.875rem", color: "#444", lineHeight: 1.7, marginBottom: "0.5rem" } as React.CSSProperties,
  label: { fontWeight: 600, color: "#111" },
};

export default function MesafeliSatisSozlesmesiPage() {
  return (
    <div style={S.page}>
      <span style={S.eyebrow}>Yasal Bilgiler</span>
      <h1 style={S.h1}>Mesafeli Satış Sözleşmesi</h1>
      <span style={S.date}>Son güncelleme: Mayıs 2026</span>

      <p style={S.p}>
        İşbu Mesafeli Satış Sözleşmesi (&quot;Sözleşme&quot;), 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği kapsamında, <strong>Hatıra Dergi</strong> (&quot;Satıcı&quot;) ile ürün veya hizmet satın alan kullanıcı (&quot;Alıcı&quot;) arasında kurulmaktadır.
      </p>

      <h2 style={S.h2}>Madde 1 — Taraflar</h2>
      <div>
        <div style={S.row}><span style={S.label}>Satıcı Unvanı:</span><span>Hatıra Dergi</span></div>
        <div style={S.row}><span style={S.label}>E-posta:</span><span>info@hatiradergi.com</span></div>
        <div style={S.row}><span style={S.label}>Web Sitesi:</span><span>hatiradergi.com</span></div>
        <div style={S.row}><span style={S.label}>Alıcı:</span><span>Sisteme kayıtlı kullanıcı (ad, soyad ve iletişim bilgileri hesapta kayıtlıdır)</span></div>
      </div>

      <h2 style={S.h2}>Madde 2 — Sözleşme Konusu</h2>
      <p style={S.p}>
        İşbu sözleşme, Alıcı&apos;nın Hatıra Dergi platformu aracılığıyla satın aldığı <strong>kişiye özel dijital dergi kapağı ve röportaj içeriği hizmetine</strong> ilişkin tarafların hak ve yükümlülüklerini belirler.
      </p>
      <p style={S.p}>
        Sunulan ürün; kullanıcının kendi fotoğrafı, bilgileri ve tercihleriyle oluşturduğu kişiye özel bir dergi kapağı tasarımı ve röportaj içeriğinden oluşmakta olup <strong>PDF formatında dijital olarak</strong> teslim edilmektedir.
      </p>

      <h2 style={S.h2}>Madde 3 — Sipariş ve Ödeme</h2>
      <ul style={S.ul}>
        <li style={S.li}>Alıcı, platform üzerinde kapak tasarımını ve röportajını tamamladıktan sonra ödeme adımına geçer.</li>
        <li style={S.li}>Sipariş, ödeme onayından sonra sisteme iletilir ve hazırlık süreci başlar.</li>
        <li style={S.li}>Tüm ödeme işlemleri <strong>iyzico</strong> ödeme altyapısı üzerinden SSL şifreli bağlantıyla gerçekleştirilir.</li>
        <li style={S.li}>Kart bilgileri Hatıra Dergi sistemlerinde saklanmaz.</li>
        <li style={S.li}>Ödeme onaylandığında Alıcı&apos;ya e-posta ile sipariş bildirimi gönderilir.</li>
      </ul>

      <h2 style={S.h2}>Madde 4 — Teslimat</h2>
      <ul style={S.ul}>
        <li style={S.li}>Ürün tamamen dijital nitelikte olup fiziksel teslimat yapılmaz.</li>
        <li style={S.li}>Kişiye özel içerik hazırlandıktan sonra Alıcı&apos;nın kullanıcı panelinde erişilebilir hale getirilir ve kayıtlı e-posta adresine indirme bağlantısı iletilir.</li>
        <li style={S.li}>Hazırlık süresi 1–5 iş günüdür; yoğunluk durumuna göre bu süre değişebilir.</li>
      </ul>

      <h2 style={S.h2}>Madde 5 — Cayma Hakkı</h2>
      <p style={S.p}>
        6502 sayılı Kanun&apos;un 15. maddesi uyarınca; tüketicinin onayıyla başlanan kişiye özel dijital içerik üretiminde, içerik hazırlığı başladıktan sonra cayma hakkı kullanılamaz. Alıcı, sipariş oluştururken bu koşulu kabul etmiş sayılır.
      </p>
      <p style={S.p}>
        Üretim sürecine geçilmemişse Alıcı, 14 gün içinde gerekçe göstermeksizin siparişten cayabilir. Cayma talebini <strong>info@hatiradergi.com</strong> adresine bildirmesi yeterlidir.
      </p>

      <h2 style={S.h2}>Madde 6 — Uyuşmazlık Çözümü</h2>
      <p style={S.p}>
        Uyuşmazlıklarda öncelikle <strong>info@hatiradergi.com</strong> üzerinden çözüm aranır. Anlaşmazlık halinde Türkiye Cumhuriyeti mahkemeleri ve tüketici hakem heyetleri yetkilidir.
      </p>

      <h2 style={S.h2}>Madde 7 — Yürürlük</h2>
      <p style={S.p}>
        Alıcı, sipariş onayı ile bu sözleşmeyi elektronik ortamda okuduğunu ve kabul ettiğini beyan eder. Sözleşme, ödeme onayı iletildiği anda yürürlüğe girer.
      </p>

      <p style={{ ...S.p, marginTop: "2.5rem", color: "#999", fontSize: "0.8rem" }}>
        İletişim: info@hatiradergi.com
      </p>
    </div>
  );
}
