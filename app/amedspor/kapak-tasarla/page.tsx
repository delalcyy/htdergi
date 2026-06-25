"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createDraft } from "@/lib/kapak/draft-store";

export default function AmedsporKapakTasarlaPage() {
  const router = useRouter();

  useEffect(() => {
    const draft = createDraft("sablon-klasik");
    router.replace(`/amedspor/kapak-tasarla/editor/${draft.id}`);
  }, [router]);

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "#0a0a0a",
      color: "#fff",
      fontSize: "16px",
    }}>
      Editör yükleniyor...
    </div>
  );
}
