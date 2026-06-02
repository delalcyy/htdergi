/**
 * Admin kullanıcı oluşturma veya email doğrulama scripti.
 *
 * Kullanım:
 *   npm run create-admin -- --email=admin@ornek.com --password=GucluSifre123
 *
 * Sadece email doğrulama (var olan kullanıcı için):
 *   npm run create-admin -- --email=kullanici@ornek.com --verify-only
 */

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const args = process.argv.slice(2);
const get = (key) => {
  const arg = args.find((a) => a.startsWith(`--${key}=`));
  return arg ? arg.split("=").slice(1).join("=") : null;
};
const hasFlag = (key) => args.includes(`--${key}`);

const email = get("email");
const password = get("password");
const verifyOnly = hasFlag("verify-only");

if (!email) {
  console.error("Hata: --email parametresi zorunlu");
  console.error("Örnek: npm run create-admin -- --email=admin@ornek.com --password=GucluSifre123");
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findUnique({ where: { email } });

  if (verifyOnly) {
    if (!existing) {
      console.error(`Kullanıcı bulunamadı: ${email}`);
      process.exit(1);
    }
    await prisma.user.update({
      where: { email },
      data: { emailVerified: true },
    });
    console.log(`✅ E-posta doğrulandı: ${email}`);
    return;
  }

  if (!password || password.length < 8) {
    console.error("Hata: --password en az 8 karakter olmalı");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  if (existing) {
    await prisma.user.update({
      where: { email },
      data: { passwordHash, role: "ADMIN", emailVerified: true, status: "ACTIVE" },
    });
    console.log(`✅ Mevcut kullanıcı admin yapıldı: ${email}`);
  } else {
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: "Admin",
        lastName: "Kullanıcı",
        role: "ADMIN",
        status: "ACTIVE",
        emailVerified: true,
      },
    });
    console.log(`✅ Admin oluşturuldu: ${email}`);
  }
}

main()
  .catch((e) => { console.error("Hata:", e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
