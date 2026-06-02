import { Suspense } from "react";
import OdemeSonucu from "./OdemeSonucu";

export const metadata = { title: "Ödeme Sonucu | Hatıra Dergi" };

export default function OdemeSonucuPage() {
  return (
    <Suspense fallback={null}>
      <OdemeSonucu />
    </Suspense>
  );
}
