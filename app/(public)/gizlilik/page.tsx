import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gizlilik Sözleşmesi | Hatıra Dergi",
  description: "Hatıra Dergi gizlilik sözleşmesi — kişisel verilerinizin nasıl toplandığı, işlendiği ve korunduğuna ilişkin bilgiler.",
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
};

export default function GizlilikPage() {
  return (
    <div style={S.page}>
      <span style={S.eyebrow}>Yasal Bilgiler</span>
      <h1 style={S.h1}>Gizlilik Sözleşmesi</h1>
      <span style={S.date}>Son güncelleme: Mayıs 2026</span>

      <p style={S.p}>
        Hatıra Dergi olarak kişisel verilerinizin güvenliğine büyük önem veriyoruz. Bu Gizlilik Sözleşmesi, <strong>hatiradergi.com</strong> adresinde sunulan hizmetleri kullanırken toplanan, işlenen ve saklanan kişisel verilerinize ilişkin uygulamalarımızı açıklamaktadır.
      </p>

      <h2 style={S.h2}>1. Veri Sorumlusu</h2>
      <p style={S.p}>
        6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) kapsamında veri sorumlusu <strong>Hatıra Dergi</strong>&apos;dir. İletişim: <strong>info@hatiradergi.com</strong>
      </p>

      <h2 style={S.h2}>2. Toplanan Veriler</h2>
      <p style={S.p}>Hizmetlerimizi kullanırken aşağıdaki veriler toplanabilir:</p>
      <ul style={S.ul}>
        <li style={S.li}><strong>Kimlik bilgileri:</strong> Ad, soyad</li>
        <li style={S.li}><strong>İletişim bilgileri:</strong> E-posta adresi, telefon numarası</li>
        <li style={S.li}><strong>Hesap bilgileri:</strong> Kullanıcı adı, şifreli giriş verileri</li>
        <li style={S.li}><strong>İçerik verileri:</strong> Kapak tasarımında yüklenen fotoğraflar, girilen metin ve röportaj cevapları</li>
        <li style={S.li}><strong>Ödeme bilgileri:</strong> Ödeme işlemi iyzico altyapısı üzerinden gerçekleştirilmekte olup kart bilgileri Hatıra Dergi sistemlerinde saklanmamaktadır.</li>
        <li style={S.li}><strong>Teknik veriler:</strong> IP adresi, tarayıcı türü, oturum süreleri</li>
      </ul>

      <h2 style={S.h2}>3. Verilerin İşlenme Amaçları</h2>
      <ul style={S.ul}>
        <li style={S.li}>Kullanıcı hesabının oluşturulması ve yönetimi</li>
        <li style={S.li}>Kişiye özel dijital dergi kapağı ve röportaj içeriğinin hazırlanması</li>
        <li style={S.li}>Sipariş ve ödeme süreçlerinin yürütülmesi</li>
        <li style={S.li}>Müşteri desteği sağlanması</li>
        <li style={S.li}>Yasal yükümlülüklerin yerine getirilmesi</li>
        <li style={S.li}>Hizmet kalitesinin iyileştirilmesi</li>
      </ul>

      <h2 style={S.h2}>4. Verilerin Paylaşımı</h2>
      <p style={S.p}>
        Kişisel verileriniz; yasal zorunluluklar, ödeme altyapısı sağlayıcısı (iyzico) ve kargo/teslimat ortakları dışında üçüncü taraflarla paylaşılmaz, satılmaz veya kiralanmaz.
      </p>

      <h2 style={S.h2}>5. Çerezler (Cookies)</h2>
      <p style={S.p}>
        Sitemiz oturum yönetimi ve kullanım analizleri amacıyla çerez kullanmaktadır. Tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilirsiniz; ancak bu durumda bazı özellikler çalışmayabilir.
      </p>

      <h2 style={S.h2}>6. Veri Saklama Süresi</h2>
      <p style={S.p}>
        Kişisel verileriniz, hizmet ilişkisi süresince ve ilgili yasal süreler boyunca saklanır. Hesabınızı silmeniz halinde verileriniz, yasal saklama yükümlülükleri saklı kalmak kaydıyla silinir veya anonimleştirilir.
      </p>

      <h2 style={S.h2}>7. Haklarınız</h2>
      <p style={S.p}>KVKK kapsamında aşağıdaki haklara sahipsiniz:</p>
      <ul style={S.ul}>
        <li style={S.li}>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
        <li style={S.li}>İşlenen verileriniz hakkında bilgi talep etme</li>
        <li style={S.li}>Verilerin düzeltilmesini veya silinmesini isteme</li>
        <li style={S.li}>İşlemeye itiraz etme</li>
        <li style={S.li}>Zararınızın giderilmesini talep etme</li>
      </ul>
      <p style={S.p}>
        Talepleriniz için <strong>info@hatiradergi.com</strong> adresine yazabilirsiniz.
      </p>

      <h2 style={S.h2}>8. Değişiklikler</h2>
      <p style={S.p}>
        Bu sözleşme zaman zaman güncellenebilir. Önemli değişiklikler e-posta ile bildirilir. Güncel sürüm her zaman bu sayfada yayımlanır.
      </p>
    </div>
  );
}
