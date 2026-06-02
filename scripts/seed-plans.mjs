/**
 * Abonelik planlarını veritabanına ekler.
 *
 * Kullanım:
 *   node scripts/seed-plans.mjs
 *
 * Varolan planları güncellemez, sadece eksik olanları ekler.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PLANS = [
  { name: "Hediye",    description: "Tek seferlik özel bir hediye için ideal giriş paketi.",            price: 99,   durationDays: 30  },
  { name: "Başlangıç", description: "Kişisel kullanım için en uygun fiyatlı seçenek.",                  price: 149,  durationDays: 30  },
  { name: "Standart",  description: "Düzenli kullanıcılar için en çok tercih edilen paket.",            price: 299,  durationDays: 30  },
  { name: "Premium",   description: "Sınırsız tasarım ve tüm özelliklere tam erişim.",                  price: 499,  durationDays: 30  },
  { name: "Yıllık",   description: "Yıllık ödeme ile kesintisiz erişim ve maksimum tasarruf.",          price: 999,  durationDays: 365 },
  { name: "Aile",     description: "Aile üyeleriyle birlikte anı biriktirmek için özel paket.",         price: 1499, durationDays: 365 },
];

async function main() {
  console.log("Abonelik planları kontrol ediliyor...\n");

  for (const plan of PLANS) {
    const existing = await prisma.subscriptionPlan.findFirst({
      where: { name: plan.name },
    });

    if (existing) {
      console.log(`⏭  "${plan.name}" zaten var (id: ${existing.id})`);
    } else {
      const created = await prisma.subscriptionPlan.create({
        data: { ...plan, isActive: true },
      });
      console.log(`✓  "${plan.name}" eklendi (id: ${created.id})`);
    }
  }

  console.log("\nTamamlandı.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
