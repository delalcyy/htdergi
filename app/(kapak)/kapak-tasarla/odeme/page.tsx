import "@/styles/kapak.css";
import { Suspense } from "react";
import OdemeFormu from "@/components/kapak/OdemeFormu";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const metadata = { title: "Ödeme | Hatıra Dergi" };

type Props = {
  searchParams: Promise<{ planId?: string; type?: string }>;
};

export default async function OdemePage({ searchParams }: Props) {
  const user = await getSessionUser();
  const params = await searchParams;
  if (!user) {
    const { planId: pid, type: t } = params;
    const qs = new URLSearchParams();
    if (pid) qs.set("planId", pid);
    if (t) qs.set("type", t);
    const from = `/kapak-tasarla/odeme?${qs.toString()}`;
    redirect(`/auth/giris?from=${encodeURIComponent(from)}`);
  }
  const { planId, type } = params;

  let plan = null;
  if (planId) {
    plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId, isActive: true },
    });
    if (!plan) redirect("/abonelik");
  }

  return (
    <div className="kapak-page">
      <div className="kapak-container">
        <div className="kapak-header">
          <h1>Ödeme</h1>
          <p>
            {plan
              ? `${plan.name} aboneliği — ₺${Number(plan.price).toLocaleString("tr-TR")}`
              : "Kapak satın alımı"}
          </p>
        </div>
        <Suspense fallback={<div>Yükleniyor...</div>}>
          <OdemeFormu
            planId={planId || null}
            purchaseType={(type as "subscription" | "cover") || "cover"}
            planPrice={plan ? Number(plan.price) : null}
          />
        </Suspense>
      </div>
    </div>
  );
}
