import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfilForm from "@/components/panel/ProfilForm";

export const metadata = { title: "Profilim | Hatıra Dergi" };

export default async function ProfilPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const address = await prisma.userAddress.findFirst({
    where: { userId: user.id, isPrimary: true },
  });

  return (
    <div>
      <h1 className="panel-section-title">Profilim</h1>
      <ProfilForm user={user} address={address} />
    </div>
  );
}
