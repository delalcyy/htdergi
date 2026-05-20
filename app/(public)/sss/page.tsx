export const metadata = { title: "Sık Sorulan Sorular | Hatıra Dergi" };

const faqs = [
  {
    q: "Abonelik satın almadan kapak tasarlayabilir miyim?",
    a: "Evet. Abonelik almak yerine tek seferlik kapak satın alımı yapabilirsiniz. Bilgi formunu doldurduktan sonra ödeme adımına geçersiniz.",
  },
  {
    q: "Seri numarası ne işe yarar?",
    a: "Bazı etkinliklerde veya satış noktalarında önceden ödeme alınarak size özel bir kart verilebilir. Karttaki seri numaranızı sisteme girerek 1 yıllık aboneliğinizi aktif edebilirsiniz.",
  },
  {
    q: "Kapak tasarımımı nasıl kaydederim?",
    a: "Editör ekranında 'Taslağı Kaydet' butonuna basarak istediğiniz zaman çalışmanızı kaydedebilirsiniz. Taslaklar panelinizdeki 'Tasarımlarım' bölümünde listelenir.",
  },
  {
    q: "Röportaj modülü nedir?",
    a: "Kapak tasarlama alanının içinde yer alan Röportaj modülü, kategori bazlı sorularla anlamlı içerikler oluşturmanıza yardımcı olur. Cevaplarınız güvenle saklanır.",
  },
  {
    q: "Faturamı nereden görebilirim?",
    a: "Panelinizdeki 'Satın Alımlarım' bölümünde tüm ödeme geçmişinizi görebilirsiniz.",
  },
  {
    q: "Aboneliğimi iptal etmek istiyorum. Ne yapmalıyım?",
    a: "Abonelik iptali için bizimle iletişime geçebilirsiniz. Mevcut abonelik süreniz dolana kadar erişiminiz devam eder. Kapak tasarımları kişiye özel üretildiğinden, tasarım siparişlerinde iptal hakkı bulunmamaktadır.",
  },
];

export default function SSSPage() {
  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "4rem 1.5rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "2.5rem" }}>
        Sık Sorulan Sorular
      </h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {faqs.map((faq, i) => (
          <div key={i} style={{
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "1.25rem 1.5rem",
          }}>
            <div style={{ fontWeight: 600, color: "#1a1a1a", marginBottom: "0.625rem", fontSize: "0.9375rem" }}>
              {faq.q}
            </div>
            <div style={{ fontSize: "0.875rem", color: "#6b7280", lineHeight: 1.6 }}>
              {faq.a}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
