"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import type {
  InterviewDraft,
  InterviewAnswer,
  InterviewCategory,
  InterviewQuestion,
} from "@prisma/client";
import "@/styles/RoportajForm.css";

type FullDraft = InterviewDraft & {
  category: InterviewCategory & { questions: InterviewQuestion[] };
  answers: InterviewAnswer[];
};

type Props = {
  interviewDraft: FullDraft;
};

const KATEGORI_IKON: Record<string, string> = {
  "Doğum Günü": "🎂",
  "Evlilik":    "💍",
  "Kariyer":    "✦",
  "Bebek":      "🍼",
  "Mezuniyet":  "🎓",
};

export default function RoportajEditor({ interviewDraft }: Props) {
  const router = useRouter();
  const { t } = useTranslation("common");

  const initialAnswers: Record<string, string> = {};
  for (const a of interviewDraft.answers) {
    initialAnswers[a.questionId] = a.answerText || "";
  }

  const [cevaplar, setCevaplar] = useState<Record<string, string>>(initialAnswers);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [basarili, setBasarili]     = useState(false);
  const [hata, setHata]             = useState<string | null>(null);

  function handleCevap(questionId: string, deger: string) {
    setCevaplar(prev => ({ ...prev, [questionId]: deger }));
  }

  async function handleGonder(e: React.FormEvent) {
    e.preventDefault();
    if (yukleniyor) return;
    setYukleniyor(true);
    setHata(null);

    const answerList = interviewDraft.category.questions.map(q => ({
      questionId: q.id,
      answerText: cevaplar[q.id] || null,
    }));

    const res = await fetch(`/api/roportaj/taslak/${interviewDraft.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: answerList, status: "COMPLETED" }),
    });
    const json = await res.json();

    if (!json.success) {
      setHata(json.error || t("cover.roportaj.genericError"));
    } else {
      setBasarili(true);
    }
    setYukleniyor(false);
  }

  const sorular = interviewDraft.category.questions;
  const ikon = KATEGORI_IKON[interviewDraft.category.name] || "✦";

  /* ── Başarı ekranı ── */
  if (basarili) {
    return (
      <div className="rf-basari">
        <div className="rf-basari-kart">
          <span className="rf-basari-ikon">{ikon}</span>
          <h2 className="rf-basari-baslik">{t("cover.roportaj.successTitle")}</h2>
          <p className="rf-basari-aciklama">{t("cover.roportaj.successDesc")}</p>
          <button
            type="button"
            className="rf-btn rf-btn-koyu rf-basari-btn"
            onClick={() => router.push("/panel")}
          >
            {t("cover.roportaj.goToPanel")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rf-sayfa">

      {/* Üst bar */}
      <div className="rf-topbar">
        <button type="button" className="rf-geri-btn" onClick={() => router.back()}>
          {t("cover.roportaj.back")}
        </button>
        <div className="rf-topbar-ayrac" />
        <span className="rf-topbar-marka">{t("cover.roportaj.brand")}</span>
        <div className="rf-topbar-ayrac" />
        <span className="rf-topbar-etiket">{t("cover.roportaj.formLabel")}</span>
      </div>

      <div className="rf-govde">

        {hata && <div className="rf-hata">⚠ {hata}</div>}

        <div className="rf-kapak-bilgi">
          <span>{ikon}</span>
          <span>{t("cover.roportaj.categoryLabel")} <strong>{interviewDraft.category.name}</strong></span>
        </div>

        <form onSubmit={handleGonder} noValidate>

          {/* Sorular */}
          <div className="rf-bolum">
            <div className="rf-bolum-bas">
              <span className="rf-bolum-no">1</span>
              <div>
                <div className="rf-bolum-ad">{t("cover.roportaj.questionsTitle")}</div>
                <div className="rf-bolum-aciklama">
                  {t("cover.roportaj.questionsDesc", { count: sorular.length })}
                </div>
              </div>
            </div>

            {sorular.map((soru, idx) => (
              <div key={soru.id} className="rf-soru">
                <label className="rf-soru-metin">
                  <span className="rf-soru-no">{String(idx + 1).padStart(2, "0")}</span>
                  {soru.body}
                </label>
                <textarea
                  className="rf-soru-yanit"
                  rows={3}
                  value={cevaplar[soru.id] || ""}
                  onChange={e => handleCevap(soru.id, e.target.value)}
                  placeholder={t("cover.roportaj.answerPlaceholder")}
                  maxLength={2000}
                />
              </div>
            ))}
          </div>

          {/* Gönder */}
          <div className="rf-gonder-alan">
            <button type="submit" className="rf-gonder-btn" disabled={yukleniyor}>
              {yukleniyor
                ? <><span className="rf-spinner" /> {t("cover.roportaj.submitting")}</>
                : t("cover.roportaj.submitBtn")}
            </button>
            <p className="rf-gonder-not">{t("cover.roportaj.submitNote")}</p>
          </div>

        </form>
      </div>
    </div>
  );
}
