import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HomeContent from "@/components/home/HomeContent";
import { getSessionUser } from "@/lib/auth";

export const metadata = {
  title: "Hatıra Dergi — Kendi Derginizi Tasarlayın",
  description: "Dergi kapağının yıldızı siz olun. Hikâyenizi yazın, röportajınızı oluşturun.",
};

export default async function HomePage() {
  const user = await getSessionUser();
  return (
    <>
      <Header isLoggedIn={!!user} />
      <HomeContent />
      <Footer />
    </>
  );
}
