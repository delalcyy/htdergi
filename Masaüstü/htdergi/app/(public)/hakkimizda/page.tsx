import Link from "next/link";
import "@/styles/hakkimizda.css";

export const metadata = {
  title: "Hakkımızda | Hatıra Dergi",
  description: "Hatıra Dergi — anılarınızı profesyonel bir dergi kapağında ölümsüzleştiren platform. Biz kimiz, hikayemiz ve değerlerimiz.",
};

const degerler = [
  {
    num: "01",
    title: "Özgünlük",
    text: "Her tasarım benzersiz bir seri numarasıyla belgelenir. Sizin anınız, sizin imzanız.",
  },
  {
    num: "02",
    title: "Kalite",
    text: "Profesyonel dergi düzeni ve baskı kalitesiyle her sayfa özenle hazırlanır.",
  },
  {
    num: "03",
    title: "Kolaylık",
    text: "Dakikalar içinde kendi kapağınızı tasarlayın; teknik bilgiye gerek yok.",
  },
  {
    num: "04",
    title: "Duygu",
    text: "Bir fotoğrafın ötesinde: röportajınız, sözleriniz ve anının gerçek ağırlığı.",
  },
];

const stats = [
  { num: "10.000+", label: "Tasarlanan Kapak" },
  { num: "98%",     label: "Müşteri Memnuniyeti" },
  { num: "5",       label: "Farklı Kategori" },
  { num: "2022",    label: "Kuruluş Yılı" },
];

const timeline = [
  {
    year: "2022",
    title: "İlk Fikir Doğdu",
    desc: "Sevdiklerimize farklı bir sürpriz yapmak isterken dergi kapağı fikri hayat buldu.",
  },
  {
    year: "2023",
    title: "Platform Yayına Girdi",
    desc: "İlk kullanıcılarımız kapak tasarımlarını tamamladı ve geri bildirimler umut verici oldu.",
  },
  {
    year: "2024",
    title: "Büyüme Dönemi",
    desc: "Binlerce kişi doğum günü, mezuniyet ve kariyer anılarını kapak yaptı.",
  },
  {
    year: "2025",
    title: "Yeni Özellikler",
    desc: "Röportaj modülü, gelişmiş şablonlar ve koleksiyon sayfalarıyla platform genişledi.",
  },
];

