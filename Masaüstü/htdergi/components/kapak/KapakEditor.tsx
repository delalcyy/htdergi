"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { updateDraft, type DraftData } from "@/lib/kapak/draft-store";
import "@/styles/KapakTasarim.css";

type Props = {
  draft: DraftData;
  logoSrc?: string | null;
  userName?: string;
};

/* ── Sabitler ── */

const ARKA_PLAN_RENKLERI = [
  { key: "siyah",    value: "#111111", koyu: false },
  { key: "antrasit", value: "#2c2c2c", koyu: false },
  { key: "gri",      value: "#6b6b6b", koyu: false },
  { key: "krem",     value: "#e8e0d0", koyu: true  },
  { key: "beyaz",    value: "#f5f5f0", koyu: true  },
  { key: "altin",    value: "#a98947", koyu: false },
];

const LOGO_RENKLERI = [
  { key: "orijinal",  filtre: "none",                                                                       onizleme: "#e8e8e8", koyu: true  },
  { key: "altin",     filtre: "sepia(1) saturate(4) hue-rotate(8deg)",                                     onizleme: "#c9a050", koyu: false },
  { key: "gumus",     filtre: "brightness(0.65) saturate(0)",                                              onizleme: "#888888", koyu: false },
  { key: "siyah",     filtre: "brightness(0) saturate(100%)",                                              onizleme: "#111111", koyu: false },
  { key: "acikMavi",  filtre: "sepia(1) saturate(10) hue-rotate(170deg) brightness(0.75) contrast(1.55)", onizleme: "#1F3A8A", koyu: false },
  { key: "pembe",     filtre: "sepia(1) saturate(5) hue-rotate(295deg) brightness(0.9)",                   onizleme: "#e060a8", koyu: false },
];

const FONTLAR = [
  { label: "Inter",            value: "Inter, system-ui, sans-serif" },
  { label: "Playfair Display", value: "'Playfair Display', Georgia, serif" },
  { label: "Oswald",           value: "'Oswald', sans-serif" },
  { label: "Montserrat",       value: "'Montserrat', sans-serif" },
  { label: "Raleway",          value: "'Raleway', sans-serif" },
  { label: "Roboto Condensed", value: "'Roboto Condensed', sans-serif" },
  { label: "EB Garamond",      value: "'EB Garamond', Georgia, serif" },
];

const BARKOD = (
  <svg viewBox="0 0 60 22" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <g fill="#111">
      {[
        [1,1.2],[3.5,0.6],[5,1.8],[8,0.6],[9.5,1.2],[12,0.6],[13.5,2],
        [17,0.6],[18.5,1.2],[21,0.8],[23,1.6],[26,0.6],[27.5,1.2],[30,0.8],
        [32,1.4],[34.5,0.6],[36,1.2],[38.5,0.6],[40,1.8],[43,0.6],[44.5,1.2],
        [47,0.8],[49,1.6],[52,0.6],[53.5,1.2],[56,0.6],[57.5,1.4],
      ].map(([x, w], i) => (
        <rect key={i} x={x} y="1" width={w} height="20" />
      ))}
    </g>
  </svg>
);

/* ── Tip tanımları ── */
type Yazi = {
  metin: string;
  renk: string;
  boyut: number;
  font: string;
  x: number;
  y: number;
};

type YaziKey = "sol1" | "sag1" | "sol2" | "sag2";

const VARSAYILAN_YAZILAR_TR: Record<YaziKey, Yazi> = {
  sol1: { metin: "MODANIN KALBİ\nTÜRKİYE'DE ATACAK", renk: "#ffffff", boyut: 1.9, font: FONTLAR[0].value, x: 1,  y: 55 },
  sag1: { metin: "ÖZEL RÖPORTAJLAR\nGÜÇLÜ İSİMLER\nYENİ SEZON",      renk: "#ffffff", boyut: 1.9, font: FONTLAR[0].value, x: 59, y: 32 },
  sol2: { metin: "YENİ KOLEKSİYON",                                    renk: "#ffffff", boyut: 1.9, font: FONTLAR[0].value, x: 1,  y: 70 },
  sag2: { metin: "TREND RAPORU",                                        renk: "#ffffff", boyut: 1.9, font: FONTLAR[0].value, x: 59, y: 48 },
};

