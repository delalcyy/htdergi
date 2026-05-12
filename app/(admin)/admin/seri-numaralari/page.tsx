import { prisma } from "@/lib/prisma";
import SeriNumarasiYonetim from "@/components/admin/SeriNumarasiYonetim";

export const metadata = { title: "Seri Numaraları | Admin" };

type Props = {
  searchParams: Promise<{ durum?: string }>;
};

export default async function SeriNumaralariPage({ searchParams }: Props) {
  const params = await searchParams;
  const durum = params.durum || "ALL";

  const where = durum !== "ALL" ? { status: durum as "UNUSED" | "USED" | "CANCELLED" } : {};

  const codes = await prisma.serialCode.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      usedByUser: { select: { email: true, firstName: true, lastName: true } },
      createdBy: { select: { email: true } },
    },
  });

  return (
    <div>
      <h1 className="admin-section-title">Seri Numaraları</h1>
      <SeriNumarasiYonetim codes={codes} currentFilter={durum} />
    </div>
  );
}
