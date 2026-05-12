import "@/styles/globals-auth.css";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata = {
  title: "Yeni Şifre | Hatıra Dergi",
};

export default function SifremiSifirlaPage() {
  return (
    <div className="auth-page">
      <ResetPasswordForm />
    </div>
  );
}