/* ── Yardımcı ── */
function kelimeSiniri(metin: string): string {
  const islenmis = metin.split("\n").map(satir => {
    const bosluklarVar = satir.endsWith(" ");
    const kelimeler = satir.trim().split(/\s+/).filter(k => k);
    if (!kelimeler.length) return "";
    const parcalar: string[] = [];
    for (let i = 0; i < kelimeler.length; i += 3)
      parcalar.push(kelimeler.slice(i, i + 3).join(" "));
    let sonuc = parcalar.join("\n");
    if (bosluklarVar) {
      const sonParKelime = parcalar[parcalar.length - 1].split(" ").length;
      sonuc += sonParKelime < 3 ? " " : "\n";
    }
    return sonuc;
  }).join("\n");
  return islenmis.split("\n").slice(0, 4).join("\n");
}

/* ══════════════════════════════
   Ana Bileşen
   ══════════════════════════════ */
export default function KapakEditor({ draft, logoSrc = null, userName = "" }: Props) {
  const router = useRouter();
  const { t } = useTranslation("common");

  /* Arka plan */
  const [bgFoto, setBgFoto]     = useState<string | null>(null);
  const [bgBase64, setBgBase64] = useState<string | null>(null);
  const [bgZoom, setBgZoom]     = useState(1);
  const [bgDon, setBgDon]       = useState(0);
  const [bgAyna, setBgAyna]     = useState(false);
  const [bgX, setBgX]           = useState(0);
  const [bgY, setBgY]           = useState(0);

  /* Ön plan */
  const [onFoto, setOnFoto]               = useState<string | null>(null);
  const [onZoom, setOnZoom]               = useState(1);
  const [onDon, setOnDon]                 = useState(0);
  const [onAyna, setOnAyna]               = useState(false);
  const [onX, setOnX]                     = useState(0);
  const [onY, setOnY]                     = useState(0);
  const [suruklHedef, setSuruklHedef]     = useState<"bg" | "fg">("bg");

  /* Renkler */
  const [bgRenk, setBgRenk]               = useState("#111111");
  const [logoFiltre, setLogoFiltre]       = useState("none");
  const [baslikRenk, setBaslikRenk]       = useState("#ffffff");

  /* Metinler */
  const [ad, setAd]               = useState(userName);
  const [altBaslik, setAltBaslik] = useState("");

  const VARSAYILAN_YAZILAR: Record<YaziKey, Yazi> = {
    sol1: { metin: t("cover.editor.defaultTexts.sol1"), renk: "#ffffff", boyut: 1.9, font: FONTLAR[0].value, x: 1,  y: 55 },
    sag1: { metin: t("cover.editor.defaultTexts.sag1"), renk: "#ffffff", boyut: 1.9, font: FONTLAR[0].value, x: 59, y: 32 },
    sol2: { metin: t("cover.editor.defaultTexts.sol2"), renk: "#ffffff", boyut: 1.9, font: FONTLAR[0].value, x: 1,  y: 70 },
    sag2: { metin: t("cover.editor.defaultTexts.sag2"), renk: "#ffffff", boyut: 1.9, font: FONTLAR[0].value, x: 59, y: 48 },
  };

  /* Yan yazılar */
  const [yazilar, setYazilar] = useState<Record<YaziKey, Yazi>>({ ...VARSAYILAN_YAZILAR_TR });

  /* UI */
  const [dışaAktariliyor, setDışaAktariliyor] = useState(false);
  const [kaydediliyor, setKaydediliyor]       = useState(false);
  const [toast, setToast]                     = useState<string | null>(null);
  const [suruklUst, setSuruklUst]             = useState(false);
  const [mounted, setMounted]                 = useState(false);

  useEffect(() => { setMounted(true); }, []);

  /* Refs */
  const kapakRef   = useRef<HTMLDivElement>(null);
  const dosyaRef   = useRef<HTMLInputElement>(null);
  const onDosyaRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const yaziRefs   = useRef<Record<YaziKey, HTMLTextAreaElement | null>>({
    sol1: null, sag1: null, sol2: null, sag2: null,
  });

  /* ── Toast ── */
  function gosterToast(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }

  /* ── Arka plan fotoğraf ── */
  function bgDosyaIsle(dosya: File | null | undefined) {
    if (!dosya) return;
    if (!dosya.type.startsWith("image/")) { gosterToast(t("cover.editor.toastImageOnly")); return; }
    if (dosya.size > 20 * 1024 * 1024)   { gosterToast(t("cover.editor.toastMaxSize")); return; }
    if (bgFoto) URL.revokeObjectURL(bgFoto);
    setBgZoom(1); setBgDon(0); setBgAyna(false); setBgX(0); setBgY(0);
    setBgFoto(URL.createObjectURL(dosya));
    const r = new FileReader();
    r.onload = () => setBgBase64(r.result as string);
    r.readAsDataURL(dosya);
    gosterToast(t("cover.editor.toastUploaded"));
  }

  function onBgDegis(e: React.ChangeEvent<HTMLInputElement>) {
    bgDosyaIsle(e.target.files?.[0]);
  }

  function onBirak(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault(); setSuruklUst(false);
    bgDosyaIsle(e.dataTransfer.files?.[0]);
  }

  /* ── Ön plan PNG ── */
  function onDosyaIsle(e: React.ChangeEvent<HTMLInputElement>) {
    const dosya = e.target.files?.[0];
    if (!dosya) return;
    if (onFoto) URL.revokeObjectURL(onFoto);
    setOnZoom(1); setOnDon(0); setOnAyna(false); setOnX(0); setOnY(0);
    setOnFoto(URL.createObjectURL(dosya));
    setSuruklHedef("fg");
  }

  /* ── Sürükleme: arka plan ── */
  function bgSuruklBasla(e: React.MouseEvent | React.TouchEvent) {
    if (!bgFoto || suruklHedef !== "bg") return;
    e.preventDefault();
    const touch = "touches" in e ? e.touches[0] : null;
    const sx = touch ? touch.clientX : (e as React.MouseEvent).clientX;
    const sy = touch ? touch.clientY : (e as React.MouseEvent).clientY;
    const ox = bgX, oy = bgY;
    function hareket(ev: MouseEvent | TouchEvent) {
      if (ev.cancelable) ev.preventDefault();
      const t = "touches" in ev ? (ev as TouchEvent).touches[0] : null;
      const cx = t ? t.clientX : (ev as MouseEvent).clientX;
      const cy = t ? t.clientY : (ev as MouseEvent).clientY;
      setBgX(ox + (cx - sx)); setBgY(oy + (cy - sy));
    }
    function birak() {
      document.removeEventListener("mousemove", hareket);
      document.removeEventListener("mouseup", birak);
      document.removeEventListener("touchmove", hareket);
      document.removeEventListener("touchend", birak);
    }
    document.addEventListener("mousemove", hareket);
    document.addEventListener("mouseup", birak);
    document.addEventListener("touchmove", hareket, { passive: false });
    document.addEventListener("touchend", birak);
  }

  /* ── Sürükleme: ön plan ── */
  function onSuruklBasla(e: React.MouseEvent | React.TouchEvent) {
    if (!onFoto || suruklHedef !== "fg") return;
    e.preventDefault();
    const touch = "touches" in e ? e.touches[0] : null;
    const sx = touch ? touch.clientX : (e as React.MouseEvent).clientX;
    const sy = touch ? touch.clientY : (e as React.MouseEvent).clientY;
    const ox = onX, oy = onY;
    function hareket(ev: MouseEvent | TouchEvent) {
      if (ev.cancelable) ev.preventDefault();
      const t = "touches" in ev ? (ev as TouchEvent).touches[0] : null;
      const cx = t ? t.clientX : (ev as MouseEvent).clientX;
      const cy = t ? t.clientY : (ev as MouseEvent).clientY;
      setOnX(ox + (cx - sx)); setOnY(oy + (cy - sy));
    }
    function birak() {
      document.removeEventListener("mousemove", hareket);
      document.removeEventListener("mouseup", birak);
      document.removeEventListener("touchmove", hareket);
      document.removeEventListener("touchend", birak);
    }
    document.addEventListener("mousemove", hareket);
    document.addEventListener("mouseup", birak);
    document.addEventListener("touchmove", hareket, { passive: false });
    document.addEventListener("touchend", birak);
  }

  /* ── Sürükleme: yan yazılar ── */
  function yaziSuruklBasla(e: React.MouseEvent | React.TouchEvent, anahtar: YaziKey) {
    e.stopPropagation();
    const yazi = yazilar[anahtar];
    const touch = "touches" in e ? e.touches[0] : null;
    const sx = touch ? touch.clientX : (e as React.MouseEvent).clientX;
    const sy = touch ? touch.clientY : (e as React.MouseEvent).clientY;
    const ox = yazi.x, oy = yazi.y;
    let surukleniyor = false;
    function hareket(ev: MouseEvent | TouchEvent) {
      const t = "touches" in ev ? (ev as TouchEvent).touches[0] : null;
      const cx = t ? t.clientX : (ev as MouseEvent).clientX;
      const cy = t ? t.clientY : (ev as MouseEvent).clientY;
      if (!surukleniyor && (Math.abs(cx - sx) > 8 || Math.abs(cy - sy) > 8)) {
        surukleniyor = true;
        yaziRefs.current[anahtar]?.blur();
        window.getSelection()?.removeAllRanges();
      }
      if (!surukleniyor) return;
      if (ev.cancelable) ev.preventDefault();
      if (!kapakRef.current) return;
      const rect = kapakRef.current.getBoundingClientRect();
      const el   = yaziRefs.current[anahtar];
      const elH  = el ? (el.getBoundingClientRect().height / rect.height) * 100 : 0;
      const elW  = el ? (el.getBoundingClientRect().width  / rect.width)  * 100 : 0;
      const nx = Math.max(0, Math.min(100 - elW, ox + ((cx - sx) / rect.width)  * 100));
      const ny = Math.max(22, Math.min(82 - elH, oy + ((cy - sy) / rect.height) * 100));
      setYazilar(prev => ({ ...prev, [anahtar]: { ...prev[anahtar], x: nx, y: ny } }));
    }
    function birak() {
      document.removeEventListener("mousemove", hareket);
      document.removeEventListener("mouseup", birak);
      document.removeEventListener("touchmove", hareket);
      document.removeEventListener("touchend", birak);
    }
    document.addEventListener("mousemove", hareket);
    document.addEventListener("mouseup", birak);
    document.addEventListener("touchmove", hareket, { passive: false });
    document.addEventListener("touchend", birak);
  }

  function yaziGuncelle(anahtar: YaziKey, alan: keyof Yazi, deger: string | number) {
    setYazilar(prev => ({ ...prev, [anahtar]: { ...prev[anahtar], [alan]: deger } }));
  }

  /* ── PNG indir ── */
  async function handleIndir() {
    if (dışaAktariliyor) return;
    setDışaAktariliyor(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(kapakRef.current!, {
        scale: 3, useCORS: true, allowTaint: true, backgroundColor: null,
        logging: false, scrollX: 0, scrollY: 0,
        onclone: (_doc: Document, el: HTMLElement) => {
          el.querySelectorAll("textarea.kt-yazi-ta").forEach(ta => {
            const textarea = ta as HTMLTextAreaElement;
            const div = _doc.createElement("div");
            div.style.cssText    = textarea.getAttribute("style") || "";
            div.style.overflow   = "hidden";
            div.style.whiteSpace = "pre-wrap";
            div.style.wordBreak  = "break-word";
            div.style.background = "transparent";
            div.style.border     = "none";
            div.style.outline    = "none";
            div.style.padding    = "0";
            div.className        = textarea.className;
            div.textContent      = textarea.value;
            textarea.parentNode?.replaceChild(div, textarea);
          });
        },
      });
      const link = document.createElement("a");
      link.download = `hatira-dergi-kapak-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      gosterToast(t("cover.editor.toastDownloaded"));
    } catch {
      gosterToast(t("cover.editor.toastExportFailed"));
    } finally {
      setDışaAktariliyor(false);
    }
  }

  /* ── Kaydet & devam ── */
  function handleKaydetDevam() {
    if (kaydediliyor) return;
    setKaydediliyor(true);
    try {
      updateDraft(draft.id, {
        personName: ad.trim().substring(0, 60) || null,
        subtitle:   altBaslik.trim().substring(0, 120) || null,
      });
      gosterToast(t("cover.editor.toastSaved"));
      setTimeout(() => {
        router.push(`/kapak-tasarla/roportaj/yeni?coverDraftId=${draft.id}`);
      }, 600);
    } catch {
      gosterToast(t("cover.editor.toastSaveFailed"));
      setKaydediliyor(false);
    }
  }

  /* ── Sıfırla ── */
  function handleSifirla() {
    if (bgFoto) URL.revokeObjectURL(bgFoto);
    if (onFoto) URL.revokeObjectURL(onFoto);
    setBgFoto(null); setBgBase64(null); setBgZoom(1); setBgDon(0); setBgAyna(false); setBgX(0); setBgY(0);
    setOnFoto(null); setOnZoom(1); setOnDon(0); setOnAyna(false); setOnX(0); setOnY(0); setSuruklHedef("bg");
    setBgRenk("#111111"); setLogoFiltre("none"); setBaslikRenk("#ffffff");
    setAd(userName); setAltBaslik("");
    setYazilar({ ...VARSAYILAN_YAZILAR_TR });
    gosterToast(t("cover.editor.toastReset"));
  }

  const gosterAd = ad.trim() || userName || "Ad Soyad";

  if (!mounted) return null;

  return createPortal(
    <div className="kt-app">

      {/* ══════ PANEL ══════ */}
      <section className="kt-panel">
        <div className="kt-panel-ic">

          {/* 01 Kapak Fotoğrafı */}
          <div className="kt-bolum">
            <div className="kt-bolum-bas">
              <span className="kt-bolum-no">01</span>
              <span className="kt-bolum-ad">{t("cover.editor.section01")}</span>
            </div>

            <div
              className={`kt-yukle ${suruklUst ? "kt-yukle--ust" : ""}`}
              onClick={() => dosyaRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setSuruklUst(true); }}
              onDragLeave={() => setSuruklUst(false)}
              onDrop={onBirak}
            >
              <div className="kt-yukle-ikon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b8880" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 16V4M6 10l6-6 6 6"/><path d="M4 20h16"/>
                </svg>
              </div>
              <span className="kt-yukle-baslik">{t("cover.editor.uploadTitle")}</span>
              <span className="kt-yukle-hint">{t("cover.editor.uploadHint")}</span>
              <input ref={dosyaRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onBgDegis} />
            </div>

            {bgFoto && (
              <div className="kt-kucuk">
                <img src={bgFoto} alt="Arka plan" />
                <button className="kt-kucuk-sil" onClick={() => {
                  URL.revokeObjectURL(bgFoto); setBgFoto(null); setBgBase64(null);
                  setBgZoom(1); setBgDon(0); setBgAyna(false); setBgX(0); setBgY(0);
                }}>{t("cover.editor.remove")}</button>
              </div>
            )}

            {bgFoto && (
              <div className="kt-kontrol">
                <div className="kt-ctrl-satir">
                  <span className="kt-ctrl-etiket">{t("cover.editor.size")}</span>
                  <button className="kt-ctrl-btn" onClick={() => setBgZoom(z => Math.max(0.3, +(z - 0.1).toFixed(2)))}>−</button>
                  <input type="range" min="30" max="300" step="5"
                    value={Math.round(bgZoom * 100)}
                    onChange={e => setBgZoom(+(Number(e.target.value) / 100).toFixed(2))}
                    className="kt-slider" />
                  <button className="kt-ctrl-btn" onClick={() => setBgZoom(z => Math.min(3, +(z + 0.1).toFixed(2)))}>+</button>
                  <span className="kt-ctrl-deger">%{Math.round(bgZoom * 100)}</span>
                </div>
                <div className="kt-ctrl-satir">
                  <span className="kt-ctrl-etiket">{t("cover.editor.rotate")}</span>
                  <button className="kt-ctrl-btn" onClick={() => setBgDon(d => d - 90)}>↺</button>
                  <span className="kt-ctrl-deger kt-ctrl-orta">{((bgDon % 360) + 360) % 360}°</span>
                  <button className="kt-ctrl-btn" onClick={() => setBgDon(d => d + 90)}>↻</button>
                  <button className={`kt-ctrl-btn kt-ctrl-btn--ayna ${bgAyna ? "kt-ctrl-btn--aktif" : ""}`}
                    onClick={() => setBgAyna(a => !a)}>{t("cover.editor.mirror")}</button>
                </div>
              </div>
            )}

            {/* Ön plan */}
            <div className="kt-yukle kt-yukle-on" onClick={() => onDosyaRef.current?.click()}>
              <div className="kt-yukle-ikon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b8880" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 16V4M6 10l6-6 6 6"/><path d="M4 20h16"/>
                </svg>
              </div>
              <span className="kt-yukle-baslik">{t("cover.editor.fgTitle")}</span>
              <span className="kt-yukle-hint">{t("cover.editor.fgHint")}</span>
              <input ref={onDosyaRef} type="file" accept="image/png" style={{ display: "none" }} onChange={onDosyaIsle} />
            </div>

            {onFoto && (
              <div className="kt-kucuk">
                <img src={onFoto} alt="Ön plan" />
                <button className="kt-kucuk-sil" onClick={() => {
                  URL.revokeObjectURL(onFoto!); setOnFoto(null);
                  setOnZoom(1); setOnDon(0); setOnAyna(false); setOnX(0); setOnY(0); setSuruklHedef("bg");
                }}>{t("cover.editor.remove")}</button>
              </div>
            )}

            {onFoto && (
              <div className="kt-kontrol">
                <div className="kt-ctrl-satir">
                  <span className="kt-ctrl-etiket">{t("cover.editor.size")}</span>
                  <button className="kt-ctrl-btn" onClick={() => setOnZoom(z => Math.max(0.3, +(z - 0.1).toFixed(2)))}>−</button>
                  <input type="range" min="30" max="300" step="5"
                    value={Math.round(onZoom * 100)}
                    onChange={e => setOnZoom(+(Number(e.target.value) / 100).toFixed(2))}
                    className="kt-slider" />
                  <button className="kt-ctrl-btn" onClick={() => setOnZoom(z => Math.min(3, +(z + 0.1).toFixed(2)))}>+</button>
                  <span className="kt-ctrl-deger">%{Math.round(onZoom * 100)}</span>
                </div>
                <div className="kt-ctrl-satir">
                  <span className="kt-ctrl-etiket">{t("cover.editor.rotate")}</span>
                  <button className="kt-ctrl-btn" onClick={() => setOnDon(d => d - 90)}>↺</button>
                  <span className="kt-ctrl-deger kt-ctrl-orta">{((onDon % 360) + 360) % 360}°</span>
                  <button className="kt-ctrl-btn" onClick={() => setOnDon(d => d + 90)}>↻</button>
                  <button className={`kt-ctrl-btn kt-ctrl-btn--ayna ${onAyna ? "kt-ctrl-btn--aktif" : ""}`}
                    onClick={() => setOnAyna(a => !a)}>{t("cover.editor.mirror")}</button>
                </div>
                <div className="kt-ctrl-satir">
                  <span className="kt-ctrl-etiket">{t("cover.editor.drag")}</span>
                  <button className={`kt-ctrl-btn ${suruklHedef === "bg" ? "kt-ctrl-btn--aktif" : ""}`}
                    onClick={() => setSuruklHedef("bg")}>{t("cover.editor.bgLayer")}</button>
                  <button className={`kt-ctrl-btn ${suruklHedef === "fg" ? "kt-ctrl-btn--aktif" : ""}`}
                    onClick={() => setSuruklHedef("fg")}>{t("cover.editor.fgLayer")}</button>
                </div>
              </div>
            )}
          </div>

          {/* 02 Metinler */}
          <div className="kt-bolum">
            <div className="kt-bolum-bas">
              <span className="kt-bolum-no">02</span>
              <span className="kt-bolum-ad">{t("cover.editor.section02")}</span>
            </div>
            <div className="kt-alanlar">
              <div className="kt-alan kt-alan-tam">
                <div className="kt-etiket-satir">
                  <label className="kt-etiket">{t("cover.editor.nameLabel")}</label>
                  <label className="kt-renk-kap">
                    <span>{t("cover.editor.colorLabel")}</span>
                    <input type="color" value={baslikRenk}
                      onChange={e => setBaslikRenk(e.target.value)}
                      className="kt-renk-giris" />
                  </label>
                </div>
                <input className="kt-giris" type="text" value={ad}
                  onChange={e => setAd(e.target.value)}
                  placeholder={t("cover.editor.namePlaceholder")} maxLength={40} />
              </div>
              <div className="kt-alan kt-alan-tam">
                <label className="kt-etiket">{t("cover.editor.subtitleLabel")} <span className="kt-isteğe-bagli">{t("cover.editor.optional")}</span></label>
                <textarea className="kt-giris" value={altBaslik}
                  onChange={e => setAltBaslik(e.target.value)}
                  placeholder={t("cover.editor.subtitlePlaceholder")} maxLength={120} rows={2} />
              </div>
            </div>
          </div>

          {/* 03 Yan Yazılar */}
          <div className="kt-bolum">
            <div className="kt-bolum-bas">
              <span className="kt-bolum-no">03</span>
              <span className="kt-bolum-ad">{t("cover.editor.section03")}</span>
            </div>
            <p className="kt-surukle-ipucu">{t("cover.editor.dragTip")}</p>

            {(["sol1", "sag1", "sol2", "sag2"] as YaziKey[]).map((key) => {
              const etiket = t(`cover.editor.textLabel_${key}`);
              return (
                <div key={key} className="kt-yan-grup">
                  <div className="kt-yan-bas">
                    <span className="kt-yan-etiket">{etiket}</span>
                    <label className="kt-renk-kap">
                      <span>{t("cover.editor.colorLabel")}</span>
                      <input type="color" value={yazilar[key].renk}
                        onChange={e => yaziGuncelle(key, "renk", e.target.value)}
                        className="kt-renk-giris" />
                    </label>
                  </div>
                  <textarea className="kt-giris" rows={2} maxLength={80}
                    value={yazilar[key].metin}
                    onChange={e => yaziGuncelle(key, "metin", kelimeSiniri(e.target.value))}
                    placeholder={`${etiket}...`} />
                  <select className="kt-font-sec" value={yazilar[key].font}
                    onChange={e => yaziGuncelle(key, "font", e.target.value)}>
                    {FONTLAR.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                  <div className="kt-ctrl-satir">
                    <span className="kt-ctrl-etiket" style={{ color: "var(--kt-etiket)" }}>{t("cover.editor.size")}</span>
                    <button className="kt-ctrl-btn"
                      onClick={() => yaziGuncelle(key, "boyut", Math.max(0.8, +(yazilar[key].boyut - 0.1).toFixed(1)))}>−</button>
                    <span className="kt-ctrl-deger" style={{ color: "var(--kt-etiket)" }}>
                      {yazilar[key].boyut.toFixed(1)}
                    </span>
                    <button className="kt-ctrl-btn"
                      onClick={() => yaziGuncelle(key, "boyut", Math.min(5, +(yazilar[key].boyut + 0.1).toFixed(1)))}>+</button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 04 Arka Plan Rengi */}
          <div className="kt-bolum">
            <div className="kt-bolum-bas">
              <span className="kt-bolum-no">04</span>
              <span className="kt-bolum-ad">{t("cover.editor.section04")}</span>
            </div>
            <div className="kt-palet">
              {ARKA_PLAN_RENKLERI.map(c => (
                <button key={c.value}
                  className={`kt-renk-kare ${bgRenk === c.value ? "kt-renk-kare--aktif" : ""}`}
                  style={{ background: c.value }}
                  onClick={() => setBgRenk(c.value)} title={t(`cover.editor.bgColors.${c.key}`)}>
                  {bgRenk === c.value && (
                    <span className="kt-renk-tik" style={{ color: c.koyu ? "#111" : "#fff" }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 05 Logo Rengi */}
          {logoSrc && (
            <div className="kt-bolum">
              <div className="kt-bolum-bas">
                <span className="kt-bolum-no">05</span>
                <span className="kt-bolum-ad">{t("cover.editor.section05")}</span>
              </div>
              <div className="kt-palet">
                {LOGO_RENKLERI.map(c => (
                  <button key={c.filtre}
                    className={`kt-renk-kare ${logoFiltre === c.filtre ? "kt-renk-kare--aktif" : ""}`}
                    style={{ background: c.onizleme }}
                    onClick={() => setLogoFiltre(c.filtre)} title={t(`cover.editor.logoColors.${c.key}`)}>
                    {logoFiltre === c.filtre && (
                      <span className="kt-renk-tik" style={{ color: c.koyu ? "#111" : "#fff" }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
              <div className="kt-logo-etiketler">
                {LOGO_RENKLERI.map(c => (
                  <span key={c.filtre}
                    className={`kt-logo-etiket ${logoFiltre === c.filtre ? "kt-logo-etiket--aktif" : ""}`}
                    onClick={() => setLogoFiltre(c.filtre)}>{t(`cover.editor.logoColors.${c.key}`)}</span>
                ))}
              </div>
            </div>
          )}

          {/* Mobil butonlar */}
          <div className="kt-panel-aksiyonlar">
            <button className="kt-btn kt-btn-ghost" onClick={handleSifirla}>{t("cover.editor.resetBtn")}</button>
            <button className="kt-btn kt-btn-koyu" onClick={handleIndir} disabled={dışaAktariliyor || !bgFoto}>
              {dışaAktariliyor ? t("cover.editor.processing") : t("cover.editor.downloadBtn")}
            </button>
          </div>

          <div className="kt-devam">
            <div className="kt-devam-cizgi" />
            <button className="kt-devam-btn" onClick={handleKaydetDevam} disabled={kaydediliyor}>
              {kaydediliyor ? t("cover.editor.saving") : t("cover.editor.saveBtn")}
              <span className="kt-ok">→</span>
            </button>
          </div>

        </div>
      </section>

      {/* ══════ ÖNİZLEME ══════ */}
      <section className="kt-onizleme">
        <span className="kt-on-etiket">{t("cover.editor.previewLabel")}</span>

        <div className="kt-kapak-sahne" style={{ background: bgRenk }}>
          <div
            className="kt-kapak"
            ref={kapakRef}
            style={{ cursor: (bgFoto || onFoto) ? "grab" : "default" }}
            onMouseDown={e => suruklHedef === "fg" && onFoto ? onSuruklBasla(e) : bgSuruklBasla(e)}
            onTouchStart={e => suruklHedef === "fg" && onFoto ? onSuruklBasla(e) : bgSuruklBasla(e)}
          >
            {/* Arka plan */}
            <div className="kt-kapak-bg">
              {bgFoto && (
                <img className="kt-kapak-img" src={bgFoto} alt="" style={{
                  transform: `translate(${bgX}px,${bgY}px) scale(${bgAyna ? -bgZoom : bgZoom},${bgZoom}) rotate(${bgDon}deg)`,
                  transformOrigin: "center center",
                }} />
              )}
            </div>

            {/* Boş durum */}
            {!bgFoto && (
              <div className="kt-kapak-bos">
                <div className="kt-kapak-bos-ikon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.75)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.6"/>
                    <path d="M3 16l5-5 4 4 3-3 6 6"/>
                  </svg>
                </div>
                <div className="kt-kapak-bos-baslik">{t("cover.editor.previewEmptyTitle")}</div>
                <div className="kt-kapak-bos-alt">{t("cover.editor.previewEmptyHint")}</div>
              </div>
            )}

            {/* Logo */}
            {logoSrc && (
              <div className="kt-kapak-logo"
                style={{ filter: logoFiltre !== "none" ? logoFiltre : undefined }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoSrc} alt="Logo" className="kt-kapak-logo-img" />
              </div>
            )}

            {/* Ön plan */}
            {onFoto && (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="kt-kapak-on" src={onFoto} alt="" style={{
                transform: `translate(${onX}px,${onY}px) scale(${onAyna ? -onZoom : onZoom},${onZoom}) rotate(${onDon}deg)`,
                transformOrigin: "center top",
              }} />
            )}

            {/* Sürüklenebilir yan yazılar */}
            {([
              { key: "sol1" as YaziKey, hizala: "left",  genislik: "50%" },
              { key: "sag1" as YaziKey, hizala: "right", genislik: "40%" },
              { key: "sol2" as YaziKey, hizala: "left",  genislik: "50%" },
              { key: "sag2" as YaziKey, hizala: "right", genislik: "40%" },
            ]).map(({ key, hizala, genislik }) => (
              <textarea
                key={key}
                ref={el => { yaziRefs.current[key] = el; }}
                className="kt-yazi-ta"
                value={yazilar[key].metin}
                onChange={e => yaziGuncelle(key, "metin", kelimeSiniri(e.target.value))}
                onMouseDown={e => yaziSuruklBasla(e, key)}
                onTouchStart={e => yaziSuruklBasla(e, key)}
                rows={4} maxLength={80}
                style={{
                  left:       `${yazilar[key].x}%`,
                  top:        `${yazilar[key].y}%`,
                  color:      yazilar[key].renk,
                  fontSize:   `${yazilar[key].boyut}cqh`,
                  fontFamily: yazilar[key].font,
                  textAlign:  hizala as "left" | "right",
                  width:      genislik,
                }}
              />
            ))}

            {/* Alt bilgi */}
            <div className="kt-kapak-icerik">
              <div className="kt-kapak-alt">
                <div className="kt-kapak-baslik" style={{ color: baslikRenk }}>
                  {gosterAd.toUpperCase()}
                </div>
                {altBaslik.trim() && (
                  <div className="kt-kapak-altbaslik">{altBaslik.trim()}</div>
                )}
                <div className="kt-kapak-edition">İLKBAHAR 2026</div>
              </div>
              <div className="kt-kapak-barkod">{BARKOD}</div>
            </div>

          </div>
        </div>

        <span className="kt-on-boyut">{t("cover.editor.previewSize")}</span>

        <div className="kt-on-aksiyonlar">
          <button className="kt-btn kt-btn-ghost" onClick={handleSifirla}>{t("cover.editor.resetBtn")}</button>
          <button className="kt-btn kt-btn-koyu" onClick={handleIndir} disabled={dışaAktariliyor || !bgFoto}>
            {dışaAktariliyor ? t("cover.editor.processing") : t("cover.editor.downloadBtnShort")}
          </button>
          <button className="kt-btn kt-btn-altin" onClick={handleKaydetDevam} disabled={kaydediliyor}>
            {kaydediliyor ? t("cover.editor.saving") : t("cover.editor.saveBtnShort")}
          </button>
        </div>
      </section>

      {toast && <div className="kt-toast">{toast}</div>}

      {dışaAktariliyor && (
        <div className="kt-overlay">
          <div className="kt-spinner" />
          <div className="kt-overlay-yazi">{t("cover.editor.exporting")}</div>
        </div>
      )}
    </div>,
    document.body
  );
}
