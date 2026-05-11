import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import RoportajForm from "@/components/roportaj/RoportajForm";

export const metadata = { title: "Röportaj Formu | Hatıra Dergi" };

type Props = { searchParams: Promise<{ coverDraftId?: string }> };

export default async function RoportajYeniPage({ searchParams }: Props) {
  const user = await getSessionUser();
  if (!user) redirect("/auth/giris");

  const { coverDraftId } = await searchParams;

  return (
    <div className="roportaj-form-wrap">
      <div className="roportaj-form-head">
        <h1>Röportaj Formu</h1>
        <p>Kategori seçin, fotoğraflarınızı ekleyin ve sorularınızı cevaplayın.</p>
      </div>
      <RoportajForm coverDraftId={coverDraftId ?? null} />
    </div>
  );
}
