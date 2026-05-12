import "@/styles/globals-auth.css";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata = {
  title: "Şifremi Unuttum | Hatıra Dergi",
};

export default function SifremiUnuttumPage() {
  return (
    <div className="auth-page">
      <ForgotPasswordForm />
    </div>
  );
}
