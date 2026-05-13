import { getSessionUser } from "@/lib/auth";
import ProfilForm from "@/components/panel/ProfilForm";

export const metadata = { title: "Profilim | Hatıra Dergi" };

export default async function ProfilPage() {
  const user = await getSessionUser();
  if (!user) return null;

  return (
    <div>
      <h1 className="panel-section-title">Profilim</h1>
      <ProfilForm user={user} />
    </div>
  );
}
