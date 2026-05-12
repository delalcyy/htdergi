"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import "@/styles/globals-auth.css";

type State = "loading" | "success" | "used" | "expired" | "invalid";

function EmailDogrulaContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    if (!token) { setState("invalid"); return; }

    fetch("/api/auth/email-dogrula", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) { setState("success"); return; }
        if (data.error === "token_used")         setState("used");
        else if (data.error === "token_expired") setState("expired");
        else                                     setState("invalid");
      })
      .catch(() => setState("invalid"));
  }, [token]);

  const messages: Record<State, { title: string; body: string; showLogin?: boolean; showBack?: boolean }> = {
    loading: { title: "Doğrulanıyor...",       body: "Lütfen bekleyin." },
    success: { title: "E-posta Doğrulandı!",   body: "Hesabınız aktif edildi. Artık giriş yapabilirsiniz.", showLogin: true },
    used:    { title: "Bağlantı Kullanıldı",   body: "Bu doğrulama bağlantısı daha önce kullanılmış.", showLogin: true },
    expired: { title: "Bağlantı Süresi Doldu", body: "24 saatlik süre geçmiş. Giriş sayfasından yeniden doğrulama isteyin.", showBack: true },
    invalid: { title: "Geçersiz Bağlantı",     body: "Bağlantı geçersiz veya bozulmuş.", showBack: true },
  };

  const msg = messages[state];

  return (
    <div className="auth-card">
      <div className="auth-logo"><h1>Hatıra Dergi</h1></div>
      <h2 className="auth-title">{msg.title}</h2>
      <p className="auth-subtitle">{msg.body}</p>
      {msg.showLogin && (
        <Link href="/auth/giris" className="auth-submit" style={{ display: "block", textAlign: "center", marginTop: "1.5rem" }}>
          Giriş Yap
        </Link>
      )}
      {msg.showBack && (
        <div className="auth-divider">
          <Link href="/auth/giris">Giriş sayfasına dön</Link>
        </div>
      )}
    </div>
  );
}

export default function EmailDogrulaPage() {
  return (
    <div className="auth-page">
      <Suspense fallback={
        <div className="auth-card">
          <div className="auth-logo"><h1>Hatıra Dergi</h1></div>
          <p className="auth-subtitle">Yükleniyor...</p>
        </div>
      }>
        <EmailDogrulaContent />
      </Suspense>
    </div>
  );
}
