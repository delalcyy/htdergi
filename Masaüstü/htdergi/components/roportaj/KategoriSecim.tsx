"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { InterviewCategory } from "@prisma/client";
import { Button } from "@/components/ui/button";

type Props = {
  categories: InterviewCategory[];
};

export default function KategoriSecim({ categories }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const coverDraftId = searchParams.get("coverDraftId");
  const [selected, setSelected] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  async function handleStart() {
    if (!selected) return;
    setIsCreating(true);
    setError("");

    const res = await fetch("/api/roportaj/taslak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoryId: selected,
        coverDraftId: coverDraftId || null,
      }),
    });
    const json = await res.json();

    if (json.success) {
      router.push(`/kapak-tasarla/roportaj/${json.data.id}`);
    } else {
      setError(json.error || "Hata oluştu.");
      setIsCreating(false);
    }
  }

  if (categories.length === 0) {
    return (
      <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
        Henüz aktif kategori bulunmuyor.
      </p>
    );
  }

  return (
    <div>
      {error && <p style={{ color: "#dc2626", marginBottom: "1rem", fontSize: "0.875rem" }}>{error}</p>}

      <div className="kategori-grid">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className={`kategori-card ${selected === cat.id ? "selected" : ""}`}
            onClick={() => setSelected(cat.id)}
          >
            <div className="kategori-card-name">{cat.name}</div>
            {cat.description && (
              <div className="kategori-card-desc">{cat.description}</div>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button onClick={handleStart} disabled={!selected || isCreating} size="lg">
          {isCreating ? "Oluşturuluyor..." : "Bu Kategoriyle Başla →"}
        </Button>
      </div>
    </div>
  );
}
