import { NextRequest, NextResponse } from "next/server";
import { sendMail, verifySmtpConnection } from "@/lib/mail";

export async function POST(request: NextRequest) {
  const envSecret = (process.env.TEST_MAIL_SECRET ?? "").trim();
  const headerSecret = (request.headers.get("x-test-secret") ?? "").trim();

  // Env yoksa hata
  if (!envSecret) {
    return NextResponse.json({
      success: false,
      error: "missing_env",
      detail: "TEST_MAIL_SECRET env değişkeni tanımlı değil.",
    }, { status: 500 });
  }

  // Header yoksa hata
  if (!headerSecret) {
    return NextResponse.json({
      success: false,
      error: "missing_header",
      detail: "x-test-secret header gönderilmedi.",
    }, { status: 401 });
  }

  // Eşleşmiyorsa debug bilgisiyle 403
  if (headerSecret !== envSecret) {
    return NextResponse.json({
      success: false,
      error: "mismatch",
      hasEnv: true,
      hasHeader: true,
      headerLength: headerSecret.length,
      envLength: envSecret.length,
    }, { status: 403 });
  }

  // SMTP bağlantısını doğrula
  try {
    await verifySmtpConnection();
  } catch (err) {
    return NextResponse.json({
      success: false,
      step: "smtp_verify",
      error: err instanceof Error ? err.message : String(err),
      config: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE,
        user: process.env.SMTP_USER,
      },
    }, { status: 500 });
  }

  // Test maili gönder
  let to = "info@hatiradergi.com";
  try {
    const body = await request.json();
    if (body.to) to = body.to;
  } catch { /* to opsiyonel */ }

  try {
    const info = await sendMail({
      to,
      subject: "Hatıra Dergi — SMTP Test",
      html: `
        <div style="font-family:sans-serif;max-width:460px;margin:0 auto;padding:32px 24px;">
          <h2 style="color:#1a1a1a;">SMTP Bağlantısı Çalışıyor</h2>
          <p style="color:#444;">Bu mail Natro SMTP üzerinden başarıyla gönderildi.</p>
          <table style="font-size:13px;color:#666;margin-top:16px;border-collapse:collapse;width:100%;">
            <tr><td style="padding:4px 16px 4px 0;color:#888;">Host</td><td>${process.env.SMTP_HOST}</td></tr>
            <tr><td style="padding:4px 16px 4px 0;color:#888;">Port</td><td>${process.env.SMTP_PORT}</td></tr>
            <tr><td style="padding:4px 16px 4px 0;color:#888;">From</td><td>${process.env.MAIL_FROM}</td></tr>
            <tr><td style="padding:4px 16px 4px 0;color:#888;">To</td><td>${to}</td></tr>
          </table>
          <p style="color:#aaa;font-size:11px;margin-top:24px;">${new Date().toISOString()}</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, to, messageId: info.messageId });
  } catch (err) {
    return NextResponse.json({
      success: false,
      step: "send_mail",
      error: err instanceof Error ? err.message : String(err),
    }, { status: 500 });
  }
}
