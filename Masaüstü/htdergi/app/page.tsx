import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import GaleriSlider from "@/components/anasayfa/GaleriSlider";
import "@/styles/anasayfa.css";

export const metadata = {
  title: "Hatıra Dergi — Kendi Derginizi Tasarlayın",
  description: "Dergi kapağının yıldızı siz olun. Hikâyenizi yazın, röportajınızı oluşturun.",
};

const steps = [
  { n: "01", title: "Kayıt Olun",       desc: "Adınızı, e-postanızı ve şifrenizi girerek ücretsiz hesap oluşturun." },
  { n: "02", title: "Abone Olun",       desc: "Adres bilgilerinizi tamamlayın ve üyeliğinizi başlatın." },
  { n: "03", title: "Kapak Tasarlayın", desc: "Kategorinizi seçin, fotoğraflarınızı yükleyin ve röportaj sorularını doldurun." },
  { n: "04", title: "PDF'inizi Alın",   desc: "Kişisel dergi sayfanız anında oluşturulur, indirmeye hazır." },
];

const categories = ["Doğum Günü", "Evlilik", "Kariyer", "Bebek", "Mezuniyet"];

const testimonials = [
  { name: "Elif K.",    title: "İstanbul",  text: "Eşime doğum günü sürprizi olarak hazırladım. Kendi fotoğrafını  fashiontv dergisi üzerinde görünce çok şaşırdı. Röportaj kısmını okuyunca daha da duygulandı. Şimdi evde en görünür yerde duruyor. " },
  { name: "Murat B.",   title: "İstanbul",  text: "Mezuniyetim için yaptırdım. Açıkçası fotoğrafımın kapak da bu kadar iyi duracağını beklemiyordum. Sayfaları görünce arkadaşlarım gerçekten kapakta yer aldığımı düşündü. En çok da röportaj kısmı çok hoşlarına gitti." },
  { name: "Selin T.",   title: "Ankara",    text: "Annem için hazırladım. Kendi fotoğrafını fashiontv magazine derginin kapağında görünce uzun süre inanamadı. Röportaj kısmını herkese tek tek okutuyor. Sonunda çerçeveletip salona astı" },
  { name: "Ahmet Y.",   title: "İzmir",     text: "Sevgilim için farklı bir sürpriz yapmak istedim. Kendi kapağıyla Fashiontv Magazinenin kapağında  yer aldığını görmesi çok hoşuna gitti. Röportaj sayfalarını görünce uzun süre elinden bırakmadı. Gerçekten çok özel bir hediye oldu." },
  { name: "Zeynep D.",  title: "Yeni Anne", text: "Bebeğimiz doğduktan sonra anı olarak yaptırdık. Yıllar sonra açıp bakacağımız çok özel bir hatıra oldu. Kapakta kendi ailemizi görmek çok güzel hissettirdi. " },
  { name: "Ceren A.",   title: "Bursa",     text: "Babamın kariyer yıldönümü için hazırladım. İlk görünce şaşırdı, sonra röportaj kısmını sessizce okumaya başladı. Sonunda “bunu saklayacağım” dedi. O an her şeye değdi." },
];

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="hp">

        {/* ── Hero ── */}
        <section className="hp-hero">
          <div className="hp-hero-wrap">
            <div className="hp-hero-left">
              <div className="hp-kicker">
                <span className="hp-kicker-dot" />
                Herkes Kendi Dergisinin Kapağı Olabilir
              </div>
             <h1 className="hp-h1">
  Bir Gün Herkes<br />
  <em>Ünlü Olacak</em>
  <span className="hp-h1-rule" />
  <span className="hp-h1-author">Andy Warhol</span>
