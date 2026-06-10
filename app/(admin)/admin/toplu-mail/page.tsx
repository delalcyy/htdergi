import { prisma } from "@/lib/prisma";
import TopluMailForm from "@/components/admin/TopluMailForm";

export const metadata = { title: "Toplu Mail | Admin" };

export default async function TopluMailPage() {
  const toplamKullanici = await prisma.user.count({
    where: { emailVerified: true, deletedAt: null, status: "ACTIVE", emailMarketingConsent: true },
  });

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>Toplu Mail Gönder</h1>
        <p style={{ color: "#6b7280", fontSize: 14, marginTop: 6 }}>
          Yalnızca e-posta bildirimi iznini kabul etmiş aktif kullanıcılara mail gönderilir.
        </p>
      </div>
      <TopluMailForm toplamKullanici={toplamKullanici} />
    </div>
  );
}
