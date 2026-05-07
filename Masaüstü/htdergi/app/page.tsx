import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HomeContent from "@/components/home/HomeContent";

export const metadata = {
  title: "Hatıra Dergi — Kendi Derginizi Tasarlayın",
  description: "Dergi kapağının yıldızı siz olun. Hikâyenizi yazın, röportajınızı oluşturun.",
};

export default function HomePage() {
  return (
    <>
      <Header />
      <HomeContent />
      <Footer />
    </>
  );
}
