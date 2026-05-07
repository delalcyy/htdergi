"use client";

import { useRouter } from "next/navigation";
import type { SubscriptionPlan } from "@prisma/client";

type Props = {
  plans: SubscriptionPlan[];
};

const PLAN_META: Record<string, { badge: string; tagline: string; features: string[]; highlight?: string }> = {
  Hediye: {
    badge: "Tek Seferlik",
    tagline: "Bir sürpriz için mükemmel başlangıç",
    features: [
      "1 kapak tasarımı hakkı",
      "Temel şablonlar",
      "PDF olarak indirme",
      "30 günlük erişim",
    ],
  },
  Başlangıç: {
    badge: "Temel",
    tagline: "Kişisel kullanım için uygun seçenek",
    features: [
      "3 kapak tasarımı hakkı",
      "Tüm şablonlar",
      "Röportaj modülü",
      "PDF olarak indirme",
      "30 günlük erişim",
    ],
  },
  Standart: {
    badge: "En Popüler",
    tagline: "Düzenli kullanıcıların tercihi",
    highlight: "En Popüler",
    features: [
      "6 kapak tasarımı hakkı",
      "Tüm şablonlar",
      "Röportaj modülü",
      "Taslak kaydetme",
      "PDF olarak indirme",
      "Kullanıcı paneli",
    ],
  },
  Premium: {
    badge: "Premium",
    tagline: "Tüm özellikler, sınırsız erişim",
    features: [
      "Sınırsız kapak tasarımı",
      "Tüm şablonlar",
      "Röportaj modülü",
      "Taslak kaydetme",
      "Yüksek çözünürlük PDF",
      "Öncelikli destek",
    ],
  },
  Yıllık: {
    badge: "En İyi Değer",
    tagline: "Yıllık ödeme ile maksimum tasarruf",
    highlight: "En İyi Değer",
    features: [
      "Sınırsız kapak tasarımı",
      "Tüm şablonlar",
      "Röportaj modülü",
      "Taslak kaydetme",
      "Yüksek çözünürlük PDF",
      "Öncelikli destek",
      "12 aylık kesintisiz erişim",
    ],
  },
  Aile: {
    badge: "Aile",
    tagline: "Sevdiklerinizle birlikte anı biriktirin",
    features: [
      "5 kullanıcı hesabı",
      "Sınırsız kapak tasarımı",
      "Tüm şablonlar",
      "Röportaj modülü",
      "Taslak kaydetme",
      "Yüksek çözünürlük PDF",
      "Öncelikli destek",
      "Özel seri numarası",
    ],
  },
};

const FALLBACK_META = {
  badge: "Plan",
  tagline: "Hemen başlayın",
  features: [
    "Kapak tasarımı",
    "Röportaj modülü",
    "PDF indirme",
    "Kullanıcı paneli",
  ],
};

export default function AbonelikPlanlar({ plans }: Props) {
  const router = useRouter();

  function handleSelect(planId: string) {
    router.push(`/kapak-tasarla/bilgi-formu?planId=${planId}`);
  }

  if (plans.length === 0) {
    return (
      <p style={{ textAlign: "center", color: "#6b7280", padding: "40px 0" }}>
        Şu anda aktif abonelik paketi bulunmuyor.
      </p>
    );
  }

  return (
    <div className="ab-plans-grid">
      {plans.map((plan) => {
        const meta = PLAN_META[plan.name] ?? FALLBACK_META;
        const isFeatured = !!meta.highlight;
        const period = plan.durationDays === 365 ? "yıl" : plan.durationDays === 30 ? "ay" : `${plan.durationDays} gün`;

        return (
          <div key={plan.id} className={`ab-plan-card${isFeatured ? " ab-featured" : ""}`}>
            {isFeatured && (
              <div className="ab-featured-band">{meta.highlight}</div>
            )}
            <div className="ab-card-body">
              <span className="ab-badge">{meta.badge}</span>
              <div className="ab-plan-name">{plan.name}</div>
              <div className="ab-plan-tagline">{meta.tagline}</div>

              <div className="ab-plan-price-row">
                <span className="ab-currency">₺</span>
                <span className="ab-price">{Number(plan.price).toLocaleString("tr-TR")}</span>
                <span className="ab-period">/ {period}</span>
              </div>

              <ul className="ab-features">
                {meta.features.map((f) => (
                  <li key={f}>
                    <span className="ab-check">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button onClick={() => handleSelect(plan.id)} className="ab-plan-btn">
                Seç & Başla <span className="ab-btn-arr">→</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
