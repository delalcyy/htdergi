import "@/styles/kapak.css";
import { Suspense } from "react";
import BilgiFormu from "@/components/kapak/BilgiFormu";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = { title: "Bilgi Formu | Hatıra Dergi" };

type Props = { searchParams: Promise<{ planId?: string }> };

export default async function BilgiFormuPage({ searchParams }: Props) {
  const user = await getSessionUser();
  if (!user) {
    const params = await searchParams;
    const from = params.planId
      ? `/kapak-tasarla/bilgi-formu?planId=${params.planId}`
      : "/kapak-tasarla/bilgi-formu";
    redirect(`/auth/giris?from=${encodeURIComponent(from)}`);
  }
  return (
    <div className="kapak-page">
      <div className="kapak-container">
        <div className="kapak-header">
          <h1>İletişim ve Adres Bilgileri</h1>
          <p>
            Kapak tasarlama alanına erişmek için bilgilerinizi girin.
            Seri numaranız varsa bu adımda girebilirsiniz.
          </p>
        </div>
        <Suspense fallback={<div>Yükleniyor...</div>}>
          <BilgiFormu />
        </Suspense>
      </div>
    </div>
  );
}
