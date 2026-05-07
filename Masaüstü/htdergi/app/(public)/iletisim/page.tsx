import "@/styles/iletisim.css";
import IletisimForm from "@/components/shared/IletisimForm";

export const metadata = {
  title: "İletişim | Hatıra Dergi",
  description: "Sorularınız için bize ulaşın. Ortalama yanıt süremiz 24 saattir.",
};

const faqs = [
  {
    q: "Siparişimi nasıl takip edebilirim?",
    a: "Kullanıcı panelinizden tüm tasarımlarınızı ve indirme geçmişinizi görebilirsiniz. Her tasarım için durum bilgisi panelde anlık olarak güncellenir.",
  },
  {
    q: "Tasarımımı yeniden indirebilir miyim?",
    a: "Evet. Oluşturduğunuz tüm tasarımlar panelinizdeki 'Tasarımlarım' bölümünde saklanır ve aboneliğiniz aktif olduğu sürece istediğiniz zaman indirilebilir.",
  },
  {
    q: "Fotoğrafım uygun mu bilmiyorum, ne yapmalıyım?",
    a: "Yüklemeden önce net, iyi ışıklı ve dikey (portre) formatta bir fotoğraf tercih edin. Emin değilseniz bize gönderin, değerlendirip dönelim.",
  },
  {
    q: "Ödeme yaptım ama hesabım aktive olmadı.",
    a: "Genellikle birkaç dakika içinde otomatik aktive olur. 15 dakika geçmesine rağmen aktive olmazsa ödeme belgenizle bize yazın, en kısa sürede çözeriz.",
  },
  {
    q: "İade talep etmek istiyorum.",
    a: "İlk 7 gün içinde ve henüz tasarım oluşturmamışsanız tam iade yapıyoruz. Destek formumuzu doldurun veya e-posta gönderin, 24 saat içinde dönüş sağlarız.",
  },
  {
    q: "Toplu sipariş veya kurumsal paket var mı?",
    a: "Evet, özel fiyatlandırma için bizimle iletişime geçin. Etkinlik, kurumsal hediye veya toplu siparişlerde özel çözümler sunuyoruz.",
  },
];

export default function IletisimPage() {
  return (
    <div className="il">

      {/* ── Hero ── */}
      <section className="il-hero">
        <div className="il-wrap">
          <div className="il-hero-inner">
            <div>
              <div className="il-hero-eyebrow">İletişim</div>
              <h1 className="il-hero-title">
                Size <em>Yardımcı</em> Olmak İçin Buradayız
              </h1>
              <p className="il-hero-desc">
                Bir sorunuz mu var, geri bildirim mi vermek istiyorsunuz
                yoksa özel bir proje mi düşünüyorsunuz? Formu doldurun,
                en kısa sürede geri dönelim.
              </p>
            </div>

            <div className="il-hero-contacts">
              <div className="il-hero-contact-item">
                <div className="il-contact-icon">@</div>
                <div>
                  <div className="il-contact-label">E-posta</div>
                  <div className="il-contact-value">info@hatiradergi.com</div>
                </div>
              </div>
              <div className="il-hero-contact-item">
                <div className="il-contact-icon">◎</div>
                <div>
                  <div className="il-contact-label">Konum</div>
                  <div className="il-contact-value">İstanbul, Türkiye</div>
                </div>
              </div>
              <div className="il-hero-contact-item">
                <div className="il-contact-icon">◷</div>
                <div>
                  <div className="il-contact-label">Yanıt Süresi</div>
                  <div className="il-contact-value">Ortalama 24 saat</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Form + Bilgi ── */}
      <section className="il-main">
        <div className="il-wrap">
          <div className="il-main-grid">

            {/* Form */}
            <div>
              <div className="il-eyebrow">Mesaj Gönderin</div>
              <h2 className="il-form-title">
                Bize <em>Yazın</em>
              </h2>
              <IletisimForm />
            </div>

            {/* Sağ bilgi paneli */}
            <div className="il-info-panel">
              <div className="il-info-section">
                <div className="il-info-section-title">İletişim Bilgileri</div>
                <div className="il-info-list">
                  <div className="il-info-row">
                    <span className="il-info-dot" />
                    <div className="il-info-text">
                      <span className="il-info-key">E-posta</span>
                      <span className="il-info-val">info@hatiradergi.com</span>
                    </div>
                  </div>
                  <div className="il-info-row">
                    <span className="il-info-dot" />
                    <div className="il-info-text">
                      <span className="il-info-key">Destek</span>
                      <span className="il-info-val">destek@hatiradergi.com</span>
                    </div>
                  </div>
                  <div className="il-info-row">
                    <span className="il-info-dot" />
                    <div className="il-info-text">
                      <span className="il-info-key">Adres</span>
                      <span className="il-info-val">İstanbul, Türkiye</span>
                    </div>
                  </div>
                  <div className="il-info-row">
                    <span className="il-info-dot" />
                    <div className="il-info-text">
                      <span className="il-info-key">Çalışma Saatleri</span>
                      <span className="il-info-val">Pzt – Cum, 09:00 – 18:00</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="il-response-box">
                <span className="il-response-icon">◷</span>
                <div>
                  <div className="il-response-label">Ortalama Yanıt Süresi</div>
                  <div className="il-response-val">24 saat içinde dönüş yapıyoruz. Hafta sonları 48 saate uzayabilir.</div>
                </div>
              </div>

              <div className="il-info-section">
                <div className="il-info-section-title">Sosyal Medya</div>
                <div className="il-info-list">
                  <div className="il-info-row">
                    <span className="il-info-dot" />
                    <div className="il-info-text">
                      <span className="il-info-key">Instagram</span>
                      <span className="il-info-val">@hatiradergi</span>
                    </div>
                  </div>
                  <div className="il-info-row">
                    <span className="il-info-dot" />
                    <div className="il-info-text">
                      <span className="il-info-key">Twitter / X</span>
                      <span className="il-info-val">@hatiradergi</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── SSS ── */}
      <section className="il-faq">
        <div className="il-wrap">
          <div className="il-faq-head">
            <div>
              <div className="il-eyebrow">Sık Sorulan Sorular</div>
              <h2 className="il-section-title">
                Yanıt Aradığınız <em>Sorular</em>
              </h2>
            </div>
            <p className="il-faq-lede">
              Formu doldurmadan önce aşağıdaki sık sorulan sorulara
              göz atın — cevabınız burada olabilir.
            </p>
          </div>
          <div className="il-faq-grid">
            {faqs.map((faq) => (
              <div key={faq.q} className="il-faq-item">
                <div className="il-faq-q">{faq.q}</div>
                <p className="il-faq-a">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
