import SifreDegistirForm from "@/components/panel/SifreDegistirForm";

export const metadata = { title: "Şifre Değiştir | Hatıra Dergi" };

export default function SifreDegistirPage() {
  return (
    <div>
      <h1 className="panel-section-title">Şifre Değiştir</h1>
      <SifreDegistirForm />
    </div>
  );
}
