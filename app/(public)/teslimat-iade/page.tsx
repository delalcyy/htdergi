import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teslimat ve İade Şartları | Hatıra Dergi",
  description: "Hatıra Dergi teslimat ve iade şartları — dijital ürün teslimatı, iade koşulları ve iptal politikası.",
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
  box: { background: "#faf8f3", border: "1px solid #e8e0cc", borderLeft: "3px solid #b08d3c", borderRadius: "4px", padding: "1rem 1.25rem", margin: "1.5rem 0" } as React.CSSProperties,
  boxP: { fontSize: "0.875rem", color: "#555", lineHeight: 1.75, margin: 0 },
};

export default function TeslimatIadePage() {
  return (
    <div style={S.page}>
      <span style={S.eyebrow}>Yasal Bilgiler</span>
      <h1 style={S.h1}>Teslimat ve İade Şartları</h1>
      <span style={S.date}>Son güncelleme: Mayıs 2025</span>

      <p style={S.p}>
        Hatıra Dergi, kişiye özel dijital dergi kapağı ve röportaj içeriği hazırlayan bir platformdur. Sunulan ürünler dijital nitelikte olup fiziksel teslimat söz konusu değildir. Bu sayfa, teslimat süreci ve iade koşullarına ilişkin şartlarımızı açıklamaktadır.
      </p>

      <h2 style={S.h2}>1. Ürün Türü</h2>
      <p style={S.p}>
        Hatıra Dergi&apos;de satışa sunulan tüm ürünler <strong>dijital içerik</strong> niteliğindedir. Kullanıcı tarafından girilen bilgiler, yüklenen fotoğraflar ve seçilen tasarım unsurlarıyla kişiye özel olarak hazırlanan dergi kapağı ve röportaj içeriği, <strong>PDF formatında</strong> teslim edilir.
      </p>

      <h2 style={S.h2}>2. Teslimat Süreci</h2>
      <ul style={S.ul}>
        <li style={S.li}>Ödeme onaylandıktan sonra sipariş sisteme iletilir.</li>
        <li style={S.li}>Kişiye özel içerik hazırlık süreci başlar; bu süre içerik karmaşıklığına göre <strong>1–5 iş günü</strong> arasında değişebilir.</li>
        <li style={S.li}>Tamamlanan ürün kullanıcının <strong>panelinde</strong> ve kayıtlı <strong>e-posta adresine</strong> gönderilen indirme bağlantısı üzerinden erişilebilir hale getirilir.</li>
        <li style={S.li}>Teslimat tamamen dijital ortamda gerçekleşir; fiziksel kargo veya posta gönderimi yapılmaz.</li>
      </ul>

      <h2 style={S.h2}>3. Cayma ve İade Hakkı</h2>
      <div style={S.box}>
        <p style={S.boxP}>
          <strong>Önemli:</strong> 6502 sayılı Tüketicinin Korunması Hakkında Kanun&apos;un 15. maddesi uyarınca; tüketicinin onayıyla üretimine başlanan kişiye özel dijital içeriklerde, içerik hazırlık süreci başladıktan sonra cayma hakkı kullanılamaz.
        </p>
      </div>
      <p style={S.p}>Bununla birlikte aşağıdaki durumlarda iade talepleri değerlendirilir:</p>
      <ul style={S.ul}>
        <li style={S.li}><strong>Üretim başlamadan önce:</strong> Siparişi ilettikten sonra henüz hazırlık sürecine geçilmemişse tam iade yapılabilir.</li>
        <li style={S.li}><strong>Teknik hata durumunda:</strong> Teslimat yapılamamış veya ürün kullanılamaz durumdaysa destek ekibimize başvurunuz.</li>
        <li style={S.li}><strong>İçerik hatası:</strong> Sisteme girilen bilgilerin hatalı işlenmesinden kaynaklanan durumlarda ücretsiz düzeltme yapılır.</li>
      </ul>

      <h2 style={S.h2}>4. İade Talebi</h2>
      <p style={S.p}>
        İade veya şikayet talebinizi <strong>info@hatiradergi.com</strong> adresine, sipariş numaranızı ve talebinizin gerekçesini belirterek iletebilirsiniz. Talepler en geç <strong>5 iş günü</strong> içinde yanıtlanır.
      </p>

      <h2 style={S.h2}>5. Ödeme Güvenliği</h2>
      <p style={S.p}>
        Tüm ödeme işlemleri <strong>iyzico</strong> ödeme altyapısı üzerinden SSL şifreli bağlantı ile güvenli şekilde gerçekleştirilmektedir. Kart bilgileriniz Hatıra Dergi sistemlerinde hiçbir şekilde saklanmamaktadır.
      </p>

      <h2 style={S.h2}>6. İletişim</h2>
      <p style={S.p}>
        Teslimat ve iade süreçlerine ilişkin sorularınız için: <strong>info@hatiradergi.com</strong>
      </p>
    </div>
  );
}
