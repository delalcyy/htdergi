import Link from "next/link";
import "@/styles/nasilcalisir.css";

export const metadata = {
  title: "Nasıl Çalışır | Hatıra Dergi",
  description: "Kapak tasarımından PDF'e kadar adım adım nasıl çalışır.",
};

const steps = [
  {
    num: "01",
    tag: "Birinci Adım",
    cardTitle: "Kapak Tasarla",
    cardDesc: "Editörü aç, fotoğrafını yükle ve kapağını kişiselleştir. Arka plan, logo rengi, yazılar, fontlar — her şey senin elinde.",
    title: "Kapağını",
    titleEm: "Tasarla",
    desc: "Kapak editörüne girdiğinde seni tam donanımlı bir tasarım arayüzü karşılar. Fotoğrafını yükle, dilediğin arka plan rengini seç, logo rengini ayarla ve kapağın üzerine istediğin yazıları ekle.",
    bullets: [
      "Fotoğrafını yükle — kapak otomatik çerçevelenir",
      "6 arka plan rengi arasından seçim yap (Siyah, Antrasit, Gri, Krem, Beyaz, Altın)",
      "Logo rengini belirle (Orijinal, Altın, Gümüş, Siyah, Açık Mavi, Pembe)",
      "Kapağa yazı ekle, sürükle & bırak ile istediğin yere taşı",
      "7 farklı font seçeneğiyle yazı stilini özelleştir",
    ],
    chips: ["Fotoğraf Yükle", "Arka Plan Seç", "Logo Rengi", "Yazı Ekle", "Sürükle & Bırak", "Font Seçimi"],
  },
  {
    num: "02",
    tag: "İkinci Adım",
    cardTitle: "Röportaja Geç & Kategori Seç",
    cardDesc: "Kapak tasarımını tamamlayınca Röportaja Geç butonuna tıkla ve anına en uygun kategoriyi seç.",
    title: "Röportaja Geç,",
    titleEm: "Kategori Seç",
    desc: "Kapak tasarımını bitirdiğinde editörden doğrudan röportaj bölümüne geçersin. Burada özel anını en iyi anlatan kategoriyi seçmen yeterli.",
    bullets: [
      "Editördeki 'Röportaja Geç' butonuna tıkla",
      "Doğum Günü, Mezuniyet, Kariyer, Bebek veya Evlilik kategorilerinden birini seç",
      "Her kategori kendine özel sorularla gelir",
      "Kategori seçimi bir kez yapılır, sonradan değiştirilebilir",
    ],
    chips: ["Doğum Günü", "Mezuniyet", "Kariyer", "Bebek", "Evlilik"],
  },
  {
    num: "03",
    tag: "Üçüncü Adım",
    cardTitle: "Fotoğrafını Yükle",
    cardDesc: "Kategoriyi seçtikten sonra röportaj sayfan için fotoğrafını yükle. Bu fotoğraf dergi içi sayfanda yer alır.",
    title: "Fotoğrafını",
    titleEm: "Yükle",
    desc: "Kategoriyi seçtikten sonra röportaj sayfan için ayrı bir fotoğraf yüklersin. Bu fotoğraf dergi iç sayfalarında kullanılır ve kapak fotoğrafından bağımsız olabilir.",
    bullets: [
      "Röportaj sayfan için net ve aydınlık bir fotoğraf seç",
      "Dikey (portre) formatta fotoğraflar en iyi sonucu verir",
      "En az 1500×2000 piksel çözünürlük önerilir",
      "Telefon galerisinden ya da bilgisayardan yükleyebilirsin",
    ],
    chips: ["Yüksek Çözünürlük", "Dikey Format", "Otomatik Düzenleme"],
  },
  {
    num: "04",
    tag: "Dördüncü Adım",
    cardTitle: "Soruları Cevapla & PDF Al",
    cardDesc: "Kategorine özel soruları doldur, tasarımın anında oluşur ve baskıya hazır PDF'in indirilmeye hazır olur.",
    title: "Soruları Cevapla,",
    titleEm: "PDF'ini Al",
    desc: "Seçtiğin kategoriye göre hazırlanmış röportaj sorularını cevapla. Her cevap dergi sayfana işlenir. Tamamladığında benzersiz seri numaralı PDF'in anında hazır olur.",
    bullets: [
      "Kategoriye özel hazırlanmış soruları kendi kelimelerinle yanıtla",
      "İstediğin soruları atlayabilir ya da yenilerini ekleyebilirsin",
      "Taslak olarak kaydedip daha sonra tamamlayabilirsin",
      "Bitirince 'PDF Oluştur' butonuna tıkla",
      "Benzersiz seri numaralı, baskıya hazır PDF'ini indir",
    ],
    chips: ["Kişisel Sorular", "Taslak Kaydet", "Anında PDF", "Benzersiz Seri No", "Baskıya Hazır"],
  },
];

