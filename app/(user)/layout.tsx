import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { canAccessPanel } from "@/lib/permissions";
import PanelSidebar from "@/components/panel/PanelSidebar";
import EpostaIzniPopup from "@/components/EpostaIzniPopup";
import "@/styles/panel.css";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  const access = canAccessPanel(user);

  if (!access.allowed) {
    redirect(access.redirectTo || "/auth/giris");
  }

  return (
    <div className="panel-layout">
      <PanelSidebar user={user!} />
      <main className="panel-main">
        <div className="panel-content">{children}</div>
      </main>
      {user!.emailMarketingConsent === null && <EpostaIzniPopup />}
    </div>
  );
}
