"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createDraft } from "@/lib/kapak/draft-store";

export default function KapakEditorYeni() {
  const router = useRouter();

  useEffect(() => {
    const draft = createDraft("sablon-klasik");
    router.replace(`/kapak-tasarla/editor/${draft.id}`);
  }, [router]);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div style={{
        width: "32px", height: "32px",
        border: "3px solid #e5e7eb", borderTopColor: "#1a1a1a",
        borderRadius: "50%", animation: "spin 0.7s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
