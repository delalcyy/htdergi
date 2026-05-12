import { prisma } from "@/lib/prisma";
import RoportajKategoriYonetim from "@/components/admin/RoportajKategoriYonetim";

export const metadata = { title: "Röportaj Kategorileri | Admin" };

export default async function RoportajKategorileriPage() {
  const categories = await prisma.interviewCategory.findMany({
    orderBy: { orderIndex: "asc" },
    include: {
      questions: {
        where: { isActive: true },
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  return (
    <div>
      <h1 className="admin-section-title">Röportaj Kategorileri ve Soruları</h1>
      <RoportajKategoriYonetim categories={categories} />
    </div>
  );
}