</h1>
              <p className="hp-lede">
                fashiontv magazine kapağının yıldızı siz olun. Hikâyenizi yazın, röportajınızı oluşturun ve lüks bir lifestyle dergide yerinizi alın.
              </p>
              <div className="hp-hero-btns">
                <Link href="/auth/kayit" className="hp-btn-primary">
                  Hemen Başla <span className="hp-arr">→</span>
                </Link>
                <Link href="/abonelik" className="hp-btn-ghost">Planları Gör</Link>
              </div>
            </div>

            <div className="hp-hero-right">
              <div className="hp-cover-stage">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/kapak.png" alt="Örnek Kapak" className="hp-cover-img" />
              </div>
            </div>
          </div>
        </section>

        {/* ── Marquee ── */}
        <div className="hp-marquee">
          <div className="hp-marquee-track">
            {[...Array(2)].map((_, gi) =>
              categories.map((c, i) => (
                <span key={`${gi}-${i}`}>
                  {c} <span className="hp-sep">✦</span>{" "}
                </span>
              ))
            )}
          </div>
        </div>

        {/* ── Nasıl Çalışır ── */}
        <section className="hp-section" id="nasil-calisir">
          <div className="hp-section-wrap">
            <div className="hp-section-head">
              <div>
                <span className="hp-eyebrow">Nasıl Çalışır</span>
                <h2 className="hp-section-title">Dört Adımda <em>Kendi Derginiz</em></h2>
              </div>
              <p className="hp-section-lede">
                Kapak tasarla, röportajını oluştur ve birkaç dakika içinde kapak yıldızı ol.
              </p>
            </div>
            <div className="hp-steps-grid">
              {steps.map((s) => (
                <div key={s.n} className="hp-step">
                  <span className="hp-step-n">{s.n}</span>
                  <h3 className="hp-step-title">{s.title}</h3>
                  <p className="hp-step-desc">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Kategoriler ── */}
        <section className="hp-section hp-section-warm">
          <div className="hp-section-wrap">
            <div className="hp-section-head">
              <div>
                <span className="hp-eyebrow">Kategoriler</span>
                <h2 className="hp-section-title">Her Özel Ana <em>Özel Bir Sayfa</em></h2>
              </div>
            </div>
            <div className="hp-cats">
              {categories.map((c, i) => (
                <Link key={c} href="/kapak-tasarla" className="hp-cat-card">
                  <span className="hp-cat-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="hp-cat-name">{c}</span>
                  <span className="hp-cat-arr">→</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Galeri ── */}
        <section className="hp-section">
          <div className="hp-section-wrap">
            <div className="hp-section-head">
              <div>
                <span className="hp-eyebrow">Galeri</span>
                <h2 className="hp-section-title">Anlarınızdan <em>Kareler</em></h2>
              </div>
            </div>
            <GaleriSlider />
          </div>
        </section>

        {/* ── Yorumlar ── */}
        <section className="hp-section hp-section-warm">
          <div className="hp-section-wrap">
            <div className="hp-section-head">
              <div>
                <span className="hp-eyebrow">Yorumlar</span>
                <h2 className="hp-section-title">Kullanıcılarımız <em>Ne Diyor?</em></h2>
              </div>
            </div>
            <div className="hp-testimonials-grid">
              {testimonials.map((t) => (
                <div key={t.name} className="hp-testimonial-card">
                  <div className="hp-testimonial-quote">"</div>
                  <p className="hp-testimonial-text">{t.text}</p>
                  <div className="hp-testimonial-footer">
                    <span className="hp-testimonial-name">{t.name}</span>
                    <span className="hp-testimonial-title">{t.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="hp-cta">
          <div className="hp-section-wrap hp-cta-inner">
            <h2 className="hp-cta-title">Hikâyenizi Dünyayla <em>Paylaşın</em></h2>
            <p className="hp-cta-sub">Hemen kayıt olun, ilk sayfanızı oluşturun.</p>
            <Link href="/auth/kayit" className="hp-btn-primary hp-btn-lg">
              Ücretsiz Başla <span className="hp-arr">→</span>
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
