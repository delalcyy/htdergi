"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import KapakEditor from "@/components/kapak/KapakEditor";
import { getDraft, type DraftData } from "@/lib/kapak/draft-store";

export default function KapakEditorWrapper({ taslakId, logoSrc = "/logo1.png", logoStyle, logoImgStyle, logoFiltreKapat, logoEmblemGenis, varsayilanYaziMetinleri, sadeceOnKapak }: { taslakId: string; logoSrc?: string; logoStyle?: React.CSSProperties; logoImgStyle?: React.CSSProperties; logoFiltreKapat?: boolean; logoEmblemGenis?: number; varsayilanYaziMetinleri?: Partial<Record<"sol1" | "sag1" | "sol2" | "sag2", string>>; sadeceOnKapak?: boolean }) {
  const router = useRouter();
  const [draft, setDraft] = useState<DraftData | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [unluGorselUrl, setUnluGorselUrl] = useState<string | null>(null);
  const [unluAdi, setUnluAdi] = useState<string | null>(null);

  useEffect(() => {
    const found = getDraft(taslakId);
    if (!found) {
      router.replace("/kapak-tasarla/editor");
      return;
    }
    setDraft(found);
    setYukleniyor(false);
  }, [taslakId, router]);

  useEffect(() => {
    fetch("/api/admin/dergi-ayar")
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data) {
          setUnluGorselUrl(json.data.unluGorselUrl ?? null);
          setUnluAdi(json.data.unluAdi ?? null);
        }
      })
      .catch(() => {});
  }, []);

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
  return <KapakEditor draft={draft} logoSrc={logoSrc} logoStyle={logoStyle} logoImgStyle={logoImgStyle} logoFiltreKapat={logoFiltreKapat} logoEmblemGenis={logoEmblemGenis} varsayilanYaziMetinleri={varsayilanYaziMetinleri} sadeceOnKapak={sadeceOnKapak} unluGorselUrl={unluGorselUrl} unluAdi={unluAdi} />;
}
