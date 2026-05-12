import "@/styles/kapak.css";
import { Suspense } from "react";
import BilgiFormu from "@/components/kapak/BilgiFormu";

export const metadata = { title: "Bilgi Formu | Hatıra Dergi" };

export default function BilgiFormuPage() {
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
