import "@/styles/globals-auth.css";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata = {
  title: "Kayıt Ol | Hatıra Dergi",
};

export default function KayitPage() {
  return (
    <div className="auth-page">
      <RegisterForm />
    </div>
  );
}
