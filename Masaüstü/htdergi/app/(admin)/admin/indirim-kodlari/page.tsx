import { prisma } from "@/lib/prisma";
import IndirimKoduYonetim from "@/components/admin/IndirimKoduYonetim";

export const metadata = { title: "İndirim Kodları | Admin" };

export default async function IndirimKodlariPage() {
  const codes = await prisma.discountCode.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { usages: true } } },
  });

  const plans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
  });

  return (
    <div>
      <h1 className="admin-section-title">İndirim Kodları</h1>
      <IndirimKoduYonetim codes={codes} plans={plans} />
    </div>
  );
}
