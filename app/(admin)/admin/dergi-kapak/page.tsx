import { prisma } from "@/lib/prisma";
import DergiKapakForm from "@/components/admin/DergiKapakForm";

export const metadata = { title: "Kapak Görselleri | Admin" };

export default async function DergiKapakPage() {
  const ayar = await prisma.dergiAyar.findFirst({ where: { id: 1 } });

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>Kapak Görselleri</h1>
        <p style={{ color: "#6b7280", fontSize: 14, marginTop: 6 }}>
          Arka kapak ve sırt görsellerini buradan yükleyin. PDF indirildiğinde [arka kapak | sırt | ön kapak] olarak birleştirilir.
        </p>
      </div>
      <DergiKapakForm
        mevcutArkaKapak={ayar?.arkaKapakUrl ?? null}
      />
    </div>
  );
}
