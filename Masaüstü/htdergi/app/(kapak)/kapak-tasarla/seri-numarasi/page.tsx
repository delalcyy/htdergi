import "@/styles/kapak.css";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { canAccessEditor } from "@/lib/permissions";
import SeriNumarasiFormu from "@/components/kapak/SeriNumarasiFormu";

export const metadata = { title: "Seri Numarası | Hatıra Dergi" };

export default async function SeriNumarasiPage() {
  const user = await getSessionUser();
  const roleCheck = canAccessEditor(user);

  if (!roleCheck.allowed) {
    if (roleCheck.reason === "login_required") redirect("/auth/giris");
    if (roleCheck.reason === "email_not_verified") redirect("/auth/giris?error=not_verified");
  }

  return (
    <div className="kapak-page">
      <div className="kapak-container">
        <div className="kapak-header">
          <h1>Seri Numarası ile Erişim</h1>
          <p>
            Seri numaranızı girerek kapak tasarım editörüne erişim kazanın.
            Numaranız tek kullanımlıktır.
          </p>
        </div>
        <Suspense fallback={<div>Yükleniyor...</div>}>
          <SeriNumarasiFormu />
        </Suspense>
      </div>
    </div>
  );
}
