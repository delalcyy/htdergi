"use client";

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { updateDraft, type DraftData } from "@/lib/kapak/draft-store";
import "@/styles/KapakTasarim.css";

export type KapakEditorHandle = {
  capture: () => Promise<string | null>;
};

type Props = {
  draft: DraftData;
  logoSrc?: string | null;
  userName?: string;
  embedded?: boolean;
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
  { label: "Cormorant Garamond", value: "'Cormorant Garamond', Georgia, serif" },
  { label: "Bebas Neue",         value: "'Bebas Neue', sans-serif" },
  { label: "Cinzel",             value: "'Cinzel', Georgia, serif" },
  { label: "Josefin Sans",       value: "'Josefin Sans', sans-serif" },
  { label: "Playfair Display",   value: "'Playfair Display', Georgia, serif" },
  { label: "Abril Fatface",      value: "'Abril Fatface', Georgia, serif" },
  { label: "Lora",               value: "'Lora', Georgia, serif" },
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
type DrawerTipi = "bg-foto" | "on-foto" | "bg-renk" | "logo-renk" | "isim" | "yan-yazilar";

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
const KapakEditor = forwardRef<KapakEditorHandle, Props>(function KapakEditor(
  { draft, logoSrc = null, userName = "", embedded = false },
  ref
) {
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
  const [onBase64, setOnBase64]           = useState<string | null>(null);
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
  const [acikDrawer, setAcikDrawer]           = useState<DrawerTipi | null>(null);
  const [secilenYazi, setSecilenYazi]         = useState<YaziKey>("sol1");

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen" || e.code === "PrintScreen") {
        e.preventDefault();
        setToast("Bu alanda ekran görüntüsü alınamaz.");
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(null), 2200);
      }
    };
    document.addEventListener("keydown", handler, true);
    return () => document.removeEventListener("keydown", handler, true);
  }, []);

  useEffect(() => {
    const blockTouch = (e: TouchEvent) => {
      const t = e.target as Element;
      if (!t?.closest?.(".kt-drawer-ic")) e.preventDefault();
    };
    document.addEventListener("touchmove", blockTouch, { passive: false });
    return () => document.removeEventListener("touchmove", blockTouch);
  }, []);

  // Tüm fontları önceden yükle — seçince anında görünsün
  useEffect(() => {
    FONTLAR.forEach(f => {
      const name = f.value.match(/'([^']+)'/)?.[1] ?? f.value.split(",")[0].trim();
      document.fonts.load(`600 24px "${name}"`).catch(() => {});
    });
  }, []);

  useImperativeHandle(ref, () => ({
    async capture() {
      if (!sahneRef.current) return null;
      try {
        const html2canvas = (await import("html2canvas")).default;
        const canvas = await html2canvas(sahneRef.current, {
          scale: 3, useCORS: true,
          backgroundColor: null, logging: false, scrollX: 0, scrollY: 0,
          onclone: buildOnclone(),
        });
        return canvas.toDataURL("image/png");
      } catch { return bgBase64 ?? null; }
    },
  }));

  /* Refs */
  const sahneRef   = useRef<HTMLDivElement>(null); /* kt-kapak-sahne — çerçeve dahil tüm önizleme */
  const kapakRef   = useRef<HTMLDivElement>(null);
  const dosyaRef   = useRef<HTMLInputElement>(null);
  const onDosyaRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const yaziRefs   = useRef<Record<YaziKey, HTMLElement | null>>({
    sol1: null, sag1: null, sol2: null, sag2: null,
  });

  /* ── html2canvas onclone yardımcısı ── */
  function buildOnclone() {
    /* Tüm computed değerleri orijinal DOM'dan önceden oku */
    type TaStyle = { fontSize: string; lineHeight: string; height: string; width: string; top: string; left: string; color: string; fontFamily: string; textAlign: string; letterSpacing: string; textTransform: string; textShadow: string; };
    const taStyles: TaStyle[] = [];
    let kapakW = 0;
    let kapakH = 0;
    if (kapakRef.current) {
      const rect = kapakRef.current.getBoundingClientRect();
      kapakW = rect.width;
      kapakH = rect.height;
      kapakRef.current.querySelectorAll<HTMLElement>(".kt-yazi-ta")
        .forEach(ta => {
          const cs = window.getComputedStyle(ta);
          const tr = ta.getBoundingClientRect();
          taStyles.push({
            fontSize: cs.fontSize, lineHeight: cs.lineHeight,
            height: tr.height + "px", width: tr.width + "px",
            top: (tr.top - rect.top) + "px", left: (tr.left - rect.left) + "px",
            color: cs.color, fontFamily: cs.fontFamily,
            textAlign: cs.textAlign, letterSpacing: cs.letterSpacing,
            textTransform: cs.textTransform, textShadow: cs.textShadow,
          });
        });
    }

    return (_doc: Document, el: HTMLElement) => {
      /* el = klonlanmış kt-kapak-sahne.
         İçindeki kt-kapak'a piksel boyutunu sabitle → cqh/cqw doğru hesaplanır */
      const innerKapak = el.querySelector<HTMLElement>(".kt-kapak");
      if (innerKapak && kapakW && kapakH) {
        innerKapak.style.width  = `${kapakW}px`;
        innerKapak.style.height = `${kapakH}px`;
        innerKapak.style.flex   = "none";
      }

      /* Blob URL → base64 */
      el.querySelectorAll<HTMLImageElement>(".kt-kapak-img").forEach(img => {
        if (bgBase64) img.src = bgBase64;
      });
      el.querySelectorAll<HTMLImageElement>(".kt-kapak-on").forEach(img => {
        if (onBase64) img.src = onBase64;
      });

      /* Yazi div → yeni div: tüm computed değerler px olarak uygulanır */
      el.querySelectorAll<HTMLElement>(".kt-yazi-ta").forEach((ta, idx) => {
        const s = taStyles[idx];
        const div = _doc.createElement("div");
        /* Pozisyon ve boyut tamamen computed px değerlerden: yüzde/cqh bağımlılığı yok */
        div.style.cssText = [
          "position:absolute",
          `left:${s?.left ?? ta.getAttribute("data-left") ?? "0px"}`,
          `top:${s?.top  ?? "0px"}`,
          `width:${s?.width ?? "50%"}`,
          `height:${s?.height ?? "auto"}`,
          `font-size:${s?.fontSize ?? "14px"}`,
          `line-height:${s?.lineHeight ?? "1.5"}`,
          `font-family:${s?.fontFamily ?? "inherit"}`,
          `color:${s?.color ?? "#fff"}`,
          `text-align:${s?.textAlign ?? "left"}`,
          `letter-spacing:${s?.letterSpacing ?? "normal"}`,
          `text-transform:${s?.textTransform ?? "none"}`,
          `text-shadow:${s?.textShadow ?? "none"}`,
          "background:transparent",
          "border:none",
          "outline:none",
          "padding:0",
          "margin:0",
          "overflow:visible",
          "white-space:pre-wrap",
          "word-break:break-word",
          "font-weight:500",
          "z-index:250",
          "pointer-events:none",
        ].join(";");
        div.textContent = ta.textContent;
        ta.parentNode?.replaceChild(div, ta);
      });

      /* Ad soyad textarea → div */
      el.querySelectorAll<HTMLTextAreaElement>("textarea.kt-baslik-ta").forEach(ta => {
        const cs = window.getComputedStyle(ta);
        const div = _doc.createElement("div");
        div.style.cssText = [
          `font-size:${cs.fontSize}`, `font-family:${cs.fontFamily}`,
          `font-weight:${cs.fontWeight}`, `color:${cs.color}`,
          `line-height:${cs.lineHeight}`, `letter-spacing:${cs.letterSpacing}`,
          `text-transform:uppercase`, `word-break:break-word`,
          "background:transparent", "border:none", "padding:0",
          "white-space:pre-wrap", "width:100%",
        ].join(";");
        div.textContent = ta.value.toUpperCase() || "AD SOYAD";
        ta.parentNode?.replaceChild(div, ta);
      });
    };
  }

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
    const r = new FileReader();
    r.onload = () => setOnBase64(r.result as string);
    r.readAsDataURL(dosya);
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
      /* Sürükleme olmadıysa tap → drawer aç */
      if (!surukleniyor) {
        setSecilenYazi(anahtar);
        setAcikDrawer("yan-yazilar");
      }
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
      const canvas = await html2canvas(sahneRef.current!, {
        scale: 3, useCORS: true, backgroundColor: null,
        logging: false, scrollX: 0, scrollY: 0,
        onclone: buildOnclone(),
      });
      const dataUrl = canvas.toDataURL("image/png");
      /* Gerçek canvas boyutundan sayfa oranını hesapla */
      const pw = canvas.width;
      const ph = canvas.height;
      const printWin = window.open("", "_blank");
      if (!printWin) {
        gosterToast("Açılır pencere engellendi — tarayıcı izni verin.");
        return;
      }
      printWin.document.write(`<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8"/>
<title>Kapak — Hatıra Dergi</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#c8c8c8;display:flex;flex-direction:column;align-items:center;padding:20px 0 36px;gap:16px;font-family:Arial,sans-serif;}
.no-print{display:flex;gap:10px;align-self:flex-start;margin-left:16px;}
.btn{padding:8px 18px;border:none;cursor:pointer;font-size:13px;font-family:inherit;border-radius:3px;}
.btn-print{background:#111;color:#fff;}
.btn-close{background:#ddd;color:#333;}
.wrap{background:#fff;box-shadow:0 3px 16px rgba(0,0,0,.25);line-height:0;}
.wrap img{display:block;width:100%;height:auto;}
@media print{
  .no-print{display:none;}
  html,body{margin:0;padding:0;background:#fff;width:100%;height:100%;}
  .wrap{box-shadow:none;width:100%;height:100%;display:flex;align-items:center;justify-content:center;}
  .wrap img{width:100%;height:100%;object-fit:fill;display:block;}
  @page{margin:0;size:${pw}px ${ph}px;}
}
</style>
</head>
<body>
<div class="no-print">
  <button id="p" class="btn btn-print">🖨️ PDF Olarak Yazdır / İndir</button>
  <button id="c" class="btn btn-close">Kapat</button>
</div>
<div class="wrap"><img src="${dataUrl}" alt="Kapak"/></div>
<script>
window.addEventListener('load',function(){
  document.getElementById('p').onclick=function(){window.print();};
  document.getElementById('c').onclick=function(){window.close();};
  setTimeout(function(){window.print();},400);
});
</script>
</body>
</html>`);
      printWin.document.close();
      gosterToast(t("cover.editor.toastDownloaded"));
    } catch {
      gosterToast(t("cover.editor.toastExportFailed"));
    } finally {
      setDışaAktariliyor(false);
    }
  }

  /* ── Kaydet & devam ── */
  async function handleKaydetDevam() {
    if (kaydediliyor) return;
    setKaydediliyor(true);
    try {
      updateDraft(draft.id, {
        personName: ad.trim().substring(0, 60) || null,
        subtitle:   altBaslik.trim().substring(0, 120) || null,
      });
      /* Kapak JPEG'i yakala → sessionStorage'a kaydet */
      let kapakOk = false;
      if (sahneRef.current) {
        try {
          const html2canvas = (await import("html2canvas")).default;
          const canvas = await html2canvas(sahneRef.current!, {
            scale: 2, useCORS: true,
            backgroundColor: null, logging: false, scrollX: 0, scrollY: 0,
            onclone: buildOnclone(),
          });
          const data = canvas.toDataURL("image/jpeg", 0.88);
          sessionStorage.setItem(`ht_kapak_${draft.id}`, data);
          kapakOk = true;
        } catch (e) {
          /* onclone olmadan tekrar dene */
          try {
            const html2canvas = (await import("html2canvas")).default;
            const canvas2 = await html2canvas(sahneRef.current!, {
              scale: 2, useCORS: true,
              backgroundColor: null, logging: false,
            });
            const data2 = canvas2.toDataURL("image/jpeg", 0.88);
            sessionStorage.setItem(`ht_kapak_${draft.id}`, data2);
            kapakOk = true;
          } catch (e2) {
            const msg = e2 instanceof Error ? e2.message : String(e2);
            gosterToast(`HATA: ${msg.slice(0, 100)}`);
            /* Hata varsa sayfa geçme — kullanıcı hatayı okusun */
            setKaydediliyor(false);
            return;
          }
        }
      }

      if (kapakOk || !sahneRef.current) {
        gosterToast(t("cover.editor.toastSaved"));
        setTimeout(() => {
          router.push(`/kapak-tasarla/roportaj/yeni?coverDraftId=${draft.id}`);
        }, 400);
      }
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
    setOnFoto(null); setOnBase64(null); setOnZoom(1); setOnDon(0); setOnAyna(false); setOnX(0); setOnY(0); setSuruklHedef("bg");
    setBgRenk("#111111"); setLogoFiltre("none"); setBaslikRenk("#ffffff");
    setAd(userName); setAltBaslik("");
    setYazilar({ ...VARSAYILAN_YAZILAR_TR });
    gosterToast(t("cover.editor.toastReset"));
  }

  /* ── Mobil drawer ── */
  const DRAWER_BASLIKLAR: Record<DrawerTipi, string> = {
    "bg-foto":     "Arka Plan Fotoğrafı",
    "on-foto":     "Ön Plan (PNG)",
    "bg-renk":     "Arka Plan Rengi",
    "logo-renk":   "Logo Rengi",
    "isim":        "İsim & Başlık",
    "yan-yazilar": "Yan Yazılar",
  };

  function renderDrawerIcerik() {
    switch (acikDrawer) {
      case "bg-foto": return (
        <div className="kt-bolum">
          <div className={`kt-yukle${suruklUst ? " kt-yukle--ust" : ""}`}
            onClick={() => dosyaRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setSuruklUst(true); }}
            onDragLeave={() => setSuruklUst(false)}
            onDrop={onBirak}>
            <div className="kt-yukle-ikon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b8880" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 16V4M6 10l6-6 6 6"/><path d="M4 20h16"/>
              </svg>
            </div>
            <span className="kt-yukle-baslik">{t("cover.editor.uploadTitle")}</span>
            <span className="kt-yukle-hint">{t("cover.editor.uploadHint")}</span>
          </div>
          {bgFoto && (
            <>
              <div className="kt-kucuk">
                <img src={bgFoto} alt="Arka plan" />
                <button className="kt-kucuk-sil" onClick={() => {
                  URL.revokeObjectURL(bgFoto); setBgFoto(null); setBgBase64(null);
                  setBgZoom(1); setBgDon(0); setBgAyna(false); setBgX(0); setBgY(0);
                }}>{t("cover.editor.remove")}</button>
              </div>
              <div className="kt-kontrol">
                <div className="kt-ctrl-satir">
                  <span className="kt-ctrl-etiket">{t("cover.editor.size")}</span>
                  <button className="kt-ctrl-btn" onClick={() => setBgZoom(z => Math.max(0.3, +(z - 0.1).toFixed(2)))}>−</button>
                  <input type="range" min="30" max="300" step="5" value={Math.round(bgZoom * 100)}
                    onChange={e => setBgZoom(+(Number(e.target.value) / 100).toFixed(2))} className="kt-slider" />
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
            </>
          )}
        </div>
      );

      case "on-foto": return (
        <div className="kt-bolum">
          <div className="kt-yukle kt-yukle-on" onClick={() => onDosyaRef.current?.click()}>
            <div className="kt-yukle-ikon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b8880" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 16V4M6 10l6-6 6 6"/><path d="M4 20h16"/>
              </svg>
            </div>
            <span className="kt-yukle-baslik">{t("cover.editor.fgTitle")}</span>
            <span className="kt-yukle-hint">{t("cover.editor.fgHint")}</span>
          </div>
          {onFoto && (
            <>
              <div className="kt-kucuk">
                <img src={onFoto} alt="Ön plan" />
                <button className="kt-kucuk-sil" onClick={() => {
                  URL.revokeObjectURL(onFoto!); setOnFoto(null); setOnBase64(null);
                  setOnZoom(1); setOnDon(0); setOnAyna(false); setOnX(0); setOnY(0); setSuruklHedef("bg");
                }}>{t("cover.editor.remove")}</button>
              </div>
              <div className="kt-kontrol">
                <div className="kt-ctrl-satir">
                  <span className="kt-ctrl-etiket">{t("cover.editor.size")}</span>
                  <button className="kt-ctrl-btn" onClick={() => setOnZoom(z => Math.max(0.3, +(z - 0.1).toFixed(2)))}>−</button>
                  <input type="range" min="30" max="300" step="5" value={Math.round(onZoom * 100)}
                    onChange={e => setOnZoom(+(Number(e.target.value) / 100).toFixed(2))} className="kt-slider" />
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
            </>
          )}
        </div>
      );

      case "bg-renk": return (
        <div className="kt-bolum">
          <div className="kt-palet">
            {ARKA_PLAN_RENKLERI.map(c => (
              <button key={c.value}
                className={`kt-renk-kare ${bgRenk === c.value ? "kt-renk-kare--aktif" : ""}`}
                style={{ background: c.value }}
                onClick={() => setBgRenk(c.value)} title={t(`cover.editor.bgColors.${c.key}`)}>
                {bgRenk === c.value && <span className="kt-renk-tik" style={{ color: c.koyu ? "#111" : "#fff" }}>✓</span>}
              </button>
            ))}
          </div>
        </div>
      );

      case "logo-renk": return logoSrc ? (
        <div className="kt-bolum">
          <div className="kt-palet">
            {LOGO_RENKLERI.map(c => (
              <button key={c.filtre}
                className={`kt-renk-kare ${logoFiltre === c.filtre ? "kt-renk-kare--aktif" : ""}`}
                style={{ background: c.onizleme }}
                onClick={() => setLogoFiltre(c.filtre)} title={t(`cover.editor.logoColors.${c.key}`)}>
                {logoFiltre === c.filtre && <span className="kt-renk-tik" style={{ color: c.koyu ? "#111" : "#fff" }}>✓</span>}
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
      ) : null;

      case "isim": return (
        <div className="kt-bolum">
          <div className="kt-alan">
            <div className="kt-etiket-satir">
              <label className="kt-etiket">{t("cover.editor.nameLabel")}</label>
              <label className="kt-renk-kap">
                <span>{t("cover.editor.colorLabel")}</span>
                <input type="color" value={baslikRenk}
                  onChange={e => setBaslikRenk(e.target.value)} className="kt-renk-giris" />
              </label>
            </div>
            <input className="kt-giris" type="text" value={ad}
              onChange={e => setAd(e.target.value)}
              placeholder={t("cover.editor.namePlaceholder")} />
          </div>
        </div>
      );

      case "yan-yazilar": return (
        <div className="kt-bolum">
          <div className="kt-mobil-yazi-tablar">
            {(["sol1", "sag1", "sol2", "sag2"] as YaziKey[]).map(key => (
              <button key={key}
                className={`kt-mobil-yazi-tab${secilenYazi === key ? " kt-mobil-yazi-tab--aktif" : ""}`}
                onClick={() => setSecilenYazi(key)}>
                {t(`cover.editor.textLabel_${key}`)}
              </button>
            ))}
          </div>
          <div className="kt-yan-bas">
            <span className="kt-yan-etiket">{t(`cover.editor.textLabel_${secilenYazi}`)}</span>
            <label className="kt-renk-kap">
              <span>{t("cover.editor.colorLabel")}</span>
              <input type="color" value={yazilar[secilenYazi].renk}
                onChange={e => yaziGuncelle(secilenYazi, "renk", e.target.value)} className="kt-renk-giris" />
            </label>
          </div>
          <textarea className="kt-giris" rows={2} maxLength={80}
            value={yazilar[secilenYazi].metin}
            onChange={e => yaziGuncelle(secilenYazi, "metin", kelimeSiniri(e.target.value))}
            placeholder={`${t(`cover.editor.textLabel_${secilenYazi}`)}...`} />
          <select className="kt-font-sec" value={yazilar[secilenYazi].font}
            onChange={e => yaziGuncelle(secilenYazi, "font", e.target.value)}>
            {FONTLAR.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          <div className="kt-ctrl-satir">
            <span className="kt-ctrl-etiket">{t("cover.editor.size")}</span>
            <button className="kt-ctrl-btn"
              onClick={() => yaziGuncelle(secilenYazi, "boyut", Math.max(0.8, +(yazilar[secilenYazi].boyut - 0.1).toFixed(1)))}>−</button>
            <span className="kt-ctrl-deger">{yazilar[secilenYazi].boyut.toFixed(1)}</span>
            <button className="kt-ctrl-btn"
              onClick={() => yaziGuncelle(secilenYazi, "boyut", Math.min(5, +(yazilar[secilenYazi].boyut + 0.1).toFixed(1)))}>+</button>
          </div>
        </div>
      );

      default: return null;
    }
  }

  const gosterAd = ad.trim() || userName || "Ad Soyad";

  const content = (
    <div className={`kt-app${embedded ? " kt-app--embedded" : ""}`}>

      {/* ══════ MOBİL ÜST BAR ══════ */}
      <div className="kt-mobil-ust-bar">
        <button className={`kt-araç-btn${acikDrawer === "bg-foto" ? " kt-araç-btn--aktif" : ""}`}
          onClick={() => setAcikDrawer(acikDrawer === "bg-foto" ? null : "bg-foto")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
          <span>Arka Plan</span>
        </button>
        <button className={`kt-araç-btn${acikDrawer === "on-foto" ? " kt-araç-btn--aktif" : ""}`}
          onClick={() => setAcikDrawer(acikDrawer === "on-foto" ? null : "on-foto")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="12" cy="9" r="3"/>
            <path d="M6 21v-1a6 6 0 0 1 12 0v1"/>
          </svg>
          <span>Ön Plan</span>
        </button>
        <button className={`kt-araç-btn${acikDrawer === "bg-renk" ? " kt-araç-btn--aktif" : ""}`}
          onClick={() => setAcikDrawer(acikDrawer === "bg-renk" ? null : "bg-renk")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="13.5" cy="6.5" r="1.5"/><circle cx="17.5" cy="10.5" r="1.5"/>
            <circle cx="8.5" cy="7.5" r="1.5"/><circle cx="6.5" cy="12.5" r="1.5"/>
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
          </svg>
          <span>Renk</span>
        </button>
        {logoSrc && (
          <button className={`kt-araç-btn${acikDrawer === "logo-renk" ? " kt-araç-btn--aktif" : ""}`}
            onClick={() => setAcikDrawer(acikDrawer === "logo-renk" ? null : "logo-renk")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <span>Logo</span>
          </button>
        )}
      </div>

      {/* ══════ SOL PANEL ══════ */}
      <section className="kt-panel kt-sol-panel">
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
                  URL.revokeObjectURL(onFoto!); setOnFoto(null); setOnBase64(null);
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

          {/* Butonlar */}
        </div>
      </section>

      {/* ══════ ÖNİZLEME ══════ */}
      <section className="kt-onizleme">
        <span className="kt-on-etiket">{t("cover.editor.previewLabel")}</span>

        <div className="kt-kapak-sahne" ref={sahneRef} style={{ background: bgRenk }}>
          <div
            className="kt-kapak"
            ref={kapakRef}
            style={{ cursor: (bgFoto || onFoto) ? "grab" : "default" }}
            onContextMenu={e => e.preventDefault()}
            onMouseDown={e => suruklHedef === "fg" && onFoto ? onSuruklBasla(e) : bgSuruklBasla(e)}
            onTouchStart={e => {
              if (e.touches.length === 2 && (bgFoto || onFoto)) {
                e.preventDefault();
                const t1 = e.touches[0], t2 = e.touches[1];
                const initDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
                const initZoom = suruklHedef === "fg" && onFoto ? onZoom : bgZoom;
                function pinchMove(ev: TouchEvent) {
                  if (ev.touches.length !== 2) return;
                  if (ev.cancelable) ev.preventDefault();
                  const d = Math.hypot(ev.touches[1].clientX - ev.touches[0].clientX, ev.touches[1].clientY - ev.touches[0].clientY);
                  const z = Math.max(0.3, Math.min(3, +(initZoom * d / initDist).toFixed(2)));
                  suruklHedef === "fg" && onFoto ? setOnZoom(z) : setBgZoom(z);
                }
                function pinchEnd() {
                  document.removeEventListener("touchmove", pinchMove);
                  document.removeEventListener("touchend", pinchEnd);
                }
                document.addEventListener("touchmove", pinchMove, { passive: false });
                document.addEventListener("touchend", pinchEnd);
              } else {
                suruklHedef === "fg" && onFoto ? onSuruklBasla(e) : bgSuruklBasla(e);
              }
            }}
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

            {/* Boş durum — tıklayınca fotoğraf yükle */}
            {!bgFoto && (
              <div className="kt-kapak-bos" onClick={() => dosyaRef.current?.click()} style={{ cursor: "pointer" }}>
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
              { key: "sol1" as YaziKey, genislik: "40%" },
              { key: "sag1" as YaziKey, genislik: "40%" },
              { key: "sol2" as YaziKey, genislik: "40%" },
              { key: "sag2" as YaziKey, genislik: "40%" },
            ]).map(({ key, genislik }) => (
              <div
                key={key}
                ref={el => { yaziRefs.current[key] = el; }}
                className="kt-yazi-ta"
                onMouseDown={e => yaziSuruklBasla(e, key)}
                onTouchStart={e => yaziSuruklBasla(e, key)}
                style={{
                  left:       `${yazilar[key].x}%`,
                  top:        `${yazilar[key].y}%`,
                  color:      yazilar[key].renk,
                  fontSize:   `${yazilar[key].boyut}cqh`,
                  fontFamily: yazilar[key].font,
                  textAlign:  yazilar[key].x >= 40 ? "right" : yazilar[key].x >= 20 ? "center" : "left",
                  width:      genislik,
                }}
              >
                {yazilar[key].metin}
              </div>
            ))}

            {/* Alt bilgi */}
            <div className="kt-kapak-icerik">
              <div className="kt-kapak-alt">
                <div
                  className="kt-kapak-baslik kt-baslik-tap"
                  style={{ color: baslikRenk, cursor: "pointer" }}
                  onMouseDown={e => e.stopPropagation()}
                  onTouchEnd={e => { e.stopPropagation(); e.preventDefault(); setAcikDrawer("isim"); }}
                  onClick={() => setAcikDrawer("isim")}
                >
                  {ad.trim() || <span style={{ opacity: 0.72 }}>AD SOYAD</span>}
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
            {dışaAktariliyor ? t("cover.editor.processing") : "PDF Al"}
          </button>
          {!embedded && (
            <button className="kt-btn kt-btn-altin" onClick={handleKaydetDevam} disabled={kaydediliyor}>
              {kaydediliyor ? t("cover.editor.saving") : t("cover.editor.saveBtnShort")}
            </button>
          )}
        </div>
      </section>

      {/* ══════ SAĞ PANEL ══════ */}
      <section className="kt-panel kt-sag-panel">
        <div className="kt-panel-ic">

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
                  placeholder={t("cover.editor.namePlaceholder")} />
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

        </div>
      </section>

      {/* ══════ MOBİL ALT BAR ══════ */}
      <div className="kt-mobil-alt-bar">
        <button className={`kt-araç-btn${acikDrawer === "yan-yazilar" ? " kt-araç-btn--aktif" : ""}`}
          onClick={() => setAcikDrawer(acikDrawer === "yan-yazilar" ? null : "yan-yazilar")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4 7 4 4 20 4 20 7"/>
            <line x1="9" y1="20" x2="15" y2="20"/>
            <line x1="12" y1="4" x2="12" y2="20"/>
          </svg>
          <span>Yazılar</span>
        </button>
        <button className={`kt-araç-btn${acikDrawer === "isim" ? " kt-araç-btn--aktif" : ""}`}
          onClick={() => setAcikDrawer(acikDrawer === "isim" ? null : "isim")}>
          <span className="kt-araç-aa">Aa</span>
          <span>İsim</span>
        </button>
        <button className="kt-araç-btn" onClick={handleIndir} disabled={dışaAktariliyor || !bgFoto}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <span>PDF</span>
        </button>
        {!embedded && (
          <button className="kt-araç-btn kt-araç-btn--altin" onClick={handleKaydetDevam} disabled={kaydediliyor}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>Kaydet</span>
          </button>
        )}
      </div>

      {/* ══════ DRAWER ══════ */}
      {acikDrawer && <div className="kt-drawer-overlay" onClick={() => setAcikDrawer(null)} />}
      <div className={`kt-drawer${acikDrawer ? " kt-drawer--acik" : ""}`} aria-hidden={!acikDrawer}>
        <div className="kt-drawer-tutamac" />
        <div className="kt-drawer-baslik">
          <span className="kt-drawer-baslik-yazi">{acikDrawer ? DRAWER_BASLIKLAR[acikDrawer] : ""}</span>
          <button className="kt-drawer-kapat" onClick={() => setAcikDrawer(null)}>✕</button>
        </div>
        <div className="kt-drawer-ic">
          {renderDrawerIcerik()}
        </div>
      </div>

      {toast && <div className="kt-toast">{toast}</div>}

      {dışaAktariliyor && (
        <div className="kt-overlay">
          <div className="kt-spinner" />
          <div className="kt-overlay-yazi">{t("cover.editor.exporting")}</div>
        </div>
      )}
    </div>
  );

  if (!mounted) return null;
  return embedded ? content : createPortal(content, document.body);
});

export default KapakEditor;
