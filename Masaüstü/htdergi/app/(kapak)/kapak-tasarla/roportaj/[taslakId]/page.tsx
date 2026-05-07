import { redirect, notFound } from "next/navigation";
import { getSessionUser, hasEditorAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import RoportajEditor from "@/components/roportaj/RoportajEditor";

export const metadata = { title: "Röportaj Düzenle | Hatıra Dergi" };

type Props = {
  params: Promise<{ taslakId: string }>;
};

export default async function RoportajPage({ params }: Props) {
  const user = await getSessionUser();
  if (!user) redirect("/auth/giris");

  // Admin her zaman erişebilir
  if (user.role !== "ADMIN") {
    const hasAccess = await hasEditorAccess(user.id);
    if (!hasAccess) redirect("/kapak-tasarla/bilgi-formu");
  }

  const { taslakId } = await params;

  const interviewDraft = await prisma.interviewDraft.findUnique({
    where: { id: taslakId },
    include: {
      category: {
        include: {
          questions: {
            where: { isActive: true },
            orderBy: { orderIndex: "asc" },
          },
        },
      },
      answers: true,
    },
  });

  if (!interviewDraft || interviewDraft.userId !== user.id) {
    notFound();
  }

  return <RoportajEditor interviewDraft={interviewDraft} />;
}
