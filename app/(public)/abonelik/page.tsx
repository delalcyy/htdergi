import "@/styles/abonelik.css";
import { prisma } from "@/lib/prisma";
import AbonelikStaticContent from "@/components/abonelik/AbonelikStaticContent";
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

  return <AbonelikStaticContent plans={plans} />;
}
