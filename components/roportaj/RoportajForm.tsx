"use client";

import { useState, useRef } from "react";
import { CATEGORIES, QUESTIONS, buildEmptyAnswers, type CategoryLabel } from "@/lib/roportaj/questions";
import { checkProfanity } from "@/lib/roportaj/profanityFilter";
import "@/styles/roportaj-form.css";

const MAX_MB = 5;
const MIN_CHARS = 50;
const MAX_CHARS = 300;

type Images = { inset1: string | null; inset2: string | null };
type Answers = Record<string, string>;

interface FormData {
  ad: string;
  soyad: string;
  category: CategoryLabel | "";
  answers: Answers;
  images: Images;
}

/* ── Görsel slot ── */
function ImageSlot({
  label, value,
  onUpload, onRemove,
}: {
  label: string;
  value: string | null;
  onUpload: (b64: string) => void;
  onRemove: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState<string | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr(null);
    if (!file.type.startsWith("image/")) { setErr("Sadece görsel dosyası."); return; }
    if (file.size > MAX_MB * 1024 * 1024) { setErr(`Maks ${MAX_MB}MB.`); return; }
    const reader = new FileReader();
    reader.onload = ev => onUpload(ev.target!.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  return (
    <div className="upload-slot">
      <span className="upload-slot-label">{label}</span>
      {value ? (
        <div className="upload-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={label} />
          <div className="upload-preview-ov">
            <button type="button" className="upload-ov-btn" onClick={() => ref.current?.click()}>Değiştir</button>
            <button type="button" className="upload-ov-btn upload-ov-rm" onClick={onRemove}>Kaldır</button>
          </div>
        </div>
      ) : (
        <button type="button" className="upload-btn" onClick={() => ref.current?.click()}>
          <span className="upload-btn-icon">+</span>
          <span className="upload-btn-text">Görsel Seç</span>
          <span className="upload-btn-sub">JPG · PNG · WEBP · maks {MAX_MB}MB</span>
        </button>
      )}
      {err && <p style={{ fontSize: 11, color: "#c0392b", marginTop: 4 }}>{err}</p>}
      <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
    </div>
  );
}

/* ── Soru satırı ── */
function QuestionItem({
  num, question, value, onChange,
}: {
  num: number;
  question: string;
  value: string;
  onChange: (val: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  const [err, setErr] = useState<string | null>(null);
  const len = draft.length;

  function handle(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const v = e.target.value;
    setDraft(v);
    const { isClean } = checkProfanity(v);
    if (!isClean) { setErr("Uygunsuz ifade tespit edildi."); onChange(""); return; }
    if (v.length > 0 && v.length < MIN_CHARS) {
      setErr(`En az ${MIN_CHARS} karakter yazın.`);
      onChange("");
    } else {
      setErr(null);
      onChange(v);
    }
  }

  const counterColor = len === 0 ? "#b0b0b0" : len < MIN_CHARS ? "#e67e22" : len >= MAX_CHARS ? "#c0392b" : "#27ae60";

  return (
    <div className="q-item">
      <div className="q-item-top">
        <span className="q-num">{String(num).padStart(2, "0")}</span>
        <p className="q-text">{question}</p>
      </div>
      <textarea
        className={`q-textarea${err ? " q-textarea--err" : ""}`}
        placeholder="Cevabınızı buraya yazın…"
        rows={4}
        maxLength={MAX_CHARS}
        value={draft}
        onChange={handle}
      />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
        {err
          ? <p className="q-err" style={{ margin: 0 }}>⚠ {err}</p>
          : <span />
        }
        <span style={{ fontSize: 11, color: counterColor, fontVariantNumeric: "tabular-nums" }}>
          {len} / {MAX_CHARS}
          {len > 0 && len < MIN_CHARS && ` (min ${MIN_CHARS})`}
        </span>
      </div>
    </div>
  );
}

/* ══════════════════════════════
   Ana Bileşen
   ══════════════════════════════ */
export default function RoportajForm({ coverDraftId }: { coverDraftId?: string | null }) {
  const [form, setForm] = useState<FormData>({
    ad: "", soyad: "", category: "", answers: {}, images: { inset1: null, inset2: null },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  function onChange(field: "ad" | "soyad", val: string) {
    setForm(prev => ({ ...prev, [field]: val }));
  }

  function onCategoryChange(label: CategoryLabel) {
    setForm(prev => ({
      ...prev,
      category: label,
      answers: buildEmptyAnswers(label),
    }));
  }

  function onAnswer(id: string, val: string) {
    setForm(prev => ({ ...prev, answers: { ...prev.answers, [id]: val } }));
  }

  function onImageUpload(slot: "inset1" | "inset2", b64: string) {
    setForm(prev => ({ ...prev, images: { ...prev.images, [slot]: b64 } }));
  }

  function onImageRemove(slot: "inset1" | "inset2") {
    setForm(prev => ({ ...prev, images: { ...prev.images, [slot]: null } }));
  }

  async function onSubmit() {
    if (!form.category || isLoading) return;
    setIsLoading(true);
    setHata(null);
    try {
      /* Kapak JPEG'i sessionStorage'dan oku (editor → form arası taşıma) */
      let coverBase64: string | null = null;
      if (coverDraftId && typeof window !== "undefined") {
        coverBase64 = sessionStorage.getItem(`ht_kapak_${coverDraftId}`);
      }

      const res = await fetch("/api/siparis/olustur", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ad:           form.ad.trim(),
          soyad:        form.soyad.trim(),
          categoryName: form.category,
          answers:      form.answers,
          photo1Base64: form.images.inset1,
          photo2Base64: form.images.inset2,
          coverBase64,
        }),
      });
      const json = await res.json();
      if (json.success) {
        /* Kapak verisini temizle */
        if (coverDraftId && typeof window !== "undefined") {
          sessionStorage.removeItem(`ht_kapak_${coverDraftId}`);
        }
        setIsSuccess(true);
      } else {
        setHata(json.error || "Gönderim sırasında bir hata oluştu.");
      }
    } catch {
      setHata("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  }

  function onReset() {
    setForm({ ad: "", soyad: "", category: "", answers: {}, images: { inset1: null, inset2: null } });
    setIsSuccess(false);
    setHata(null);
  }

  /* ── Başarı ekranı ── */
  if (isSuccess) {
    return (
      <div className="success-card">
        <span className="success-icon">✦</span>
        <h2 className="success-title">Formunuz Alındı</h2>
        <p className="success-sub">Röportajınız hazırlanacak ve sizinle paylaşılacak. Teşekkür ederiz.</p>
        <button type="button" className="success-btn" onClick={onReset}>Yeni Form Doldur</button>
      </div>
    );
  }

  const questions = form.category ? QUESTIONS[form.category] : [];

  return (
    <form className="roportaj-form" onSubmit={e => { e.preventDefault(); onSubmit(); }} noValidate>

      {hata && <div className="rf-hata">⚠ {hata}</div>}

      {/* 1 — Ad & Soyad */}
      <div className="order-section">
        <div className="order-section-head">
          <span className="order-section-num">1</span>
          <div>
            <div className="order-section-title">Ad & Soyad</div>
            <div className="order-section-sub">PDF'e yazdırılacak isim</div>
          </div>
        </div>
        <div className="name-grid">
          <div>
            <label className="field-label">Ad</label>
            <input className="field-input" value={form.ad} onChange={e => onChange("ad", e.target.value)} placeholder="Adınız" />
          </div>
          <div>
            <label className="field-label">Soyad</label>
            <input className="field-input" value={form.soyad} onChange={e => onChange("soyad", e.target.value)} placeholder="Soyadınız" />
          </div>
        </div>
      </div>

      <div className="order-divider" />

      {/* 2 — Kategori */}
      <div className="order-section">
        <div className="order-section-head">
          <span className="order-section-num">2</span>
          <div>
            <div className="order-section-title">Kategori Seçin</div>
            <div className="order-section-sub">Derginin temasını belirleyin</div>
          </div>
        </div>
        <div className="cat-grid">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              className={`cat-card${form.category === cat.label ? " cat-card--active" : ""}`}
              onClick={() => onCategoryChange(cat.label)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="order-divider" />

      {/* 3 — Fotoğraflar */}
      <div className="order-section">
        <div className="order-section-head">
          <span className="order-section-num">3</span>
          <div>
            <div className="order-section-title">Fotoğraflarınızı Yükleyin</div>
            <div className="order-section-sub">En az bir fotoğraf ekleyin</div>
          </div>
        </div>
        <div className="upload-grid">
          <ImageSlot label="Görsel 1" value={form.images.inset1}
            onUpload={b64 => onImageUpload("inset1", b64)}
            onRemove={() => onImageRemove("inset1")} />
          <ImageSlot label="Görsel 2" value={form.images.inset2}
            onUpload={b64 => onImageUpload("inset2", b64)}
            onRemove={() => onImageRemove("inset2")} />
        </div>
      </div>

      <div className="order-divider" />

      {/* 4 — Sorular */}
      <div className="order-section">
        <div className="order-section-head">
          <span className="order-section-num">4</span>
          <div>
            <div className="order-section-title">Röportaj Soruları</div>
            <div className="order-section-sub">
              {form.category ? `${form.category} kategorisi için 10 soru` : "Önce kategori seçin"}
            </div>
          </div>
        </div>
        {!form.category && (
          <p style={{ fontSize: 13, color: "#b0b0b0", fontStyle: "italic", padding: "1rem 0" }}>
            Soruları görmek için yukarıdan bir kategori seçin.
          </p>
        )}
        <div className="questions-list">
          {questions.map((q, i) => (
            <QuestionItem
              key={q.id}
              num={i + 1}
              question={q.text}
              value={form.answers[q.id] ?? ""}
              onChange={val => onAnswer(q.id, val)}
            />
          ))}
        </div>
      </div>

      {/* Gönder */}
      <div className="submit-area">
        <button type="submit" className="submit-btn" disabled={!form.category || isLoading}>
          {isLoading
            ? <><span className="submit-spinner" /> Gönderiliyor…</>
            : "Formu Gönder"}
        </button>
        <p className="submit-note">Formunuz gönderildikten sonra ekibimiz sizinle iletişime geçecek.</p>
      </div>

    </form>
  );
}