export default function HakkimizdaPage() {
  return (
    <div className="hk">

      {/* ── Hero ── */}
      <section className="hk-hero">
        <div className="hk-wrap">
          <div className="hk-hero-inner">
            <div className="hk-hero-eyebrow">Hatıra Dergi</div>
            <h1 className="hk-hero-title">
              Biz <em>Kimiz?</em>
            </h1>
            <p className="hk-hero-desc">
              Sıradan bir fotoğrafın ötesine geçerek anılarınızı profesyonel bir
              dergi kapağında ölümsüzleştiriyoruz. Her an, her hikaye, her kişi
              bir kapak olmayı hak ediyor.
            </p>
            <div className="hk-hero-rule" />
          </div>
        </div>
      </section>

      {/* ── Biz Kimiz ── */}
      <section className="hk-kimiz">
        <div className="hk-wrap">
          <div className="hk-kimiz-grid">
            <div className="hk-kimiz-left">
              <div className="hk-eyebrow">Hikayemiz</div>
              <h2 className="hk-section-title">
                Anıları <em>Kapağa</em> Taşıyoruz
              </h2>
              <div className="hk-kimiz-text">
                <p>
                  Hatıra Dergi, sevdiklerinize ya da kendinize bambaşka bir
                  sürpriz yapmak isteyenler için kuruldu. Çünkü inanıyoruz ki
                  her özel an — bir doğum günü, bir mezuniyet, bir kariyer
                  dönüm noktası — sadece bir fotoğraftan fazlasını hak eder.
                </p>
                <p>
                  fashiontv magazine estetiğinden ilham alarak tasarladığımız
                  platformda, siz yalnızca fotoğrafınızı yükler ve sorularımıza
                  yanıt verirsiniz; gerisi bizden. Dakikalar içinde elinizde
                  baskıya hazır, profesyonel bir dergi sayfası olur.
                </p>
                <p>
                  Tasarlanan her kapak, benzersiz bir seri numarasıyla
                  belgelenir. Bu numara yalnızca sizin anınıza aittir — tıpkı
                  o anın kendisi gibi tekrarlanamaz ve değiştirilemez.
                </p>
              </div>
            </div>

            <div className="hk-kimiz-right">
              <div className="hk-kimiz-quote-box">
                <div className="hk-big-quote">"</div>
                <p className="hk-quote-text">
                  Bir gün herkes ünlü olacak. Biz o günün gelmesini beklemiyoruz
                  — o günü bugün yaratıyoruz.
                </p>
                <div className="hk-quote-author">
                  <span className="hk-quote-author-name">Hatıra Dergi</span>
                  <span className="hk-quote-author-title">Kurucu Ekip Manifestosu</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Misyon & Vizyon ── */}
      <section className="hk-mv">
        <div className="hk-wrap">
          <div className="hk-eyebrow">Yönümüz</div>
          <h2 className="hk-section-title">
            Misyon & <em>Vizyon</em>
          </h2>
          <div className="hk-mv-grid">
            <div className="hk-mv-card">
              <div className="hk-mv-icon">◈</div>
              <h3 className="hk-mv-card-title">Misyonumuz</h3>
              <p className="hk-mv-card-text">
                Her bireyin özel anlarını, profesyonel dergi kalitesinde
                belgelemesini mümkün kılmak. Teknoloji ve tasarımı bir araya
                getirerek herkesin erişebildiği, kişisel ve anlamlı hatıralar
                üretmek.
              </p>
            </div>
            <div className="hk-mv-card">
              <div className="hk-mv-icon">◇</div>
              <h3 className="hk-mv-card-title">Vizyonumuz</h3>
              <p className="hk-mv-card-text">
                "Herkes bir kapak yıldızıdır" anlayışını Türkiye'den dünyaya
                taşımak. Anıların dijital çöpe gitmediği, aksine zamanla
                değer kazanan birer eser haline geldiği bir kültür inşa etmek.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Değerlerimiz ── */}
      <section className="hk-degerler">
        <div className="hk-wrap">
          <div className="hk-degerler-head">
            <div>
              <div className="hk-eyebrow">İlkelerimiz</div>
              <h2 className="hk-section-title">
                Her Kararın Arkasındaki <em>Değerler</em>
              </h2>
            </div>
            <p className="hk-degerler-lede">
              Bir platform tasarlarken sadece özellik listesi yapmadık.
              Her adımda şu soruyu sorduk: bu kullanıcının anısına
              gerçekten değer katıyor mu?
            </p>
          </div>
          <div className="hk-degerler-grid">
            {degerler.map((d) => (
              <div key={d.num} className="hk-deger-item">
                <div className="hk-deger-num">{d.num}</div>
                <h3 className="hk-deger-title">{d.title}</h3>
                <p className="hk-deger-text">{d.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Rakamlar ── */}
      <section className="hk-stats">
        <div className="hk-wrap">
          <div className="hk-stats-grid">
            {stats.map((s) => (
              <div key={s.label} className="hk-stat-item">
                <div className="hk-stat-num">{s.num}</div>
                <div className="hk-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Hikayemiz (Timeline) ── */}
      <section className="hk-hikaye">
        <div className="hk-wrap">
          <div className="hk-hikaye-grid">
            <div>
              <div className="hk-eyebrow">Tarihçe</div>
              <h2 className="hk-section-title">
                Nasıl <em>Başladık?</em>
              </h2>
              <div className="hk-hikaye-text">
                <p>
                  Her büyük fikir gibi, Hatıra Dergi de sıradan bir ihtiyaçtan
                  doğdu. Sevdiklerimize "farklı bir şey" vermek isterken
                  hiçbir platformun gerçek anlamda kişiselleştirilmiş ve baskı
                  kalitesinde bir ürün sunmadığını fark ettik.
                </p>
                <p>
                  Küçük bir ekip, büyük bir hayalle yola çıktı. Bugün
                  on binlerce özel an, arşivlerde değil çerçevelerde yaşıyor.
                </p>
              </div>
            </div>

            <div className="hk-hikaye-timeline">
              {timeline.map((t) => (
                <div key={t.year} className="hk-timeline-item">
                  <div className="hk-timeline-year">{t.year}</div>
                  <div className="hk-timeline-title">{t.title}</div>
                  <div className="hk-timeline-desc">{t.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="hk-cta">
        <div className="hk-wrap">
          <div className="hk-cta-inner">
            <h2 className="hk-cta-title">
              Siz de <em>Kapak Yıldızı</em> Olun
            </h2>
            <p className="hk-cta-sub">
              Anınızı ölümsüzleştirmek için tek yapmanız gereken başlamak.
            </p>
            <div className="hk-cta-btns">
              <Link href="/auth/kayit" className="hk-btn-primary">
                Hemen Başla <span className="hk-arr">→</span>
              </Link>
              <Link href="/abonelik" className="hk-btn-ghost">
                Planları Gör <span className="hk-arr">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
