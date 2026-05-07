/**
 * Admin kullanıcı oluşturma scripti.
 * Kullanım: ADMIN_EMAIL=... ADMIN_PASSWORD=... npx ts-node src/scripts/seed-admin.ts
 *
 * Credentials .env içine YAZILMAZ. Çalıştırma anında env var olarak geçilir.
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email    = process.env["ADMIN_EMAIL"];
  const password = process.env["ADMIN_PASSWORD"];

  if (!email || !password) {
    console.error("Hata: ADMIN_EMAIL ve ADMIN_PASSWORD env var olarak geçilmeli.");
    console.error("Örnek: ADMIN_EMAIL=admin@ornek.com ADMIN_PASSWORD=güçlüŞifre npx ts-node src/scripts/seed-admin.ts");
    process.exit(1);
  }

  if (password.length < 12) {
    console.error("Hata: Admin şifresi en az 12 karakter olmalıdır.");
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.role === "ADMIN") {
      console.log(`Admin zaten var: ${email}`);
    } else {
      await prisma.user.update({
        where: { email },
        data: { role: "ADMIN", passwordHash: await bcrypt.hash(password, 14) },
      });
      console.log(`Mevcut kullanıcı admin yapıldı: ${email}`);
    }
    await prisma.$disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(password, 14);
  await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName:     "Admin",
      lastName:      "Kullanıcı",
      role:          "ADMIN",
      status:        "ACTIVE",
      emailVerified: true,
    },
  });

  console.log(`✅ Admin oluşturuldu: ${email}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
