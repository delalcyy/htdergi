import "@/styles/globals-auth.css";
import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";

export const metadata = {
  title: "Giriş Yap | Hatıra Dergi",
};

export default function GirisPage() {
  return (
    <div className="auth-page">
      <Suspense fallback={<div className="auth-card">Yükleniyor...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
