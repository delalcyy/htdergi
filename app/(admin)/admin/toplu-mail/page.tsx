import { prisma } from "@/lib/prisma";
import TopluMailForm from "@/components/admin/TopluMailForm";

export const metadata = { title: "Toplu Mail | Admin" };

export default async function TopluMailPage() {
  const mailWhere = { emailVerified: true, deletedAt: null, status: "ACTIVE" as const, emailMarketingConsent: true };
  const aktifWhere = { deletedAt: null, status: "ACTIVE" as const };

  const [toplamKullanici, sehirRows, takimRows] = await Promise.all([
    prisma.user.count({ where: mailWhere }),
    prisma.user.findMany({ where: { ...aktifWhere, city: { not: null } }, select: { city: true }, distinct: ["city"], orderBy: { city: "asc" } }),
    prisma.user.findMany({ where: { ...aktifWhere, supportedTeam: { not: null } }, select: { supportedTeam: true }, distinct: ["supportedTeam"], orderBy: { supportedTeam: "asc" } }),
  ]);

  const sehirler = sehirRows.map(r => r.city!);
  const takimlar = takimRows.map(r => r.supportedTeam!);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>Toplu Mail Gönder</h1>
        <p style={{ color: "#6b7280", fontSize: 14, marginTop: 6 }}>
          Yalnızca e-posta bildirimi iznini kabul etmiş aktif kullanıcılara mail gönderilir.
        </p>
      </div>

      <TopluMailForm
        toplamKullanici={toplamKullanici}
        sehirler={sehirler}
        takimlar={takimlar}
      />
    </div>
  );
}
