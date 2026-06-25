import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Amedspor × Hatıra Dergi — Sen de Amed'in Yıldızısın",
  description: "Amedspor taraftarları için özel kişisel dergi. Kendi kapağının yıldızı ol, hikâyeni dünyaya anlat.",
};

export default function AmedsporPage() {
  return (
    <div className="amed-page">
      {/* ── DUYURU BANDI ── */}
      <div className="amed-topbar">
        <p><span style={{textTransform:"uppercase"}}>Aldığınız her dergi, hem bir hatıraya hem de bir dünya yıldızının transferine dönüşsün.</span></p>
      </div>

      {/* ── NAV ── */}
      <nav className="amed-nav">
        <div className="amed-nav-inner">
          <div className="amed-logo-group">
            <div className="amed-club-logo" aria-label="Amedspor Logosu">
              <img src="/amedspor/logo.webp" alt="Amedspor" className="amed-club-logo-img" />
            </div>
            <span className="amed-nav-brand">Amedspor</span>
            <span className="amed-nav-sep">×</span>
            <span className="amed-nav-brand">Hatıra Dergi</span>
            <div className="amed-club-logo" aria-label="Hatıra Dergi Logosu">
              <img src="/logo6.png" alt="Hatıra Dergi" className="amed-club-logo-img" />
            </div>
          </div>
          <Link href="/auth/kayit" className="amed-nav-cta">
            Derginizi Oluşturun
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="amed-hero-wrap">
        <div className="amed-hero-bg">
          <img src="/amedspor/amed1.png" alt="" className="amed-hero-bg-img" />
          <div className="amed-hero-overlay" />
        </div>
      <section className="amed-hero">

        <div className="amed-hero-content">
          <div className="amed-hero-badge">Amedspor × Hatıra Dergi Özel İşbirliği</div>
          <h1 className="amed-hero-h1">
            Sen de<br />
            <em>Amed&apos;in Yıldızısın</em>
          </h1>
          <p className="amed-hero-sub">
            Kendi hikâyeni anlat. Röportajını yayımla. Amedspor ruhunu<br className="amed-br" />
            kişisel dergin kapağında sonsuza taşı.
          </p>
          <div className="amed-hero-btns">
            <Link href="/auth/kayit" className="amed-btn-primary">
              Hemen Başla <span>→</span>
            </Link>
            <a href="#nasil-calisir" className="amed-btn-ghost">
              Nasıl Çalışır?
            </a>
          </div>
        </div>

      </section>
      </section>

      {/* ── STATS ── */}
      <section className="amed-stats">
        <div className="amed-stats-inner">
          {[
            { n: "1.000+", label: "Basılan Dergi" },
            { n: "4.8★", label: "Müşteri Memnuniyeti" },
            { n: "24 Saat", label: "Tasarım & Teslim" },
            { n: "100%", label: "Kişiselleştirilmiş" },
          ].map((s) => (
            <div key={s.label} className="amed-stat">
              <span className="amed-stat-n">{s.n}</span>
              <span className="amed-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── KAPAK TASARLA CTA ── */}
      <section className="amed-kapsec">
        <div className="amed-section-inner">
          <div className="amed-kapsec-inner">
            <div className="amed-kapsec-text">
              <span className="amed-tag">Hemen Dene</span>
              <h2 className="amed-section-h2" style={{textAlign:"left", marginTop:"16px"}}>
                Amedspor Logolu<br />Kendi Dergin
              </h2>
              <p className="amed-kapsec-desc">
                Fotoğrafını yükle, adını yaz — Amedspor logolu kişisel dergi kapağın hazır. Tasarımını tamamla, gerçek baskı dergin kapına gelsin.
              </p>
              <Link href="/amedspor/kapak-tasarla" className="amed-btn-primary" style={{marginTop:"28px", display:"inline-flex"}}>
                Kapağımı Tasarla <span>→</span>
              </Link>
            </div>
            <div className="amed-kapsec-preview">
              <div className="amed-kapsec-badge">
                <img src="/amedspor/logo.webp" alt="Amedspor" className="amed-kapsec-badge-logo" />
                <span>Amedspor × Hatıra Dergi</span>
                <img src="/logo6.png" alt="Hatıra Dergi" className="amed-kapsec-badge-logo" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── NASIL ÇALIŞIR ── */}
      <section className="amed-how" id="nasil-calisir">
        <div className="amed-section-inner">
          <div className="amed-section-head">
            <span className="amed-tag">Kolay & Hızlı</span>
            <h2 className="amed-section-h2">4 Adımda Kendi Dergin</h2>
          </div>
          <div className="amed-steps">
            {[
              { n: "01", title: "Kayıt Ol", desc: "Ücretsiz hesap oluştur." },
              { n: "02", title: "Abone Ol", desc: "Amedspor özel paketini seç." },
              { n: "03", title: "Tasarla", desc: "Fotoğrafını yükle, röportajını doldur." },
              { n: "04", title: "Teslim Al", desc: "Gerçek baskı dergin adresine gelir." },
            ].map((step) => (
              <div key={step.n} className="amed-step">
                <span className="amed-step-n">{step.n}</span>
                <h3 className="amed-step-title">{step.title}</h3>
                <p className="amed-step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GALERİ ── */}
      <section className="amed-gallery">
        <div className="amed-section-inner">
          <div className="amed-section-head">
            <span className="amed-tag">Örnekler</span>
            <h2 className="amed-section-h2">Taraftarlarımızın Dergileri</h2>
          </div>
          <div className="amed-gallery-grid">
            {[
              { src: "/amedspor/kapak-ornek-1.png", ad: "Murat Uçar" },
              { src: "/amedspor/kapak-ornek-2-1.png", ad: "Hasan Ali Kaldırım" },
              { src: "/amedspor/kapak-ornek-3-1.png", ad: "Kahraman Demirtaş" },
              { src: "/amedspor/kapak-ornek-4-1.png", ad: "Mehmet Yeşil" },
              { src: "/amedspor/kapak-ornek-5-1.png", ad: "Oğuzhan Matur" },
              { src: "/amedspor/kapak-ornek-6-1.png", ad: "Abdulsamed Damlı" },
            ].map((item, i) => (
              <div key={i} className="amed-gallery-card">
                <img
                  src={item.src}
                  alt={item.ad}
                  className="amed-gallery-img"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="amed-testimonials">
        <div className="amed-section-inner">
          <div className="amed-section-head">
            <span className="amed-tag">Taraftarlar Anlatıyor</span>
            <h2 className="amed-section-h2">Onlar Zaten Yıldız Oldu</h2>
          </div>
          <div className="amed-tcard-grid">
            {[
              {
                name: "Mehmet A.",
                role: "Sezonluk Taraftar",
                text: "Oğlumun forma giydiği ilk maça özel dergi yaptırdım. Elinde tutup bakıyor hâlâ, çerçeveleyeceğiz.",
              },
              {
                name: "Zeynep K.",
                role: "Kombine Sahibi",
                text: "Amedspor formasıyla çekilen fotoğrafımı kapağa koyduk. Dergiyi görünce gözlerim doldu, inanılmaz bir his.",
              },
              {
                name: "Ali D.",
                role: "Taraftar Grubu Başkanı",
                text: "Grubumuzun 10. yılı için 50 kişilik özel baskı yaptırdık. Her üye kendi adını kapakta görünce bambaşka bir gurur hissetti.",
              },
              {
                name: "Serhat B.",
                role: "Diyarbakır'dan Taraftar",
                text: "Babamla ilk maç hatıramızı dergi kapağı yaptık. Babasına sürpriz olarak verdi, adam ağladı. Bu kadar güzel bir hediye düşünemezdim.",
              },
              {
                name: "Fatma Y.",
                role: "Amedspor Gönüllüsü",
                text: "Sosyal medyada gördüm, deneyeyim dedim. Tasarımı çok kolay, baskı kalitesi gerçekten iyi. Birkaç arkadaşıma da hediye ettim.",
              },
              {
                name: "Emre T.",
                role: "Deplasman Taraftarı",
                text: "Deplasmanda çektiğimiz fotoğrafı kapak yaptık, altına röportaj bölümüne o maceralarımızı yazdık. Okuyunca insan gülümsüyor.",
              },
            ].map((t) => (
              <div key={t.name} className="amed-tcard">
                <p className="amed-tcard-text">&ldquo;{t.text}&rdquo;</p>
                <div className="amed-tcard-footer">
                  <div className="amed-tcard-avatar" />
                  <div>
                    <p className="amed-tcard-name">{t.name}</p>
                    <p className="amed-tcard-role">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HEDİYE KARTI ── */}
      <section className="amed-gift">
        <div className="amed-section-inner">
          <div className="amed-gift-inner">
            <div className="amed-gift-text">
              <span className="amed-tag">Hediye Et</span>
              <h2 className="amed-section-h2" style={{textAlign:"left", marginTop:"16px"}}>
                Sevdiğin Amedspor<br />Taraftarına Hediye Et
              </h2>
              <p className="amed-gift-desc">
                Doğum günü, yıl dönümü ya da sırf sürpriz yapmak için — Amedspor taraftarına kişiselleştirilmiş dergi hediye et. O tasarlasın, sen öde. Kapısına gelsin.
              </p>
              <ul className="amed-gift-bullets">
                <li>🎁 Sevdiğin kişi kendi kapağını tasarlar</li>
                <li>📦 Gerçek baskı, adresine teslim</li>
                <li>💌 Hediye mesajı ekleyebilirsin</li>
              </ul>
              <Link href="/auth/kayit" className="amed-btn-primary" style={{marginTop:"28px", display:"inline-flex"}}>
                Hediye Dergi Al <span>→</span>
              </Link>
            </div>
            <div className="amed-gift-card-wrap">
              <div className="amed-gift-card">
                <div className="amed-gift-card-top">
                  <div className="amed-gift-card-logos">
                    <img src="/amedspor/logo.webp" alt="Amedspor" className="amed-gift-card-logo" />
                    <span className="amed-gift-card-x">×</span>
                    <img src="/logo6.png" alt="Hatıra Dergi" className="amed-gift-card-logo" />
                  </div>
                  <span className="amed-gift-card-label">Hediye Kartı</span>
                </div>
                <div className="amed-gift-card-body">
                  <p className="amed-gift-card-title">Sen de Amed&apos;in Yıldızısın</p>
                  <p className="amed-gift-card-sub">Kişiselleştirilmiş Dergi Hediyesi</p>
                </div>
                <div className="amed-gift-card-footer">
                  <span className="amed-gift-card-shine" />
                  Amedspor × Hatıra Dergi
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SSS ── */}
      <section className="amed-faq">
        <div className="amed-section-inner">
          <div className="amed-section-head">
            <span className="amed-tag">SSS</span>
            <h2 className="amed-section-h2">Sıkça Sorulan Sorular</h2>
          </div>
          <div className="amed-faq-list">
            {[
              {
                q: "Dergi gerçekten basılıp mı geliyor, PDF değil mi?",
                a: "Evet, tamamen gerçek baskı bir dergi. Kaliteli kâğıda profesyonel baskı alınıp kargoya verilir, elinizde tutabileceğiniz bir dergi olarak kapınıza gelir.",
              },
              {
                q: "Kargo ne kadar sürer? Diyarbakır'a da teslim ediliyor mu?",
                a: "Türkiye'nin her iline gönderim yapıyoruz. Siparişiniz ortalama 3–5 iş günü içinde teslim edilir.",
              },
              {
                q: "Kapağımda hangi fotoğrafı kullanabilirim?",
                a: "Kendi fotoğrafınızı yükleyebilirsiniz. Amedspor formanızla, tribünde ya da özel bir anda çekilmiş fotoğraflar en güzel kapakları oluşturuyor.",
              },
              {
                q: "Grup siparişi verebilir miyim?",
                a: "Evet! Taraftar grupları, kombine sahipleri veya organizasyonlar için toplu sipariş seçeneğimiz mevcut. Bize iletişim sayfasından ulaşabilirsiniz.",
              },
              {
                q: "Gelirin bir kısmı Amedspor'a nasıl aktarılıyor?",
                a: "Hatıra Dergi ile Amedspor arasındaki resmi işbirliği anlaşması kapsamında, her satıştan belirlenen pay doğrudan kulübe aktarılır.",
              },
            ].map((item, i) => (
              <details key={i} className="amed-faq-item">
                <summary className="amed-faq-q">{item.q}</summary>
                <p className="amed-faq-a">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── HAKKIMIZDA ── */}
      <section className="amed-about" id="hakkimizda">
        <div className="amed-section-inner">
          <div className="amed-about-grid">
            <div className="amed-about-text">
              <span className="amed-tag">Hakkımızda</span>
              <h2 className="amed-section-h2" style={{textAlign:"left", marginTop:"16px"}}>Hatıra Dergi & Amedspor İşbirliği</h2>
              <p className="amed-about-p">
                Hatıra Dergi olarak milyonlarca taraftarın sesini, yüzünü ve hikâyesini sayfalarımıza taşıyoruz. Amedspor ile kurduğumuz bu özel işbirliği, Amed&apos;in büyük ailesini birer dergi yıldızına dönüştürmek için doğdu.
              </p>
              <p className="amed-about-p">
                Her kombine sahibi, her taraftar grubu üyesi, her tribün efsanesi kendi kişiselleştirilmiş dergisini hak ediyor. Amedspor formasıyla çekilen o fotoğraf, artık bir dergi kapağında yaşıyor.
              </p>
              <p className="amed-about-p">
                Aldığınız her derginin gelirinin bir kısmı doğrudan Amedspor&apos;a aktarılır. Yani bir dergi alıyorsun — hem anına sonsuza anlam katıyorsun, hem de kulübüne katkı sağlıyorsun.
              </p>
              <Link href="/auth/kayit" className="amed-btn-primary" style={{marginTop:"32px", display:"inline-flex"}}>
                Hemen Başla <span>→</span>
              </Link>
            </div>
            <div className="amed-about-visual">
              <div className="amed-about-card">
                <div className="amed-about-card-icon">⚽</div>
                <h3>Amedspor</h3>
                <p>Diyarbakır&apos;ın gururu, Türkiye&apos;nin vicdanı. 1990&apos;dan bu yana sahada, tribünde, kalpte.</p>
              </div>
              <div className="amed-about-card">
                <div className="amed-about-card-icon">📖</div>
                <h3>Hatıra Dergi</h3>
                <p>Kişiselleştirilmiş dergi tasarım platformu. Her hikâye bir kapak, her kapak bir hatıra.</p>
              </div>
              <div className="amed-about-card amed-about-card--green">
                <div className="amed-about-card-icon">🤝</div>
                <h3>Birlikte</h3>
                <p>Taraftarı yıldız yapmak, kulübü büyütmek için tek platformda buluştuk.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Referanslarımız ── */}
      <section className="amed-refs">
        <div className="amed-refs-inner">
          <p className="amed-refs-eyebrow">Medya Referanslarımız</p>
          <h2 className="amed-refs-title">Güvenilen Markalar</h2>
          <div className="amed-refs-grid">
            {[
              { file: "fenerbahce.jpeg",          label: "Fenerbahçe" },
              { file: "galatasaray.jpeg",         label: "Galatasaray" },
              { file: "besiktas.jpeg",            label: "Beşiktaş" },
              { file: "amedspor.png",             label: "Amedspor" },
              { file: "national-geographic.webp", label: "National Geographic" },
              { file: "fortune.jpg",              label: "Fortune" },
              { file: "marie-claire.jpg",         label: "Marie Claire" },
              { file: "elele.jpeg",               label: "Elele" },
              { file: "bebegimle.png",            label: "Bebeğimle" },
              { file: "heygirl.jpg",              label: "HeyGirl" },
              { file: "formsante.webp",           label: "Formsante" },
              { file: "instyle.png",              label: "InStyle" },
              { file: "atlas.webp",               label: "Atlas" },
              { file: "weddings.png",             label: "Weddings" },
              { file: "evim.png",                 label: "Evim" },
              { file: "menshealth.jpg",           label: "Men's Health" },
              { file: "womenshealth.png",         label: "Women's Health" },
              { file: "runners.jpeg",             label: "Runners" },
            ].map((r) => (
              <div key={r.file} className="amed-ref-item">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/referanslar/${r.file}`}
                  alt={r.label}
                  className="amed-ref-img"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="amed-cta">
        <div className="amed-cta-inner">
          <h2 className="amed-cta-h2">Kendi Derginizi Oluşturmaya Hazır mısınız?</h2>
          <p className="amed-cta-sub">Amedspor taraftarlarına özel fırsatları kaçırmayın.</p>
          <Link href="/auth/kayit" className="amed-btn-primary amed-cta-btn">
            Hemen Başla <span>→</span>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="amed-footer">
        <div className="amed-footer-inner">
          {/* Kolonlar */}
          <div className="amed-footer-top">
            <div className="amed-footer-brand-col">
              <div className="amed-logo-group" style={{marginBottom:"16px"}}>
                <div className="amed-club-logo">
                  <img src="/amedspor/logo.webp" alt="Amedspor" className="amed-club-logo-img" />
                </div>
                <span className="amed-nav-brand">Amedspor</span>
                <span className="amed-nav-sep">×</span>
                <span className="amed-nav-brand">Hatıra Dergi</span>
                <div className="amed-club-logo">
                  <img src="/logo6.png" alt="Hatıra Dergi" className="amed-club-logo-img" />
                </div>
              </div>
              <p className="amed-footer-tagline">Kendi hikâyeni anlat. Amedspor ruhuyla kişisel dergin kapında.</p>
              <div className="amed-footer-social">
                <a href="#" className="amed-footer-social-link" aria-label="Instagram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                  </svg>
                </a>
                <a href="#" className="amed-footer-social-link" aria-label="Twitter/X">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="amed-footer-col">
              <div className="amed-footer-col-title">Ürün</div>
              <Link href="/amedspor/kapak-tasarla" className="amed-footer-link">Kapak Tasarla</Link>
              <Link href="/abonelik" className="amed-footer-link">Abonelik</Link>
              <Link href="/nasil-calisir" className="amed-footer-link">Nasıl Çalışır?</Link>
            </div>

            <div className="amed-footer-col">
              <div className="amed-footer-col-title">Şirket</div>
              <Link href="/hakkimizda" className="amed-footer-link">Hakkımızda</Link>
              <Link href="/sss" className="amed-footer-link">SSS</Link>
              <Link href="/iletisim" className="amed-footer-link">İletişim</Link>
            </div>

            <div className="amed-footer-col">
              <div className="amed-footer-col-title">Hesap</div>
              <Link href="/auth/giris" className="amed-footer-link">Giriş Yap</Link>
              <Link href="/auth/kayit" className="amed-footer-link">Kayıt Ol</Link>
              <Link href="/panel" className="amed-footer-link">Panelim</Link>
            </div>
          </div>

          {/* Ödeme */}
          <div className="amed-footer-payment">
            <div className="amed-footer-pay-badge">
              <svg viewBox="0 0 60 20" width="48" height="16" aria-label="Visa">
                <text x="0" y="16" fontFamily="Arial,sans-serif" fontWeight="900" fontSize="17" fill="#1a1f71" letterSpacing="-0.5">VISA</text>
              </svg>
            </div>
            <div className="amed-footer-pay-badge">
              <svg viewBox="0 0 38 24" width="38" height="24" aria-label="Mastercard">
                <circle cx="14" cy="12" r="10" fill="#eb001b" />
                <circle cx="24" cy="12" r="10" fill="#f79e1b" />
                <path d="M19 5.3a10 10 0 0 1 0 13.4A10 10 0 0 1 19 5.3z" fill="#ff5f00" />
              </svg>
            </div>
            <div className="amed-footer-pay-badge amed-footer-pay-iyzico">
              <span>iyzico</span><span className="amed-footer-pay-ile">ile Öde</span>
            </div>
            <div className="amed-footer-pay-badge amed-footer-pay-ssl">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <span>Güvenli Ödeme</span>
            </div>
          </div>

          {/* Alt bar */}
          <div className="amed-footer-bottom">
            <span>Hatıra Dergi © {new Date().getFullYear()} • Tüm Hakları Saklıdır</span>
            <div className="amed-footer-legal">
              <Link href="/gizlilik" className="amed-footer-legal-link">Gizlilik</Link>
              <Link href="/teslimat-iade" className="amed-footer-legal-link">Teslimat &amp; İade</Link>
              <Link href="/mesafeli-satis-sozlesmesi" className="amed-footer-legal-link">Mesafeli Satış</Link>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        /* ── TOPBAR ── */
        .amed-topbar {
          background: #ffffff;
          text-align: center;
          padding: 10px 24px;
          font-size: 14px;
          font-weight: 600;
          color: #111;
          letter-spacing: 0.04em;
          line-height: 1.5;
          border-bottom: 1px solid #e5e5e5;
        }

        /* ── BASE ── */
        .amed-page {
          font-family: var(--font-inter, system-ui, sans-serif);
          color: #fff;
          background: #0a0a0a;
          min-height: 100vh;
        }

        /* ── NAV ── */
        .amed-nav {
          position: sticky;
          top: 0; left: 0; right: 0;
          z-index: 100;
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .amed-nav-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .amed-logo-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .amed-club-logo {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .amed-club-logo-img {
          width: 80%;
          height: 80%;
          object-fit: contain;
        }
        .amed-club-logo-fallback {
          font-size: 10px;
          font-weight: 800;
          color: #fff;
          letter-spacing: 0.05em;
        }
        .amed-nav-sep {
          color: #888;
          font-size: 20px;
        }
        .amed-nav-brand {
          font-size: 16px;
          font-weight: 600;
          color: #fff;
          letter-spacing: -0.01em;
        }
        .amed-nav-cta {
          background: #005c35;
          color: #fff;
          padding: 8px 20px;
          border-radius: 100px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.2s;
        }
        .amed-nav-cta:hover { background: #007a47; }

        /* ── HERO ── */
        .amed-hero-wrap {
          position: relative;
        }
        .amed-hero-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .amed-hero-bg-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .amed-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.45) 100%);
        }
        .amed-hero {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 120px 24px 80px 0;
          max-width: 1200px;
          margin: 0 auto;
          gap: 48px;
        }
        .amed-hero-content {
          flex: 1;
          max-width: 600px;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          padding: 20px 44px;
          border-radius: 16px;
          margin-left: -200px;
          align-self: flex-start;
          margin-top: 40px;
        }
        .amed-hero-badge {
          display: inline-block;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.75);
          padding: 6px 16px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.02em;
          margin-bottom: 28px;
        }
        .amed-hero-h1 {
          font-size: clamp(42px, 6vw, 76px);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -0.03em;
          margin-bottom: 24px;
          color: #fff;
        }
        .amed-hero-h1 em {
          font-style: normal;
          color: #fff;
        }
        .amed-hero-sub {
          font-size: 18px;
          line-height: 1.7;
          color: rgba(255,255,255,0.75);
          margin-bottom: 40px;
        }
        .amed-br { display: none; }
        @media (min-width: 768px) { .amed-br { display: inline; } }
        .amed-hero-btns {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }
        .amed-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #005c35;
          color: #fff;
          padding: 14px 32px;
          border-radius: 100px;
          font-size: 16px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s;
          border: 2px solid transparent;
        }
        .amed-btn-primary:hover {
          background: #007a47;
          transform: translateY(-1px);
        }
        .amed-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          color: #fff;
          padding: 14px 32px;
          border-radius: 100px;
          font-size: 16px;
          font-weight: 600;
          text-decoration: none;
          border: 2px solid rgba(255,255,255,0.25);
          transition: all 0.2s;
        }
        .amed-btn-ghost:hover {
          border-color: rgba(255,255,255,0.6);
          background: rgba(255,255,255,0.05);
        }
        .amed-hero-mockup {
          flex-shrink: 0;
          width: 320px;
        }
        .amed-mockup-img {
          width: 100%;
          border-radius: 16px;
          box-shadow: 0 40px 80px rgba(0,0,0,0.5);
        }
        @media (max-width: 900px) {
          .amed-hero { flex-direction: column; text-align: center; padding: 100px 20px 60px; }
          .amed-hero-content { margin-left: 0; max-width: 100%; }
          .amed-hero-btns { justify-content: center; }
          .amed-hero-mockup { width: 240px; }
        }
        @media (max-width: 600px) {
          .amed-nav-inner { padding: 0 16px; }
          .amed-nav-brand { font-size: 13px; }
          .amed-nav-sep { font-size: 15px; }
          .amed-club-logo { width: 26px; height: 26px; }
          .amed-logo-group { gap: 7px; }
          .amed-nav-cta { padding: 7px 14px; font-size: 13px; white-space: nowrap; }
        }
        @media (max-width: 420px) {
          .amed-nav-brand { display: none; }
          .amed-nav-sep { display: none; }
          .amed-hero-content { padding: 16px 18px; }
          .amed-hero-btns { flex-direction: column; align-items: center; }
          .amed-btn-primary, .amed-btn-ghost { width: 100%; justify-content: center; }
          .amed-footer-bottom { flex-direction: column; align-items: flex-start; gap: 8px; }
          .amed-footer-legal { gap: 12px; flex-wrap: wrap; }
        }

        /* ── STATS ── */
        .amed-stats {
          background: #005c35;
          padding: 48px 24px;
        }
        .amed-stats-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          text-align: center;
        }
        @media (max-width: 640px) {
          .amed-stats-inner { grid-template-columns: repeat(2, 1fr); }
        }
        .amed-stat-n {
          display: block;
          font-size: 36px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.02em;
        }
        .amed-stat-label {
          display: block;
          font-size: 14px;
          color: rgba(255,255,255,0.7);
          margin-top: 4px;
        }

        /* ── SECTIONS ── */
        .amed-section-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .amed-section-head {
          text-align: center;
          margin-bottom: 56px;
        }
        .amed-tag {
          display: inline-block;
          background: rgba(0,92,53,0.25);
          border: 1px solid rgba(74,222,128,0.3);
          color: #4ade80;
          padding: 4px 14px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 16px;
        }
        .amed-section-h2 {
          font-size: clamp(28px, 4vw, 44px);
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #fff;
        }

        /* ── KAPAK TASARLA ── */
        .amed-kapsec {
          padding: 96px 0;
          background: #111;
        }
        .amed-kapsec-inner {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: center;
        }
        @media (max-width: 900px) {
          .amed-kapsec-inner { grid-template-columns: 1fr; gap: 40px; }
        }
        .amed-kapsec-desc {
          font-size: 16px;
          line-height: 1.8;
          color: rgba(255,255,255,0.65);
          margin-top: 16px;
        }
        .amed-kapsec-preview {
          display: flex;
          justify-content: center;
        }
        .amed-kapsec-mockup {
          position: relative;
          width: 260px;
        }
        .amed-kapsec-mockup-img {
          width: 100%;
          border-radius: 12px;
          box-shadow: 0 32px 64px rgba(0,0,0,0.5);
        }
        .amed-kapsec-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #005c35;
          border-radius: 100px;
          padding: 14px 28px;
          white-space: nowrap;
          font-size: 17px;
          font-weight: 600;
          color: #fff;
          box-shadow: 0 8px 24px rgba(0,92,53,0.4);
        }
        .amed-kapsec-badge-logo {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          object-fit: contain;
          background: #fff;
        }

        /* ── HOW ── */
        .amed-how {
          padding: 96px 0;
          background: #111;
        }
        .amed-steps {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        @media (max-width: 768px) {
          .amed-steps { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
          .amed-steps { grid-template-columns: 1fr; }
        }
        .amed-step {
          background: #1a1a1a;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 32px 24px;
          transition: border-color 0.2s;
        }
        .amed-step:hover { border-color: rgba(0,92,53,0.5); }
        .amed-step-n {
          font-size: 48px;
          font-weight: 900;
          color: rgba(0,92,53,0.4);
          line-height: 1;
          display: block;
          margin-bottom: 16px;
        }
        .amed-step-title {
          font-size: 20px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 8px;
        }
        .amed-step-desc {
          font-size: 15px;
          color: rgba(255,255,255,0.55);
          line-height: 1.6;
        }

        /* ── GALLERY ── */
        .amed-gallery {
          padding: 96px 0;
          background: #0a0a0a;
        }
        .amed-gallery-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        @media (max-width: 768px) {
          .amed-gallery-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
          .amed-gallery-grid { grid-template-columns: 1fr; }
        }
        .amed-gallery-card {
          border-radius: 12px;
          overflow: hidden;
          background: #1a1a1a;
          border: 1px solid rgba(255,255,255,0.07);
        }
        .amed-gallery-img {
          width: 100%;
          height: auto;
          display: block;
          transition: transform 0.3s;
        }
        .amed-gallery-card:hover .amed-gallery-img { transform: scale(1.04); }
        .amed-gallery-placeholder {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.2);
          font-size: 14px;
        }

        /* ── TESTIMONIALS ── */
        .amed-testimonials {
          padding: 96px 0;
          background: #111;
        }
        .amed-tcard-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        @media (max-width: 768px) {
          .amed-tcard-grid { grid-template-columns: 1fr; }
        }
        .amed-tcard {
          background: #1a1a1a;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 28px;
        }
        .amed-tcard-text {
          font-size: 16px;
          line-height: 1.7;
          color: rgba(255,255,255,0.8);
          margin-bottom: 24px;
          font-style: italic;
        }
        .amed-tcard-footer {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .amed-tcard-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #005c35;
          flex-shrink: 0;
        }
        .amed-tcard-name {
          font-size: 15px;
          font-weight: 700;
          color: #fff;
        }
        .amed-tcard-role {
          font-size: 13px;
          color: rgba(255,255,255,0.45);
        }

        /* ── HEDİYE KARTI ── */
        .amed-gift {
          padding: 96px 0;
          background: #111;
        }
        .amed-gift-inner {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: center;
        }
        @media (max-width: 900px) {
          .amed-gift-inner { grid-template-columns: 1fr; gap: 40px; }
        }
        .amed-gift-desc {
          font-size: 16px;
          line-height: 1.8;
          color: rgba(255,255,255,0.65);
          margin-top: 16px;
        }
        .amed-gift-bullets {
          list-style: none;
          margin-top: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .amed-gift-bullets li {
          font-size: 15px;
          color: rgba(255,255,255,0.75);
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .amed-gift-card-wrap {
          display: flex;
          justify-content: center;
        }
        .amed-gift-card {
          width: 320px;
          height: 200px;
          background: linear-gradient(135deg, #003d22 0%, #005c35 60%, #00804a 100%);
          border-radius: 20px;
          padding: 24px 28px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 0 24px 60px rgba(0,92,53,0.45), 0 0 0 1px rgba(255,255,255,0.08);
          position: relative;
          overflow: hidden;
        }
        .amed-gift-card::before {
          content: '';
          position: absolute;
          top: -60px; right: -60px;
          width: 200px; height: 200px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
        }
        .amed-gift-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .amed-gift-card-logos {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .amed-gift-card-logo {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #fff;
          object-fit: contain;
        }
        .amed-gift-card-x {
          color: rgba(255,255,255,0.5);
          font-size: 14px;
        }
        .amed-gift-card-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.6);
          border: 1px solid rgba(255,255,255,0.2);
          padding: 4px 10px;
          border-radius: 100px;
        }
        .amed-gift-card-body { }
        .amed-gift-card-title {
          font-size: 18px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.01em;
        }
        .amed-gift-card-sub {
          font-size: 13px;
          color: rgba(255,255,255,0.55);
          margin-top: 4px;
        }
        .amed-gift-card-footer {
          font-size: 12px;
          font-weight: 600;
          color: rgba(255,255,255,0.45);
          letter-spacing: 0.04em;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* ── SSS ── */
        .amed-faq {
          padding: 96px 0;
          background: #0a0a0a;
        }
        .amed-faq-list {
          max-width: 760px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .amed-faq-item {
          background: #1a1a1a;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          overflow: hidden;
          transition: border-color 0.2s;
        }
        .amed-faq-item[open] {
          border-color: rgba(0,92,53,0.5);
        }
        .amed-faq-q {
          padding: 22px 28px;
          font-size: 16px;
          font-weight: 600;
          color: #fff;
          cursor: pointer;
          list-style: none;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          user-select: none;
        }
        .amed-faq-q::-webkit-details-marker { display: none; }
        .amed-faq-q::after {
          content: '+';
          font-size: 22px;
          color: #4ade80;
          flex-shrink: 0;
          line-height: 1;
          transition: transform 0.2s;
        }
        .amed-faq-item[open] .amed-faq-q::after {
          transform: rotate(45deg);
        }
        .amed-faq-a {
          padding: 0 28px 22px;
          font-size: 15px;
          line-height: 1.8;
          color: rgba(255,255,255,0.6);
        }

        /* ── HAKKIMIZDA ── */
        .amed-about {
          padding: 96px 0;
          background: #0a0a0a;
        }
        .amed-about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .amed-about-grid { grid-template-columns: 1fr; gap: 40px; }
        }
        .amed-about-p {
          font-size: 16px;
          line-height: 1.8;
          color: rgba(255,255,255,0.7);
          margin-bottom: 16px;
        }
        .amed-about-visual {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .amed-about-card {
          background: #1a1a1a;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 24px;
        }
        .amed-about-card--green {
          border-color: rgba(0,92,53,0.5);
          background: rgba(0,92,53,0.12);
        }
        .amed-about-card-icon {
          font-size: 28px;
          margin-bottom: 10px;
        }
        .amed-about-card h3 {
          font-size: 18px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 8px;
        }
        .amed-about-card p {
          font-size: 14px;
          color: rgba(255,255,255,0.55);
          line-height: 1.6;
        }

        /* ── Referanslar ── */
        .amed-refs {
          padding: 80px 24px;
          background: #f9f9f7;
          text-align: center;
        }
        .amed-refs-inner { max-width: 1100px; margin: 0 auto; }
        .amed-refs-eyebrow {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #005c35;
          margin-bottom: 8px;
        }
        .amed-refs-title {
          font-size: clamp(22px, 3vw, 32px);
          font-weight: 700;
          color: #111;
          margin-bottom: 48px;
        }
        .amed-refs-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 24px 32px;
          align-items: center;
          justify-items: center;
        }
        .amed-ref-item {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px;
          width: 100%;
        }
        .amed-ref-img {
          max-width: 110px;
          max-height: 56px;
          width: 100%;
          height: auto;
          object-fit: contain;
          filter: grayscale(1) opacity(0.5);
          transition: filter 0.2s;
        }
        .amed-ref-item:hover .amed-ref-img {
          filter: grayscale(0) opacity(1);
        }
        @media (max-width: 900px) {
          .amed-refs-grid { grid-template-columns: repeat(4, 1fr); }
        }
        @media (max-width: 560px) {
          .amed-refs-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; }
          .amed-ref-img { max-width: 72px; max-height: 40px; }
        }

        /* ── CTA ── */
        .amed-cta {
          padding: 96px 24px;
          background: linear-gradient(135deg, #003d22 0%, #005c35 100%);
          text-align: center;
        }
        .amed-cta-inner { max-width: 600px; margin: 0 auto; }
        .amed-cta-h2 {
          font-size: clamp(28px, 4vw, 44px);
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #fff;
          margin-bottom: 16px;
        }
        .amed-cta-sub {
          font-size: 18px;
          color: rgba(255,255,255,0.7);
          margin-bottom: 40px;
        }
        .amed-cta-btn {
          font-size: 18px;
          padding: 16px 40px;
          background: #fff;
          color: #005c35;
        }
        .amed-cta-btn:hover {
          background: #f0fdf4;
          transform: translateY(-2px);
        }

        /* ── FOOTER ── */
        .amed-footer {
          background: #0a0a0a;
          color: #a0a0a0;
        }
        .amed-footer-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 4rem 24px 2rem;
        }
        .amed-footer-top {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 3rem;
          padding-bottom: 3rem;
          border-bottom: 1px solid #1e1e1e;
        }
        @media (max-width: 900px) {
          .amed-footer-top { grid-template-columns: 1fr 1fr; gap: 2rem; }
          .amed-footer-brand-col { grid-column: 1 / -1; }
        }
        @media (max-width: 480px) {
          .amed-footer-top { grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        }
        .amed-footer-tagline {
          font-size: 13px;
          color: #aaa;
          line-height: 1.65;
          margin-bottom: 1.25rem;
          max-width: 240px;
        }
        .amed-footer-social {
          display: flex;
          gap: 10px;
        }
        .amed-footer-social-link {
          color: #555;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border: 1px solid #222;
          border-radius: 6px;
          transition: color 0.15s, border-color 0.15s;
        }
        .amed-footer-social-link:hover { color: #fff; border-color: #555; }
        .amed-footer-col {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .amed-footer-col-title {
          font-size: 12px;
          font-weight: 600;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 4px;
        }
        .amed-footer-link {
          font-size: 13px;
          color: #707070;
          text-decoration: none;
          transition: color 0.15s;
        }
        .amed-footer-link:hover { color: #d0d0d0; }
        .amed-footer-payment {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          padding: 20px 0;
          border-bottom: 1px solid #1e1e1e;
          margin-bottom: 20px;
        }
        .amed-footer-pay-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          background: #fff;
          border-radius: 5px;
          padding: 5px 10px;
          height: 32px;
        }
        .amed-footer-pay-iyzico {
          font-size: 12px;
          font-weight: 700;
          color: #111;
          gap: 3px;
        }
        .amed-footer-pay-ile {
          font-size: 10px;
          font-weight: 400;
          color: #555;
        }
        .amed-footer-pay-ssl {
          font-size: 11px;
          font-weight: 600;
          color: #2a7a2a;
          background: #f0faf0;
          border: 1px solid #c8e6c9;
          gap: 5px;
        }
        .amed-footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          font-size: 12px;
          color: #fff;
        }
        .amed-footer-legal {
          display: flex;
          gap: 24px;
        }
        .amed-footer-legal-link {
          font-size: 12px;
          color: #ccc;
          text-decoration: none;
          transition: color 0.15s;
        }
        .amed-footer-legal-link:hover { color: #fff; }
      `}</style>
    </div>
  );
}
