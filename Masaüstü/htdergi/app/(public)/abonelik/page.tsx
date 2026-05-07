import Link from "next/link";
import "@/styles/abonelik.css";
import { prisma } from "@/lib/prisma";
import AbonelikPlanlar from "@/components/shared/AbonelikPlanlar";
import type { SubscriptionPlan } from "@prisma/client";

export const metadata = {
  title: "Abonelik Planları | Hatıra Dergi",
  description: "Size uygun paketi seçin ve dergi kapağının yıldızı olun.",
};

const DEMO_PLANS: SubscriptionPlan[] = [
  {
    id: "demo-1",
    name: "Hediye",
    description: "Tek seferlik özel bir hediye için ideal giriş paketi.",
    price: 99 as unknown as SubscriptionPlan["price"],
    durationDays: 30,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "demo-2",
    name: "Başlangıç",
    description: "Kişisel kullanım için en uygun fiyatlı seçenek.",
    price: 149 as unknown as SubscriptionPlan["price"],
    durationDays: 30,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "demo-3",
    name: "Standart",
    description: "Düzenli kullanıcılar için en çok tercih edilen paket.",
    price: 299 as unknown as SubscriptionPlan["price"],
    durationDays: 30,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "demo-4",
    name: "Premium",
    description: "Sınırsız tasarım ve tüm özelliklere tam erişim.",
    price: 499 as unknown as SubscriptionPlan["price"],
    durationDays: 30,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "demo-5",
    name: "Yıllık",
    description: "Yıllık ödeme ile kesintisiz erişim ve maksimum tasarruf.",
    price: 999 as unknown as SubscriptionPlan["price"],
    durationDays: 365,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "demo-6",
    name: "Aile",
    description: "Aile üyeleriyle birlikte anı biriktirmek için özel paket.",
    price: 1499 as unknown as SubscriptionPlan["price"],
    durationDays: 365,
    isActive: true,
    createdAt: new Date(),
  },
];

const infoItems = [
  {
    icon: "◈",
    title: "Anında Erişim",
    text: "Ödemenizin ardından hesabınız aktive olur ve hemen tasarlamaya başlayabilirsiniz.",
  },
  {
    icon: "◇",
    title: "PDF İndirme",
    text: "Tamamlanan her tasarım, baskıya hazır yüksek kaliteli PDF formatında indirilir.",
  },
  {
    icon: "◉",
    title: "Benzersiz Seri No",
    text: "Her kapak tasarımı, size özel üretilen benzersiz bir seri numarasıyla belgelenir.",
  },
  {
    icon: "◌",
    title: "Güvenli Ödeme",
    text: "Tüm ödemeler SSL şifreli altyapı üzerinden işlenir, kartınız güvendedir.",
  },
  {
    icon: "◐",
    title: "7/24 Destek",
    text: "Herhangi bir sorun yaşarsanız destek ekibimiz her zaman yanınızdadır.",
  },
  {
    icon: "◑",
    title: "İptal Kolaylığı",
    text: "İstediğiniz zaman aboneliğinizi iptal edebilirsiniz, ek ücret alınmaz.",
  },
];

const faqs = [
  {
    q: "Hangi planı seçmeliyim?",
    a: "Tek bir özel an için tasarım yapacaksanız Hediye veya Başlangıç paketi yeterlidir. Düzenli kullanıcılar için Standart, sınırsız kullanım isteyenler için Premium veya Yıllık paketi tavsiye ederiz.",
  },
  {
    q: "Tasarımımı baskıya gönderebilir miyim?",
    a: "Evet. Tüm planlarda tasarımınız baskıya hazır yüksek çözünürlüklü PDF olarak oluşturulur. Dilediğiniz matbaada bastırabilirsiniz.",
  },
  {
    q: "Paket süresi dolarsa ne olur?",
    a: "Süre dolduğunda yeni tasarım oluşturma hakkınız askıya alınır; ancak mevcut tasarımlarınıza ve indirme geçmişinize erişmeye devam edersiniz.",
  },
  {
    q: "Röportaj soruları önceden belirlenmiş mi?",
    a: "Evet, kategoriye göre hazırlanmış sorularımız var. Aynı zamanda istediğiniz soruları kendiniz de ekleyebilirsiniz.",
  },
  {
    q: "Aile paketi kaç kişi için geçerli?",
    a: "Aile paketi tek bir hesap altında 5 farklı kullanıcı profiline imkân tanır. Her profil bağımsız tasarım yapabilir.",
  },
  {
    q: "İade politikası nedir?",
    a: "İlk 7 gün içinde herhangi bir tasarım oluşturmamışsanız iade talebinde bulunabilirsiniz. Destek ekibimizle iletişime geçmeniz yeterlidir.",
  },
];

