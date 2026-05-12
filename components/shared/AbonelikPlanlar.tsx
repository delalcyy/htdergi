"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import type { SubscriptionPlan } from "@prisma/client";

type Props = {
  plans: SubscriptionPlan[];
};

const HIGHLIGHT_KEYS: Record<string, string> = {
  Standart: "featured_popular",
  Yıllık: "featured_value",
};

export default function AbonelikPlanlar({ plans }: Props) {
  const router = useRouter();
  const { t } = useTranslation("common");

  function handleSelect(planId: string) {
    router.push(`/kapak-tasarla/bilgi-formu?planId=${planId}`);
  }

  if (plans.length === 0) {
    return (
      <p style={{ textAlign: "center", color: "#6b7280", padding: "40px 0" }}>
        {t("subscription.noPlans")}
      </p>
    );
  }

  return (
    <div className="ab-plans-grid">
      {plans.map((plan) => {
        const meta = t(`planFeatures.${plan.name}`, { returnObjects: true }) as {
          badge: string;
          tagline: string;
          features: string[];
        } | null;

        const badge = meta?.badge ?? plan.name;
        const tagline = meta?.tagline ?? "";
        const features = meta?.features ?? [];

        const highlightKey = HIGHLIGHT_KEYS[plan.name];
        const highlight = highlightKey ? t(`subscription.${highlightKey}`) : undefined;
        const isFeatured = !!highlight;

        const period =
          plan.durationDays === 365
            ? t("subscription.perYear")
            : plan.durationDays === 30
            ? t("subscription.perMonth")
            : t("subscription.perDays", { days: plan.durationDays });

        return (
          <div key={plan.id} className={`ab-plan-card${isFeatured ? " ab-featured" : ""}`}>
            {isFeatured && <div className="ab-featured-band">{highlight}</div>}
            <div className="ab-card-body">
              <span className="ab-badge">{badge}</span>
              <div className="ab-plan-name">{plan.name}</div>
              <div className="ab-plan-tagline">{tagline}</div>

              <div className="ab-plan-price-row">
                <span className="ab-currency">₺</span>
                <span className="ab-price">{Number(plan.price).toLocaleString("tr-TR")}</span>
                <span className="ab-period">/ {period}</span>
              </div>

              <ul className="ab-features">
                {features.map((f) => (
                  <li key={f}>
                    <span className="ab-check">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button onClick={() => handleSelect(plan.id)} className="ab-plan-btn">
                {t("subscription.selectBtn")} <span className="ab-btn-arr">→</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
