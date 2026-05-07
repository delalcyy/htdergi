"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import KapakEditor from "@/components/kapak/KapakEditor";
import { getDraft, type DraftData } from "@/lib/kapak/draft-store";

export default function KapakEditorWrapper({ taslakId }: { taslakId: string }) {
  const router = useRouter();
  const [draft, setDraft] = useState<DraftData | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const found = getDraft(taslakId);
    if (!found) {
      router.replace("/kapak-tasarla/editor");
      return;
    }
    setDraft(found);
    setYukleniyor(false);
  }, [taslakId, router]);

  if (yukleniyor) {
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

  if (!draft) return null;
  return <KapakEditor draft={draft} logoSrc="/logo1.png" />;
}