export default async function AbonelikPage() {
  let plans: SubscriptionPlan[];

  try {
    plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
    });
    if (plans.length === 0) plans = DEMO_PLANS;
  } catch {
    plans = DEMO_PLANS;
  }

  return (
    <div className="ab">

      {/* ── Hero ── */}
      <section className="ab-hero">
        <div className="ab-wrap">
          <div className="ab-hero-inner">
            <div className="ab-hero-eyebrow">Abonelik Planları</div>
            <h1 className="ab-hero-title">
              Size Uygun <em>Planı</em> Seçin
            </h1>
            <p className="ab-hero-desc">
              Her bütçeye, her ihtiyaca uygun paketlerimizden birini seçin
              ve dakikalar içinde kendi dergi kapağınızı oluşturmaya başlayın.
            </p>
          </div>
        </div>
      </section>

      {/* ── Plans ── */}
      <section className="ab-plans-section">
        <div className="ab-wrap">
          <div className="ab-plans-head">
            <div className="ab-eyebrow">Paketler</div>
            <h2 className="ab-section-title">
              Altı Farklı <em>Seçenek</em>
            </h2>
            <p className="ab-section-lede">
              Tek seferlik bir hediyeden aile planına kadar herkes için bir paket var.
            </p>
          </div>
          <AbonelikPlanlar plans={plans} />
          <p className="ab-compare-note">
            Tüm planlar KDV dahildir · İstediğiniz zaman iptal edebilirsiniz
          </p>
        </div>
      </section>

      {/* ── Bilgilendirme ── */}
      <section className="ab-info">
        <div className="ab-wrap">
          <div className="ab-info-head">
            <div>
              <div className="ab-eyebrow">Neler Dahil?</div>
              <h2 className="ab-section-title">
                Her Pakette <em>Bunları Bulacaksınız</em>
              </h2>
            </div>
            <p className="ab-info-lede">
              Hangi planı seçerseniz seçin, kaliteli bir deneyim için
              gereken tüm temel özellikler eksiksiz sunulur.
            </p>
          </div>
          <div className="ab-info-grid">
            {infoItems.map((item) => (
              <div key={item.title} className="ab-info-item">
                <div className="ab-info-icon">{item.icon}</div>
                <h3 className="ab-info-title">{item.title}</h3>
                <p className="ab-info-text">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SSS ── */}
      <section className="ab-faq">
        <div className="ab-wrap">
          <div className="ab-eyebrow">Sık Sorulan Sorular</div>
          <h2 className="ab-section-title">
            Aklınızdaki <em>Sorular</em>
          </h2>
          <div className="ab-faq-grid">
            {faqs.map((faq) => (
              <div key={faq.q} className="ab-faq-item">
                <div className="ab-faq-q">{faq.q}</div>
                <p className="ab-faq-a">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Güvence ── */}
      <section className="ab-guarantee">
        <div className="ab-wrap">
          <div className="ab-guarantee-inner">
            <div className="ab-guarantee-text-side">
              <div className="ab-eyebrow">Güvencemiz</div>
              <h2 className="ab-guarantee-title">
                Risksiz <em>Deneyin</em>
              </h2>
              <p className="ab-guarantee-desc">
                İlk 7 gün içinde memnun kalmazsanız ve henüz tasarım
                oluşturmadıysanız ücretin tamamını iade ediyoruz.
                Ödemenizi güvenle yapın, kaybedecek hiçbir şeyiniz yok.
              </p>
            </div>

            <div className="ab-guarantee-badges">
              <div className="ab-guarantee-badge">
                <span className="ab-badge-icon">◈</span>
                <div className="ab-badge-text">
                  <span className="ab-badge-label">7 Gün İade Garantisi</span>
                  <span className="ab-badge-sub">Memnun değilseniz iade ediyoruz</span>
                </div>
              </div>
              <div className="ab-guarantee-badge">
                <span className="ab-badge-icon">◇</span>
                <div className="ab-badge-text">
                  <span className="ab-badge-label">SSL Güvenli Ödeme</span>
                  <span className="ab-badge-sub">256-bit şifreleme ile korumalı</span>
                </div>
              </div>
              <div className="ab-guarantee-badge">
                <span className="ab-badge-icon">◉</span>
                <div className="ab-badge-text">
                  <span className="ab-badge-label">İstediğiniz Zaman İptal</span>
                  <span className="ab-badge-sub">Bağlayıcılık yok, gizli ücret yok</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
