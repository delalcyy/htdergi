import type { NextConfig } from "next";

const securityHeaders = [
  // Clickjacking önleme
  { key: "X-Frame-Options", value: "DENY" },
  // MIME sniffing önleme
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Referrer bilgisi sınırlama
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Tarayıcı özelliklerini kısıtla
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(self)",
  },
  // DNS prefetch kısıtlama
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // XSS koruması (eski tarayıcılar için)
  { key: "X-XSS-Protection", value: "1; mode=block" },
  // HSTS — sadece production'da etkin
  ...(process.env.NODE_ENV === "production"
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
  // CSP — Next.js + Supabase + İyzico uyumlu
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js RSC + inline scripts
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.iyzipay.com",
      // Tailwind inline styles
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: http://localhost:4000",
      // API çağrıları: Supabase, İyzico
      "connect-src 'self' http://localhost:4000 https://api.iyzipay.com https://sandbox-api.iyzipay.com",
      // İyzico ödeme formu (iframe ile açılabilir)
      "frame-src 'self' https://static.iyzipay.com https://checkout.iyzipay.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/uploads/**",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  async headers() {
    return [
      {
        // Tüm rotalara uygula
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
