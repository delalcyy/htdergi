"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { KapakSablon } from "@/lib/kapak/templates";
import { createDraft } from "@/lib/kapak/draft-store";
import { Button } from "@/components/ui/button";

type Props = { templates: KapakSablon[] };

export default function SablonSecim({ templates }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  function handleStart() {
    if (!selected || isCreating) return;
    setIsCreating(true);
    const draft = createDraft(selected);
    router.push(`/kapak-tasarla/editor/${draft.id}`);
  }

  if (templates.length === 0) {
    return (
      <div className="kapak-form-card">
        <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>Henüz aktif şablon bulunmuyor.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="sablon-grid" style={{ marginBottom: "2rem" }}>
        {templates.map((t) => (
          <div
            key={t.id}
            className={`sablon-card ${selected === t.id ? "selected" : ""}`}
            onClick={() => setSelected(t.id)}
          >
            <div className="sablon-card-img">
              {t.previewUrl ? (
                <Image src={t.previewUrl} alt={t.name} width={200} height={267}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: "0.8125rem", color: "#9ca3af" }}>Önizleme Yok</span>
              )}
            </div>
            <div className="sablon-card-name">{t.name}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button onClick={handleStart} disabled={!selected || isCreating} size="lg">
          {isCreating ? "Hazırlanıyor..." : "Bu Şablonla Başla →"}
        </Button>
      </div>
    </div>
  );
}
