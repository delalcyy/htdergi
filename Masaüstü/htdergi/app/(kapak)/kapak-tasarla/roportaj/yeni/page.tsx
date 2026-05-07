import { redirect } from "next/navigation";
import { getSessionUser, hasEditorAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import KategoriSecim from "@/components/roportaj/KategoriSecim";
import "@/styles/roportaj.css";
import { Suspense } from "react";

export const metadata = { title: "Röportaj — Kategori Seç | Hatıra Dergi" };

export default async function RoportajYeniPage() {
  const user = await getSessionUser();
  if (!user) redirect("/auth/giris");

  // Admin her zaman erişebilir
  if (user.role !== "ADMIN") {
    const hasAccess = await hasEditorAccess(user.id);
    if (!hasAccess) redirect("/kapak-tasarla/bilgi-formu");
  }

  const categories = await prisma.interviewCategory.findMany({
    where: { isActive: true },
    orderBy: { orderIndex: "asc" },
  });

  return (
    <div className="roportaj-page">
      <div className="roportaj-container">
        <div className="roportaj-header">
          <h1>Röportaj</h1>
          <p>Hangi kategoride röportaj yapmak istiyorsunuz?</p>
        </div>
        <Suspense fallback={<div>Yükleniyor...</div>}>
          <KategoriSecim categories={categories} />
        </Suspense>
      </div>
    </div>
  );
}
