import { prisma } from "@/lib/prisma";
import SablonYonetim from "@/components/admin/SablonYonetim";

export const metadata = { title: "Kapak Şablonları | Admin" };

export default async function SablonlarPage() {
  const templates = await prisma.coverTemplate.findMany({
    orderBy: { orderIndex: "asc" },
  });

  return (
    <div>
      <h1 className="admin-section-title">Kapak Şablonları</h1>
      <SablonYonetim templates={templates} />
    </div>
  );
}