const tips = [
  {
    num: "01",
    title: "Kapak Fotoğrafı Net Olsun",
    text: "İyi ışıklı, net çekilmiş dikey fotoğraflar en iyi kapak görünümünü verir. Arka planın sade olması kapak yazılarının öne çıkmasını sağlar.",
  },
  {
    num: "02",
    title: "Arka Plan ile Logo Rengini Uyumlu Seç",
    text: "Koyu arka planlarda (Siyah, Antrasit) Altın veya Gümüş logo çok şık durur. Açık arka planlarda (Krem, Beyaz) Siyah logo tercih et.",
  },
  {
    num: "03",
    title: "Yazıları Sürükleyerek Yerleştir",
    text: "Kapak üzerindeki yazıları sürükle & bırak ile tam istediğin yere taşıyabilirsin. Deneme yanılmayla en estetik düzeni bul.",
  },
  {
    num: "04",
    title: "Anına Uygun Kategori Seç",
    text: "Her kategorinin kendine özel soruları ve tasarım öğeleri var. Doğru kategoriyi seçmek röportajını çok daha anlamlı ve kişisel kılar.",
  },
  {
    num: "05",
    title: "Röportajda Dürüst ve Samimi Ol",
    text: "Klişe cevaplar yerine gerçek hislerini anlatan cevaplar ver. Yıllar sonra bu sayfaları okuduğunda o anı canlı hissedeceksin.",
  },
  {
    num: "06",
    title: "Taslak Özelliğini Kullan",
    text: "Her şeyi tek oturumda bitirmek zorunda değilsin. Taslak olarak kaydet, istediğin zaman kaldığın yerden devam et.",
  },
];

export default function NasilCalisirPage() {
  return (
    <div className="nc">

      {/* ── Hero ── */}
      <section className="nc-hero">
        <div className="nc-wrap">
          <div className="nc-hero-inner">
            <div className="nc-hero-eyebrow">Süreç</div>
            <h1 className="nc-hero-title">
              Nasıl <em>Çalışır?</em>
            </h1>
            <p className="nc-hero-desc">
              Kapak tasarımından röportaja, fotoğraf yüklemeden PDF'e —
              dört adımda kendi dergi sayfanı oluştur.
              Ortalama tamamlanma süresi: 15 dakika.
            </p>
            <div className="nc-hero-steps-row">
              {[
                "Kapak Tasarla",
                "Kategori Seç",
                "Fotoğraf Yükle",
                "PDF Al",
              ].map((label, i) => (
                <div key={label} className="nc-hero-step">
                  <span className="nc-hero-step-num">0{i + 1}</span>
                  <span className="nc-hero-step-label">{label}</span>
                  {i < 3 && <span className="nc-hero-step-arrow">→</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Özet Grid ── */}
      <section className="nc-overview">
        <div className="nc-wrap">
          <div className="nc-overview-grid">
            {steps.map((s) => (
              <div key={s.num} className="nc-overview-item">
                <div className="nc-ov-num">{s.num}</div>
                <div className="nc-ov-title">{s.cardTitle}</div>
                <div className="nc-ov-desc">{s.cardDesc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Adım Adım Detaylar ── */}
      {steps.map((step, i) => (
        <section key={step.num} className="nc-step-section">
          <div className="nc-wrap">
            <div className={`nc-step-grid${i % 2 === 1 ? " nc-reverse" : ""}`}>

              <div className="nc-step-visual">
                <div className="nc-step-card">
                  <div className="nc-step-card-num">{step.num}</div>
                  <div className="nc-step-card-inner">
                    <span className="nc-step-card-tag">{step.tag}</span>
                    <h3 className="nc-step-card-title">{step.cardTitle}</h3>
                    <p className="nc-step-card-desc">{step.cardDesc}</p>
                  </div>
                </div>
              </div>

              <div className="nc-step-content">
                <div className="nc-eyebrow">Adım {step.num}</div>
                <h2 className="nc-step-title">
                  {step.title} <em>{step.titleEm}</em>
                </h2>
                <p className="nc-step-desc">{step.desc}</p>
                <ul className="nc-step-bullets">
                  {step.bullets.map((b) => (
                    <li key={b}>
                      <span className="nc-bullet-dot">✓</span>
                      {b}
                    </li>
                  ))}
                </ul>
                <div className="nc-step-chips">
                  {step.chips.map((c) => (
                    <span key={c} className="nc-chip">{c}</span>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>
      ))}

      {/* ── İpuçları ── */}
      <section className="nc-tips">
        <div className="nc-wrap">
          <div className="nc-tips-head">
            <div className="nc-tips-eyebrow">Profesyonel Tüyolar</div>
            <h2 className="nc-tips-title">
              En İyi Sonuç İçin <em>İpuçları</em>
            </h2>
          </div>
          <div className="nc-tips-grid">
            {tips.map((tip) => (
              <div key={tip.num} className="nc-tip-card">
                <div className="nc-tip-num">{tip.num}</div>
                <h3 className="nc-tip-title">{tip.title}</h3>
                <p className="nc-tip-text">{tip.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="nc-cta">
        <div className="nc-wrap">
          <div className="nc-cta-inner">
            <h2 className="nc-cta-title">
              Hazır mısın? <em>Hemen Başla</em>
            </h2>
            <p className="nc-cta-sub">
              15 dakikada kendi dergi kapağını oluştur.
              İlk tasarımın seni şaşırtacak.
            </p>
            <div className="nc-cta-btns">
              <Link href="/kapak-tasarla" className="nc-btn-primary">
                Kapak Tasarla <span className="nc-arr">→</span>
              </Link>
              <Link href="/abonelik" className="nc-btn-ghost">
                Planları Gör <span className="nc-arr">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
