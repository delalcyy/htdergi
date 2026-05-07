import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import I18nProvider from "@/components/i18n/I18nProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Hatıra Dergi",
  description: "Kendi derginizi tasarlayın, anılarınızı sonsuza taşıyın.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body
className={`${inter.variable} ${cormorant.variable} ${inter.className}`}
        suppressHydrationWarning
      >
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
