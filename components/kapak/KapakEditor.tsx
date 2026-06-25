"use client";

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { updateDraft, type DraftData } from "@/lib/kapak/draft-store";
import { moderateTexts, containsBlockedWord } from "@/lib/moderation/textModeration";
import "@/styles/KapakTasarim.css";

export type KapakEditorHandle = {
  capture: () => Promise<string | null>;
};

type Props = {
  draft: DraftData;
  logoSrc?: string | null;
  logoStyle?: React.CSSProperties;
  logoImgStyle?: React.CSSProperties;
  logoFiltreKapat?: boolean;
  logoEmblemGenis?: number;
  varsayilanYaziMetinleri?: Partial<Record<YaziKey, string>>;
  userName?: string;
  embedded?: boolean;
  sadeceOnKapak?: boolean;
  unluGorselUrl?: string | null;
  unluAdi?: string | null;
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
  { key: "yesil",     filtre: "sepia(1) saturate(8) hue-rotate(90deg) brightness(0.75)",                   onizleme: "#1a7a2e", koyu: false },
  { key: "kirmizi",   filtre: "sepia(1) saturate(8) hue-rotate(330deg) brightness(0.7)",                   onizleme: "#b81c1c", koyu: false },
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

// EAN-13 kodlama tabloları
const EAN_L = ['0001101','0011001','0010011','0111101','0100011','0110001','0101111','0111011','0110111','0001011'];
const EAN_G = ['0100111','0110011','0011011','0100001','0011101','0111001','0000101','0010001','0001001','0010111'];
const EAN_R = ['1110010','1100110','1101100','1000010','1011100','1001110','1010000','1000100','1001000','1110100'];
const EAN_FIRST = ['LLLLLL','LLGLGG','LLGGLG','LLGGGL','LGLLGG','LGGLLG','LGGGLL','LGLGLG','LGLGGL','LGGLGL'];

// Guard bar pozisyonları (bit index aralıkları)
const GUARD_RANGES = [[7,9],[52,56],[99,101]] as const;

function BarkodSVG({ serial }: { serial: string }) {
  const raw = serial.replace(/\D/g, '').padEnd(13, '0').slice(0, 13);
  const d = raw.split('').map(Number);
  const fp = EAN_FIRST[d[0]] ?? 'LLLLLL';

  let bits = '0000000';
  bits += '101';
  for (let i = 1; i <= 6; i++) bits += fp[i-1] === 'G' ? EAN_G[d[i]] : EAN_L[d[i]];
  bits += '01010';
  for (let i = 7; i <= 12; i++) bits += EAN_R[d[i]];
  bits += '101';
  bits += '0000000';

  function isGuard(pos: number) {
    return GUARD_RANGES.some(([s, e]) => pos >= s && pos <= e);
  }

  const rects: { x: number; w: number; guard: boolean }[] = [];
  let i = 0, x = 0;
  while (i < bits.length) {
    const bit = bits[i];
    let run = 0;
    const sx = x;
    while (i < bits.length && bits[i] === bit) { run++; i++; }
    if (bit === '1') rects.push({ x: sx, w: run, guard: isGuard(sx) });
    x += run;
  }

  return (
    <>
      {/* Barlar: guard barlar data barlardan biraz uzun */}
      <svg viewBox="0 0 109 46" preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '16px', display: 'block' }}>
        {rects.map(({ x: bx, w, guard }, idx) => (
          <rect key={idx} x={bx} y={0} width={w} height={guard ? 46 : 38} fill="#111" />
        ))}
      </svg>
      {/* Rakamlar: quiet(d0) | start-guard | sol-6 | center-guard | sağ-6 | end+quiet */}
      <div className="kt-barkod-digits">
        <span className="kt-barkod-d0">{d[0]}</span>
        <span className="kt-barkod-sg" />
        <span className="kt-barkod-sol">{d.slice(1, 7).join('')}</span>
        <span className="kt-barkod-orta" />
        <span className="kt-barkod-sag">{d.slice(7, 13).join('')}</span>
      </div>
    </>
  );
}

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
type DrawerTipi = "bg-foto" | "on-foto" | "bg-renk" | "logo-renk" | "isim" | "yan-yazilar" | "sirt";

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
  { draft, logoSrc = null, logoStyle, logoImgStyle, logoFiltreKapat = false, logoEmblemGenis, varsayilanYaziMetinleri, userName = "", embedded = false, sadeceOnKapak = false, unluGorselUrl = null, unluAdi = null },
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
  const [onArkaPlanSiliniyor, setOnArkaPlanSiliniyor] = useState(false);

  /* Renkler */
  const [bgRenk, setBgRenk]               = useState("#111111");
  const [logoFiltre, setLogoFiltre]       = useState("none");
  const [baslikRenk, setBaslikRenk]       = useState("#ffffff");

  /* Sırt */
  const [sirtYazi, setSirtYazi]       = useState("");
  const [sirtYaziRenk, setSirtYaziRenk] = useState("#ffffff");
  const [sirtFont, setSirtFont]       = useState(FONTLAR[0].value);

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
  const [yazilar, setYazilar] = useState<Record<YaziKey, Yazi>>(() => {
    if (!varsayilanYaziMetinleri) return { ...VARSAYILAN_YAZILAR_TR };
    const base = { ...VARSAYILAN_YAZILAR_TR };
    (Object.keys(varsayilanYaziMetinleri) as YaziKey[]).forEach(k => {
      if (varsayilanYaziMetinleri[k] !== undefined) base[k] = { ...base[k], metin: varsayilanYaziMetinleri[k]! };
    });
    return base;
  });

  /* UI */
  const [dışaAktariliyor, setDışaAktariliyor] = useState(false);
  const [kaydediliyor, setKaydediliyor]       = useState(false);
  const [toast, setToast]                     = useState<string | null>(null);
  const [yasakHata, setYasakHata]             = useState<string | null>(null);
  const [suruklUst, setSuruklUst]             = useState(false);
  const [mounted, setMounted]                 = useState(false);
  const [acikDrawer, setAcikDrawer]           = useState<DrawerTipi | null>(null);
  const [secilenYazi, setSecilenYazi]         = useState<YaziKey>("sol1");

  /* ── Birleştirme Düzenleyici ── */
  const [yyAcik, setYyAcik]                 = useState(false);
  const [yyKullaniciImg, setYyKullaniciImg] = useState<HTMLImageElement | null>(null);
  const [yyUnluImgEl, setYyUnluImgEl]       = useState<HTMLImageElement | null>(null);
  const [yyZoom, setYyZoom]                 = useState(1);
  const [yyX, setYyX]                       = useState(0);
  const [yyY, setYyY]                       = useState(0);
  const [yyUnluZoom, setYyUnluZoom]         = useState(1);
  const [yyUnluX, setYyUnluX]               = useState(0);
  const [yyUnluY, setYyUnluY]               = useState(0);
  const [yyMod, setYyMod]                   = useState<"yanyanya"|"ustuste"|"feather">("yanyanya");
  const [yyOpacity, setYyOpacity]           = useState(0.65);
  const [yyFiltre, setYyFiltre]             = useState<"none"|"bw"|"sepia"|"warm"|"cool"|"sinemask">("none");
  const [yyHedef, setYyHedef]               = useState<"unlu"|"kullanici">("kullanici");
  const [yyAiYukleniyor, setYyAiYukleniyor] = useState(false);
  const [yyAiSonuc, setYyAiSonuc]           = useState<string|null>(null);
  const [yyAiHata, setYyAiHata]             = useState<string|null>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (yyAcik) yyRender(yyZoom, yyX, yyY);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yyAcik, yyZoom, yyX, yyY, yyUnluZoom, yyUnluX, yyUnluY, yyMod, yyOpacity, yyFiltre, yyKullaniciImg, yyUnluImgEl]);

  useEffect(() => {
    const ssToast = () => {
      setToast("Bu alanda ekran görüntüsü alınamaz.");
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(null), 2200);
    };

    // Klavye: PrintScreen + yaygın kombinasyonlar
    const onKey = (e: KeyboardEvent) => {
      if (
        e.key === "PrintScreen" || e.code === "PrintScreen" ||
        (e.metaKey && e.shiftKey && (e.key === "3" || e.key === "4" || e.key === "5")) ||
        (e.ctrlKey && e.key === "PrintScreen")
      ) {
        e.preventDefault();
        ssToast();
      }
    };

    // Sayfa gizlenince (bazı cihazlarda SS anında tetiklenir)
    const onVisibility = () => {
      if (document.hidden) ssToast();
    };

    document.addEventListener("keydown", onKey, true);
    document.addEventListener("keyup", onKey, true);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("keyup", onKey, true);
      document.removeEventListener("visibilitychange", onVisibility);
    };
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
  const sahneRef      = useRef<HTMLDivElement>(null); /* kt-kapak-sahne — çerçeve dahil tüm önizleme */
  const kapakRef      = useRef<HTMLDivElement>(null);
  const dosyaRef      = useRef<HTMLInputElement>(null);
  const onDosyaRef    = useRef<HTMLInputElement>(null);
  const yanYanaRef    = useRef<HTMLInputElement>(null);
  const yyCanvasRef         = useRef<HTMLCanvasElement>(null);
  const yySuruklD           = useRef({ aktif: false, basX: 0, basY: 0, startX: 0, startY: 0 });
  const yyKullaniciCorrRef  = useRef<HTMLCanvasElement | null>(null); // renk düzeltmeli kullanıcı görseli
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
    // Barkod'un orijinal DOM'daki pixel konumu ve boyutu
    type BarkodInfo = { right: number; bottom: number; width: number; height: number; svgH: number };
    let barkodInfo: BarkodInfo | null = null;
    if (kapakRef.current) {
      const rect = kapakRef.current.getBoundingClientRect();
      kapakW = rect.width;
      kapakH = rect.height;
      const origBarkod = kapakRef.current.querySelector<HTMLElement>(".kt-kapak-barkod");
      if (origBarkod) {
        const br = origBarkod.getBoundingClientRect();
        const svg = origBarkod.querySelector("svg");
        barkodInfo = {
          right:  rect.right  - br.right,
          bottom: rect.bottom - br.bottom,
          width:  br.width,
          height: br.height,
          svgH:   svg ? svg.getBoundingClientRect().height : 16,
        };
      }
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
      /* Watermark'ı export'tan kaldır */
      el.querySelectorAll(".kt-watermark").forEach(wm => wm.remove());

      /* Barkod: HTML digits clone'da kayıyor — rakamları SVG içine text node olarak ekle */
      if (barkodInfo) {
        const barkod = el.querySelector<HTMLElement>(".kt-kapak-barkod");
        if (barkod) {
          const bw = barkodInfo.width;
          const dw = bw - 4;
          // Rakamları HTML span'lardan oku
          const d0txt  = barkod.querySelector(".kt-barkod-d0")?.textContent  ?? "";
          const soltxt = barkod.querySelector(".kt-barkod-sol")?.textContent ?? "";
          const sagtxt = barkod.querySelector(".kt-barkod-sag")?.textContent ?? "";
          // HTML digits div'i kaldır — SVG içine taşınacak
          barkod.querySelector(".kt-barkod-digits")?.remove();
          // Barkod konteyneri sabitle
          barkod.style.cssText = `position:absolute;right:${barkodInfo.right}px;bottom:${barkodInfo.bottom}px;width:${bw}px;background:#fff;border-radius:1px;padding:3px 2px 1px;box-sizing:border-box;`;
          const svg = barkod.querySelector<SVGElement>("svg");
          if (svg) {
            // Mevcut boyutlar: viewBox "0 0 109 46", bars h=38(data)/46(guard)
            // Genişletilmiş viewBox: 0 0 109 60 (14 unit ekstra, text alanı için)
            const newVBH = 60;
            const totalPxH = barkodInfo.svgH + 5; // bars + text alanı px
            svg.setAttribute("viewBox", `0 0 109 ${newVBH}`);
            svg.style.cssText = `width:${dw}px;height:${totalPxH}px;display:block;`;
            // font-size SVG birimi: 5px hedef / (totalPxH/newVBH px_per_unit)
            const fsvg = (5 * newVBH / totalPxH).toFixed(1);
            const textY = "51"; // viewBox içinde text baseline
            const svgNS = "http://www.w3.org/2000/svg";
            const addT = (x: number, txt: string, tlen: number) => {
              if (!txt) return;
              const t = _doc.createElementNS(svgNS, "text");
              t.setAttribute("x", String(x));
              t.setAttribute("y", textY);
              t.setAttribute("text-anchor", "middle");
              t.setAttribute("font-size", fsvg);
              t.setAttribute("font-family", "Courier New, monospace");
              t.setAttribute("fill", "#111");
              t.setAttribute("textLength", String(tlen));
              t.setAttribute("lengthAdjust", "spacing");
              t.textContent = txt;
              svg.appendChild(t);
            };
            addT(3.5,  d0txt,  6);  // ilk rakam — quiet zone
            addT(31,   soltxt, 38); // sol 6 rakam — left data area
            addT(78,   sagtxt, 38); // sağ 6 rakam — right data area
          }
        }
      }

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

  /* ── Ön plan (otomatik arka plan silme — server-side) ── */
  async function onDosyaIsle(e: React.ChangeEvent<HTMLInputElement>) {
    const dosya = e.target.files?.[0];
    if (!dosya) return;
    if (onFoto) URL.revokeObjectURL(onFoto);
    setOnZoom(1); setOnDon(0); setOnAyna(false); setOnX(0); setOnY(0);
    setOnArkaPlanSiliniyor(true);
    try {
      const form = new FormData();
      form.append("gorsel", dosya);
      const res = await fetch("/api/arka-plan-sil", { method: "POST", body: form });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const sonucBlob = await res.blob();
      const url = URL.createObjectURL(sonucBlob);
      setOnFoto(url);
      setSuruklHedef("fg");
      const r = new FileReader();
      r.onload = () => setOnBase64(r.result as string);
      r.readAsDataURL(sonucBlob);
    } catch {
      const url = URL.createObjectURL(dosya);
      setOnFoto(url);
      setSuruklHedef("fg");
      const r = new FileReader();
      r.onload = () => setOnBase64(r.result as string);
      r.readAsDataURL(dosya);
    } finally {
      setOnArkaPlanSiliniyor(false);
    }
  }

  /* Fotoğrafları yükle → düzenleyiciyi aç */
  async function yanYanaBirlestir(kullaniciFoto: File) {
    if (!unluGorselUrl) return;
    setOnArkaPlanSiliniyor(true);
    try {
      const unluBlob = await fetch(unluGorselUrl).then(r => r.blob());

      function blobToImg(blob: Blob): Promise<HTMLImageElement> {
        return new Promise((res, rej) => {
          const img = new Image(); img.onload = () => res(img); img.onerror = rej;
          img.src = URL.createObjectURL(blob);
        });
      }
      function fileToImg(file: File): Promise<HTMLImageElement> {
        return new Promise((res, rej) => {
          const img = new Image(); img.onload = () => res(img); img.onerror = rej;
          const r = new FileReader();
          r.onload = ev => { img.src = ev.target?.result as string; };
          r.readAsDataURL(file);
        });
      }

      const [unluImg, kullaniciImg] = await Promise.all([blobToImg(unluBlob), fileToImg(kullaniciFoto)]);

      yyKullaniciCorrRef.current = null;

      setYyUnluImgEl(unluImg);
      setYyKullaniciImg(kullaniciImg);
      setYyZoom(1); setYyX(0); setYyY(0);
      setYyUnluZoom(1); setYyUnluX(-300); setYyUnluY(0); // ünlü sol yarıya odaklı başlar
      setYyMod("yanyanya"); setYyFiltre("none"); setYyHedef("kullanici");
      setYyAcik(true);
    } catch {
      gosterToast("Görsel yüklenemedi.");
    } finally {
      setOnArkaPlanSiliniyor(false);
    }
  }

  /* Histogram eşitleme: CDF tabanlı kanal eşlemesi */
  function yyHistEsit(img: HTMLImageElement, hedefImg: HTMLImageElement, guc = 0.80): HTMLCanvasElement {
    const mk = (w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] => {
      const c = document.createElement("canvas"); c.width = w; c.height = h;
      return [c, c.getContext("2d", { willReadFrequently: true })!];
    };
    const SAMP = 600;
    const ss = Math.min(1, SAMP / Math.max(img.width, img.height));
    const ws = Math.round(img.width * ss), hs = Math.round(img.height * ss);
    const ts = Math.min(1, SAMP / Math.max(hedefImg.width, hedefImg.height));
    const wt = Math.round(hedefImg.width * ts), ht = Math.round(hedefImg.height * ts);
    const [, sCtx] = mk(ws, hs); sCtx.drawImage(img, 0, 0, ws, hs);
    const sd = sCtx.getImageData(0, 0, ws, hs).data;
    const [, tCtx] = mk(wt, ht); tCtx.drawImage(hedefImg, 0, 0, wt, ht);
    const td = tCtx.getImageData(0, 0, wt, ht).data;
    const lut: [Uint8ClampedArray, Uint8ClampedArray, Uint8ClampedArray] = [
      new Uint8ClampedArray(256), new Uint8ClampedArray(256), new Uint8ClampedArray(256)
    ];
    for (let ch = 0; ch < 3; ch++) {
      const srcH = new Float32Array(256), tgtH = new Float32Array(256);
      let sn = 0, tn = 0;
      for (let i = 0; i < sd.length; i += 4) { if (sd[i+3] > 10) { srcH[sd[i+ch]]++; sn++; } }
      for (let i = 0; i < td.length; i += 4) { if (td[i+3] > 10) { tgtH[td[i+ch]]++; tn++; } }
      const sCdf = new Float32Array(256), tCdf = new Float32Array(256);
      let sc = 0, tc = 0;
      for (let v = 0; v < 256; v++) { sc += srcH[v]/(sn||1); sCdf[v]=sc; tc += tgtH[v]/(tn||1); tCdf[v]=tc; }
      let j = 0;
      for (let v = 0; v < 256; v++) { while (j < 255 && tCdf[j] < sCdf[v]) j++; lut[ch][v] = j; }
    }
    const MAX = 2000;
    const os = Math.min(1, MAX / Math.max(img.width, img.height));
    const wo = Math.round(img.width * os), ho = Math.round(img.height * os);
    const [outC, oCtx] = mk(wo, ho); oCtx.drawImage(img, 0, 0, wo, ho);
    const od = oCtx.getImageData(0, 0, wo, ho); const px = od.data;
    for (let i = 0; i < px.length; i += 4) {
      if (px[i+3] > 10) {
        px[i]  =Math.round(px[i]  *(1-guc)+lut[0][px[i]]  *guc);
        px[i+1]=Math.round(px[i+1]*(1-guc)+lut[1][px[i+1]]*guc);
        px[i+2]=Math.round(px[i+2]*(1-guc)+lut[2][px[i+2]]*guc);
      }
    }
    oCtx.putImageData(od, 0, 0);
    return outC;
  }

  /* Filtre uygula (closure ile yyFiltre'yi okur) */
  function yyFiltreCanvas(ctx: CanvasRenderingContext2D, W: number, H: number): void {
    if (yyFiltre === "none") return;
    const od = ctx.getImageData(0, 0, W, H); const px = od.data;
    const sc = (v: number) => { const n=v/255; return ((n<0.5?2*n*n:-1+(4-2*n)*n)*255)|0; };
    for (let i = 0; i < px.length; i += 4) {
      if (px[i+3] < 10) continue;
      const r=px[i], g=px[i+1], b=px[i+2];
      if (yyFiltre==="bw")       { const gr=(0.299*r+0.587*g+0.114*b)|0; px[i]=px[i+1]=px[i+2]=gr; }
      else if (yyFiltre==="sepia") { px[i]=Math.min(255,(r*.393+g*.769+b*.189)|0); px[i+1]=Math.min(255,(r*.349+g*.686+b*.168)|0); px[i+2]=Math.min(255,(r*.272+g*.534+b*.131)|0); }
      else if (yyFiltre==="warm")  { px[i]=Math.min(255,(r*1.12)|0); px[i+1]=Math.min(255,(g*1.04)|0); px[i+2]=Math.min(255,(b*.82)|0); }
      else if (yyFiltre==="cool")  { px[i]=Math.min(255,(r*.88)|0); px[i+2]=Math.min(255,(b*1.18)|0); }
      else if (yyFiltre==="sinemask") { px[i]=Math.min(255,(sc(r)*.92)|0); px[i+1]=Math.min(255,(sc(g)*.95)|0); px[i+2]=Math.min(255,((sc(b)*1.08)|0)+8); }
    }
    ctx.putImageData(od, 0, 0);
  }

  /* Görüntüyü zoom+offset ile belirtilen alana konumlandır */
  function yyPosImg(
    dCtx: CanvasRenderingContext2D, img: CanvasImageSource, imgW: number, imgH: number,
    areaX: number, areaY: number, areaW: number, areaH: number,
    z: number, ox: number, oy: number, ps: number
  ) {
    const asp=imgW/imgH, aAsp=areaW/areaH;
    const bW=asp>aAsp?areaH*asp:areaW, bH=asp>aAsp?areaH:areaW/asp;
    const dW=bW*z, dH=bH*z;
    const cx=areaX+areaW/2+ox*ps, cy=areaY+areaH/2+oy*ps;
    dCtx.drawImage(img, cx-dW/2, cy-dH/2, dW, dH);
  }

  /* Birleştirme — 3 mod + filtre */
  function yyKompose(ctx: CanvasRenderingContext2D, CW: number, CH: number, zoom: number, offX: number, offY: number, ps: number) {
    if (!yyKullaniciImg || !yyUnluImgEl) return;
    const CENTER=CW/2, halfW=CW/2;
    const mk = (w: number, h: number): HTMLCanvasElement => { const c=document.createElement("canvas"); c.width=w; c.height=h; return c; };
    const userSrc: CanvasImageSource = yyKullaniciCorrRef.current ?? yyKullaniciImg;
    const uW=yyKullaniciCorrRef.current?.width??yyKullaniciImg.width;
    const uH=yyKullaniciCorrRef.current?.height??yyKullaniciImg.height;
    const vW=yyUnluImgEl.width, vH=yyUnluImgEl.height;

    if (yyMod === "yanyanya") {
      // 1. Koyu arka plan — boşluk kalmaz
      ctx.fillStyle = "#111";
      ctx.fillRect(0, 0, CW, CH);

      // 2. Ünlü: tam kanvas, maske YOK (arka plan katmanı) — kollar/vücut kırpılmaz
      yyPosImg(ctx, yyUnluImgEl, vW, vH, 0, 0, CW, CH, yyUnluZoom, yyUnluX, yyUnluY, ps);

      // 3. Kullanıcı: sağ yarıya konumlandır, soldan sağa fade ile belirir
      const BLEND = CW * 0.28;
      const sagC=mk(CW,CH); const rCtx=sagC.getContext("2d")!;
      yyPosImg(rCtx, userSrc, uW, uH, CENTER, 0, halfW, CH, zoom, offX, offY, ps);
      const rg=rCtx.createLinearGradient(CENTER-BLEND,0,CENTER+BLEND,0);
      rg.addColorStop(0,"rgba(0,0,0,0)"); rg.addColorStop(1,"rgba(0,0,0,1)");
      rCtx.globalCompositeOperation="destination-in"; rCtx.fillStyle=rg; rCtx.fillRect(0,0,CW,CH);
      ctx.drawImage(sagC,0,0);

    } else if (yyMod === "ustuste") {
      ctx.fillStyle="#111"; ctx.fillRect(0,0,CW,CH);
      const solC=mk(CW,CH); const sCtx=solC.getContext("2d")!;
      yyPosImg(sCtx, yyUnluImgEl, vW, vH, 0, 0, CW, CH, yyUnluZoom, yyUnluX, yyUnluY, ps);
      ctx.drawImage(solC,0,0);
      const sagC=mk(CW,CH); const rCtx=sagC.getContext("2d")!;
      yyPosImg(rCtx, userSrc, uW, uH, 0, 0, CW, CH, zoom, offX, offY, ps);
      ctx.globalAlpha=yyOpacity; ctx.drawImage(sagC,0,0); ctx.globalAlpha=1;

    } else { // feather — eliptik yumuşak geçiş
      ctx.fillStyle="#111"; ctx.fillRect(0,0,CW,CH);
      const solC=mk(CW,CH); const sCtx=solC.getContext("2d")!;
      yyPosImg(sCtx, yyUnluImgEl, vW, vH, 0, 0, CW, CH, yyUnluZoom, yyUnluX, yyUnluY, ps);
      ctx.drawImage(solC,0,0);

      const sagC=mk(CW,CH); const rCtx=sagC.getContext("2d")!;
      yyPosImg(rCtx, userSrc, uW, uH, CENTER, 0, halfW, CH, zoom, offX, offY, ps);
      const maskC=mk(CW,CH); const mCtx=maskC.getContext("2d")!;
      mCtx.save();
      mCtx.translate(CENTER+halfW/2, CH/2);
      mCtx.scale(halfW*0.56, CH*0.53);
      const radGrad=mCtx.createRadialGradient(0,0,0,0,0,1);
      radGrad.addColorStop(0.45,"rgba(0,0,0,1)"); radGrad.addColorStop(1.0,"rgba(0,0,0,0)");
      mCtx.fillStyle=radGrad; mCtx.fillRect(-2,-2,4,4);
      mCtx.restore();
      rCtx.globalCompositeOperation="destination-in"; rCtx.drawImage(maskC,0,0);
      ctx.drawImage(sagC,0,0);
    }
    yyFiltreCanvas(ctx, CW, CH);
  }

  function yyRender(zoom: number, offX: number, offY: number) {
    const canvas=yyCanvasRef.current;
    if (!canvas||!yyKullaniciImg||!yyUnluImgEl) return;
    const PW=canvas.width, PH=canvas.height;
    const ctx=canvas.getContext("2d")!;
    ctx.clearRect(0,0,PW,PH);
    yyKompose(ctx, PW, PH, zoom, offX, offY, PW/1200);
  }

  function yyKanvasCiz(): string {
    const W=1200, H=1600;
    const canvas=document.createElement("canvas"); canvas.width=W; canvas.height=H;
    const ctx=canvas.getContext("2d")!;
    yyKompose(ctx, W, H, yyZoom, yyX, yyY, 1);
    return canvas.toDataURL("image/png");
  }

  function yyUygula() {
    if (!yyKullaniciImg||!yyUnluImgEl) return;
    const dataUrl = yyAiSonuc ?? yyKanvasCiz();
    if (onFoto) URL.revokeObjectURL(onFoto);
    setOnFoto(dataUrl); setOnBase64(dataUrl);
    setOnZoom(1); setOnDon(0); setOnAyna(false); setOnX(0); setOnY(0);
    setYyAcik(false);
    setYyAiSonuc(null); setYyAiHata(null);
  }

  async function yyAiBirlestir() {
    if (!yyKullaniciImg || !yyUnluImgEl) return;
    setYyAiYukleniyor(true);
    setYyAiSonuc(null);
    setYyAiHata(null);
    try {
      const W = 1200, H = 1600;
      const mk = (w: number, h: number) => { const c = document.createElement("canvas"); c.width=w; c.height=h; return c; };

      // 1. Composite canvas
      const compC = mk(W, H);
      yyKompose(compC.getContext("2d")!, W, H, yyZoom, yyX, yyY, 1);

      // 2. Alpha kanalından kişi bölgelerini tespit et → maske oluştur
      const userSrc = yyKullaniciCorrRef.current ?? yyKullaniciImg;
      const uW = yyKullaniciCorrRef.current?.width ?? yyKullaniciImg.width;
      const uH = yyKullaniciCorrRef.current?.height ?? yyKullaniciImg.height;
      const vW = yyUnluImgEl.width, vH = yyUnluImgEl.height;

      // Alpha kanalı tespiti: arka plan silinmiş mi?
      const alphaC = mk(W, H);
      const aCtx = alphaC.getContext("2d")!;
      yyPosImg(aCtx, yyUnluImgEl, vW, vH, 0, 0, W, H, yyUnluZoom, yyUnluX, yyUnluY, 1);
      yyPosImg(aCtx, userSrc, uW, uH, W/2, 0, W/2, H, yyZoom, yyX, yyY, 1);
      const alphaData = aCtx.getImageData(0, 0, W, H).data;

      // Kaç piksel şeffaf? → arka plan silinmiş mi kontrol et
      let seffafSayisi = 0;
      for (let i = 3; i < alphaData.length; i += 4) if (alphaData[i] < 30) seffafSayisi++;
      const arkaplanSilinmis = seffafSayisi > (W * H * 0.05); // %5'ten fazla şeffaf piksel varsa

      const maskC = mk(W, H);
      const mCtx = maskC.getContext("2d")!;

      if (arkaplanSilinmis) {
        // İki kişi de arka plansız: şeffaf alanları doldur (arka plan + boşluk)
        mCtx.fillStyle = "white"; mCtx.fillRect(0, 0, W, H);
        const maskImg = mCtx.getImageData(0, 0, W, H);
        for (let i = 0; i < alphaData.length; i += 4) {
          if (alphaData[i + 3] > 30) {
            maskImg.data[i] = 0; maskImg.data[i+1] = 0; maskImg.data[i+2] = 0; maskImg.data[i+3] = 255;
          }
        }
        mCtx.putImageData(maskImg, 0, 0);
      } else {
        // Arka plan tam → sadece iki görselin birleşim seam'ini maskele
        mCtx.fillStyle = "black"; mCtx.fillRect(0, 0, W, H);
        const seamW = W * 0.32;
        const grad = mCtx.createLinearGradient(W/2 - seamW/2, 0, W/2 + seamW/2, 0);
        grad.addColorStop(0, "black");
        grad.addColorStop(0.25, "white");
        grad.addColorStop(0.75, "white");
        grad.addColorStop(1, "black");
        mCtx.fillStyle = grad;
        mCtx.fillRect(W/2 - seamW/2, 0, seamW, H);
      }

      // 3. Composite + maske → API
      const toBlob = (c: HTMLCanvasElement) => new Promise<Blob>((res, rej) =>
        c.toBlob(b => b ? res(b) : rej(new Error("blob")), "image/png")
      );
      const [compBlob, maskBlob] = await Promise.all([toBlob(compC), toBlob(maskC)]);

      const fd = new FormData();
      fd.append("image", compBlob, "composite.png");
      fd.append("mask",  maskBlob, "mask.png");
      fd.append("prompt",
        "Two people standing together in a professional photo, realistic shared background, " +
        "same natural lighting and shadows, seamless environment, photorealistic single camera shot"
      );

      const response = await fetch("/api/generate", { method: "POST", body: fd });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? `HTTP ${response.status}`);
      setYyAiSonuc(data.url);
    } catch (e: unknown) {
      setYyAiHata(e instanceof Error ? e.message : "Hata oluştu");
    } finally {
      setYyAiYukleniyor(false);
    }
  }

  function yyPointerBasla(e: React.PointerEvent<HTMLCanvasElement>) {
    (e.currentTarget as HTMLCanvasElement).setPointerCapture(e.pointerId);
    const sX=yyHedef==="unlu"?yyUnluX:yyX, sY=yyHedef==="unlu"?yyUnluY:yyY;
    yySuruklD.current={aktif:true, basX:e.clientX, basY:e.clientY, startX:sX, startY:sY};
  }
  function yyPointerHareket(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!yySuruklD.current.aktif) return;
    const canvas=yyCanvasRef.current!;
    const rect=canvas.getBoundingClientRect();
    const dx=(e.clientX-yySuruklD.current.basX)*(1200/rect.width);
    const dy=(e.clientY-yySuruklD.current.basY)*(1600/rect.height);
    const nx=yySuruklD.current.startX+dx, ny=yySuruklD.current.startY+dy;
    if (yyHedef==="unlu") { setYyUnluX(nx); setYyUnluY(ny); yyRender(yyZoom, yyX, yyY); }
    else { setYyX(nx); setYyY(ny); yyRender(yyZoom, nx, ny); }
  }
  function yyPointerBitir() { yySuruklD.current.aktif=false; }

  function unluGorselYukle() {
    yanYanaRef.current?.click();
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

  /* ── Birleşik PDF (arka kapak + sırt + ön kapak) ── */
  async function handleIndir() {
    if (dışaAktariliyor) return;

    /* window.open senkron (click handler'da) çağrılmalı — await sonrası popup engellenir */
    const printWin = window.open("", "_blank");
    if (!printWin) {
      gosterToast("Açılır pencere engellendi — tarayıcı izni verin.");
      return;
    }
    printWin.document.write("<html><body style='font-family:Arial;text-align:center;padding:60px;color:#888;font-size:15px'>Kapak hazırlanıyor…</body></html>");

    setDışaAktariliyor(true);
    try {
      const html2canvas = (await import("html2canvas")).default;

      /* Sadece ön kapak modu */
      if (sadeceOnKapak) {
        const onCanvas = await html2canvas(kapakRef.current!, {
          scale: 3, useCORS: true, backgroundColor: null,
          logging: false, scrollX: 0, scrollY: 0,
          onclone: buildOnclone(),
        });
        /* Canvas'ı tam 215×285mm oranına getir */
        const pdfW = onCanvas.width;
        const pdfH = Math.round(pdfW * 285 / 215);
        const finalCanvas = document.createElement("canvas");
        finalCanvas.width = pdfW;
        finalCanvas.height = pdfH;
        const fctx = finalCanvas.getContext("2d")!;
        fctx.drawImage(onCanvas, 0, 0, pdfW, pdfH);
        const isimTemiz = (ad || "kapak").trim().replace(/[<>&"]/g, "").replace(/\s+/g, "-").substring(0, 40);
        const imgData = finalCanvas.toDataURL("image/jpeg", 0.92);
        /* Sayfa = tam resim, araç çubuğu position:fixed (baskıda gizlenir) */
        const html = `<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8"/><title>Kapak — ${isimTemiz}</title><style>*{margin:0;padding:0;}@page{size:215mm 285mm portrait;margin:0;}html,body{width:100%;height:100%;overflow:hidden;background:#fff;}img{position:absolute;top:0;left:0;width:100%;height:100%;}#bar{position:fixed;top:0;left:0;right:0;background:rgba(0,0,0,.7);padding:8px;display:flex;gap:8px;justify-content:center;z-index:9;}button{padding:6px 14px;border:none;cursor:pointer;font-size:13px;border-radius:3px;font-family:Arial,sans-serif;}@media print{#bar{display:none!important;}}</style></head><body><div id="bar"><button onclick="window.print()" style="background:#111;color:#fff">PDF Olarak Kaydet</button><button onclick="window.close()" style="background:#ddd;color:#333">Kapat</button></div><img src="${imgData}"/><script>setTimeout(function(){window.print();},600);</script></body></html>`;
        printWin.document.open();
        printWin.document.write(html);
        printWin.document.close();
        gosterToast(t("cover.editor.toastDownloaded"));
        return;
      }

      /* Ön kapak canvas */
      const onCanvas = await html2canvas(sahneRef.current!, {
        scale: 3, useCORS: true, backgroundColor: null,
        logging: false, scrollX: 0, scrollY: 0,
        onclone: buildOnclone(),
      });

      const kapakW = onCanvas.width;
      const kapakH = onCanvas.height;

      /* Dergi boyutları: 215mm × 285mm, sırt 5mm → oran: sırt = kapakW * (5/215) */
      const sirtW = Math.round(kapakW * 5 / 215);

      /* Arka kapak görselini çek */
      let arkaKapakUrl: string | null = null;
      try {
        const res = await fetch("/api/admin/dergi-ayar");
        if (res.ok) {
          const json = await res.json();
          arkaKapakUrl = json.data?.arkaKapakUrl ?? null;
        }
      } catch { /* görsel yüklenemezse devam et */ }

      /* Yardımcı: URL'den Image nesnesi yükle */
      function gorselYukle(url: string): Promise<HTMLImageElement> {
        return new Promise((res, rej) => {
          const img = new window.Image();
          img.crossOrigin = "anonymous";
          img.onload = () => res(img);
          img.onerror = rej;
          img.src = url;
        });
      }

      /* Birleşik canvas: [arka kapak | sırt | ön kapak] */
      const toplamW = kapakW + sirtW + kapakW;
      const birlesik = document.createElement("canvas");
      birlesik.width = toplamW;
      birlesik.height = kapakH;
      const ctx = birlesik.getContext("2d")!;

      /* Arka kapak + sırt — tek görsel (sırt dahil) */
      if (arkaKapakUrl) {
        try {
          const arkaImg = await gorselYukle(arkaKapakUrl);
          ctx.drawImage(arkaImg, 0, 0, kapakW + sirtW, kapakH);
        } catch {
          ctx.fillStyle = "#f5f5f5";
          ctx.fillRect(0, 0, kapakW, kapakH);
          ctx.fillStyle = "#111111";
          ctx.fillRect(kapakW, 0, sirtW, kapakH);
        }
      } else {
        ctx.fillStyle = "#f5f5f5";
        ctx.fillRect(0, 0, kapakW, kapakH);
        ctx.fillStyle = "#111111";
        ctx.fillRect(kapakW, 0, sirtW, kapakH);
        if (sirtYazi.trim()) {
          ctx.save();
          ctx.translate(kapakW + sirtW / 2, kapakH / 2);
          ctx.rotate(-Math.PI / 2);
          const fontSize = Math.max(10, Math.floor(sirtW * 0.55));
          const fontName = (sirtFont.match(/'([^']+)'/)?.[1] ?? sirtFont.split(",")[0]).trim().replace(/'/g, "");
          ctx.font = `600 ${fontSize}px "${fontName}", sans-serif`;
          ctx.fillStyle = sirtYaziRenk;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(sirtYazi, 0, 0);
          ctx.restore();
        }
      }

      /* Ön kapak */
      ctx.drawImage(onCanvas, kapakW + sirtW, 0, kapakW, kapakH);

      /* PDF olarak indir — window.print() ile OS print dialog */
      const isimTemiz = (ad || "kapak").trim().replace(/[<>&"]/g, "").replace(/\s+/g, "-").substring(0, 40);
      const imgData = birlesik.toDataURL("image/jpeg", 0.92);
      const kapakHTML = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8"/>
<title>Kapak — ${isimTemiz || "kapak"}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{background:#888;display:flex;flex-direction:column;align-items:center;padding:20px;gap:12px;font-family:Arial,sans-serif;}
.no-print{display:flex;gap:8px;}
.btn{padding:7px 16px;border:none;cursor:pointer;font-size:13px;border-radius:3px;font-family:inherit;}
.btn-p{background:#111;color:#fff;}
.btn-c{background:#ddd;color:#333;}
.wrap{line-height:0;box-shadow:0 3px 16px rgba(0,0,0,.3);}
.wrap img{display:block;max-width:96vw;height:auto;}
@page{size:435mm 285mm landscape;margin:0;}
@media print{.no-print{display:none;}html,body{margin:0;padding:0;background:#fff;}.wrap{box-shadow:none;}.wrap img{width:100%;height:auto;}}
</style>
</head>
<body>
<div class="no-print">
  <button id="bp" class="btn btn-p">PDF Olarak Kaydet</button>
  <button id="bc" class="btn btn-c">Kapat</button>
</div>
<div class="wrap"><img src="${imgData}" /></div>
<script>
document.getElementById('bp').onclick=function(){window.print();};
document.getElementById('bc').onclick=function(){window.close();};
setTimeout(function(){window.print();},600);
</script>
</body>
</html>`;
      printWin.document.open();
      printWin.document.write(kapakHTML);
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

    const tumMetinler = [ad, altBaslik, ...Object.values(yazilar).map(y => y.metin)];
    if (moderateTexts(tumMetinler)) {
      gosterToast("Bu içerik yayın kurallarımıza uygun değil.");
      return;
    }

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
    setSirtYazi(""); setSirtYaziRenk("#ffffff"); setSirtFont(FONTLAR[0].value);
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
    "sirt":        "Sırt Yazısı",
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
          {unluGorselUrl && !onFoto && (
            <button
              className="kt-unlu-btn"
              onClick={unluGorselYukle}
              disabled={onArkaPlanSiliniyor}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
              {unluAdi ? `${unluAdi} ile Yan Yana Tasarla` : "Bu Ayın Ünlüsü ile Yan Yana Tasarla"}
            </button>
          )}
          <div className="kt-yukle kt-yukle-on" onClick={() => !onArkaPlanSiliniyor && onDosyaRef.current?.click()}
            style={onArkaPlanSiliniyor ? { opacity: 0.6, cursor: "not-allowed" } : undefined}>
            <div className="kt-yukle-ikon">
              {onArkaPlanSiliniyor ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b8880" strokeWidth="1.6">
                  <circle cx="12" cy="12" r="10" strokeDasharray="31.4" strokeDashoffset="10">
                    <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
                  </circle>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b8880" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 16V4M6 10l6-6 6 6"/><path d="M4 20h16"/>
                </svg>
              )}
            </div>
            <span className="kt-yukle-baslik">
              {onArkaPlanSiliniyor ? t("cover.editor.removingBg") : t("cover.editor.fgTitle")}
            </span>
            {!onArkaPlanSiliniyor && <span className="kt-yukle-hint">{t("cover.editor.fgHint")}</span>}
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

      case "logo-renk": return (logoSrc && (!logoFiltreKapat || logoEmblemGenis !== undefined)) ? (
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
              onChange={e => { setAd(e.target.value); setYasakHata(containsBlockedWord(e.target.value) ? "Bu içerik yayın kurallarımıza uygun değil." : null); }}
              placeholder={t("cover.editor.namePlaceholder")} />
            {yasakHata && <span style={{ color: "#c0392b", fontSize: 12, marginTop: 4 }}>{yasakHata}</span>}
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
            onChange={e => { yaziGuncelle(secilenYazi, "metin", kelimeSiniri(e.target.value)); setYasakHata(containsBlockedWord(e.target.value) ? "Bu içerik yayın kurallarımıza uygun değil." : null); }}
            placeholder={`${t(`cover.editor.textLabel_${secilenYazi}`)}...`} />
          {yasakHata && <span style={{ color: "#c0392b", fontSize: 12 }}>{yasakHata}</span>}
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

      case "sirt": return (
        <div className="kt-bolum">
          <div className="kt-alan">
            <div className="kt-etiket-satir">
              <label className="kt-etiket">Sırt Yazısı</label>
              <label className="kt-renk-kap">
                <span>Renk</span>
                <input type="color" value={sirtYaziRenk}
                  onChange={e => setSirtYaziRenk(e.target.value)} className="kt-renk-giris" />
              </label>
            </div>
            <input className="kt-giris" type="text" value={sirtYazi}
              onChange={e => setSirtYazi(e.target.value)} maxLength={60}
              placeholder="Dergi adı, yıl vb." />
          </div>
          <select className="kt-font-sec" value={sirtFont}
            onChange={e => setSirtFont(e.target.value)}>
            {FONTLAR.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </div>
      );

      default: return null;
    }
  }

  const gosterAd = ad.trim() || userName || "Ad Soyad";

  const content = (
    <div className={`kt-app${embedded ? " kt-app--embedded" : ""}`}>

      {/* Gizli file input'lar — her zaman DOM'da kalmalı (mobilde panel display:none olunca ref çalışmaz) */}
      <input ref={dosyaRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onBgDegis} />
      <input ref={onDosyaRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onDosyaIsle} />
      <input ref={yanYanaRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) yanYanaBirlestir(f); if (yanYanaRef.current) yanYanaRef.current.value = ""; }} />

      {/* ══════ MOBİL ÜST BAR ══════ */}
      <div className="kt-mobil-ust-bar">
        <a href="/" className="kt-araç-btn" title="Ana Sayfa">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span>Çıkış</span>
        </a>
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
            {unluGorselUrl && !onFoto && (
              <button className="kt-unlu-btn" onClick={unluGorselYukle} disabled={onArkaPlanSiliniyor}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
                {unluAdi ? `${unluAdi} ile Yan Yana Tasarla` : "Bu Ayın Ünlüsü ile Yan Yana Tasarla"}
              </button>
            )}
            <div className="kt-yukle kt-yukle-on" onClick={() => !onArkaPlanSiliniyor && onDosyaRef.current?.click()}
              style={onArkaPlanSiliniyor ? { opacity: 0.6, cursor: "not-allowed" } : undefined}>
              <div className="kt-yukle-ikon">
                {onArkaPlanSiliniyor ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b8880" strokeWidth="1.6">
                    <circle cx="12" cy="12" r="10" strokeDasharray="31.4" strokeDashoffset="10">
                      <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
                    </circle>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b8880" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 16V4M6 10l6-6 6 6"/><path d="M4 20h16"/>
                  </svg>
                )}
              </div>
              <span className="kt-yukle-baslik">
                {onArkaPlanSiliniyor ? t("cover.editor.removingBg") : t("cover.editor.fgTitle")}
              </span>
              {!onArkaPlanSiliniyor && <span className="kt-yukle-hint">{t("cover.editor.fgHint")}</span>}
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
          {logoSrc && (!logoFiltreKapat || logoEmblemGenis !== undefined) && (
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

        <div className="kt-sirt-wrap">
        {/* Sırt önizleme şeridi — sadece çift kapak modunda göster */}
        {!sadeceOnKapak && (
        <div style={{
          width: "1.4rem", flexShrink: 0,
          background: "#111111",
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden",
          borderRadius: "2px 0 0 2px",
        }}>
          {sirtYazi && (
            <span style={{
              transform: "rotate(-90deg)",
              whiteSpace: "nowrap",
              fontSize: "8px",
              color: sirtYaziRenk,
              fontFamily: sirtFont,
              fontWeight: 600,
              letterSpacing: "0.02em",
            }}>{sirtYazi}</span>
          )}
        </div>
        )}

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
                style={{
                  ...( !logoEmblemGenis && !logoFiltreKapat && logoFiltre !== "none" ? { filter: logoFiltre } : {} ),
                  ...(logoEmblemGenis !== undefined ? { position: "relative" } : {}),
                  ...logoStyle,
                }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoSrc} alt="Logo" className="kt-kapak-logo-img" style={logoImgStyle} />
                {/* Sadece yazı kısmına uygulanan renk katmanı */}
                {logoEmblemGenis !== undefined && logoFiltre !== "none" && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoSrc} alt="" aria-hidden className="kt-kapak-logo-img" style={{
                    ...logoImgStyle,
                    position: "absolute", top: 0, left: 0,
                    filter: logoFiltre,
                    clipPath: `polygon(${logoEmblemGenis * 100}% 0%, 100% 0%, 100% 100%, ${logoEmblemGenis * 100}% 100%)`,
                  }} />
                )}
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
                  {ad.trim() || "AD SOYAD"}
                </div>
                {altBaslik.trim() && (
                  <div className="kt-kapak-altbaslik">{altBaslik.trim()}</div>
                )}
              </div>
              <div className="kt-kapak-barkod">
                <BarkodSVG serial={draft.coverSerial || "8690000000000"} />
              </div>
            </div>

            {/* Watermark — preview'da görünür, export'ta buildOnclone tarafından kaldırılır */}
            <div className="kt-watermark" aria-hidden="true">
              {Array.from({ length: 24 }, (_, i) => (
                <span key={i} className="kt-watermark-text">HATIRA DERGİ ÖNİZLEME</span>
              ))}
            </div>

          </div>
        </div>
        </div>{/* flex wrapper */}

        <span className="kt-on-boyut">{t("cover.editor.previewSize")}</span>

        <div className="kt-on-aksiyonlar">
          <button className="kt-btn kt-btn-ghost" onClick={handleSifirla}>{t("cover.editor.resetBtn")}</button>
          <button className="kt-btn kt-btn-koyu" onClick={handleIndir} disabled={dışaAktariliyor || (!bgFoto && !onFoto)}>
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

          {/* Ana Sayfa linki — masaüstünde sağ panelin üstünde */}
          <a href="/" className="kt-geri-link">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Ana Sayfaya Dön
          </a>

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
                  onChange={e => { setAd(e.target.value); setYasakHata(containsBlockedWord(e.target.value) ? "Bu içerik yayın kurallarımıza uygun değil." : null); }}
                  placeholder={t("cover.editor.namePlaceholder")} />
                {yasakHata && <span style={{ color: "#c0392b", fontSize: 12, marginTop: 4, display: "block" }}>{yasakHata}</span>}
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
                    onChange={e => { yaziGuncelle(key, "metin", kelimeSiniri(e.target.value)); setYasakHata(containsBlockedWord(e.target.value) ? "Bu içerik yayın kurallarımıza uygun değil." : null); }}
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

          {/* 06 Sırt Yazısı */}
          <div className="kt-bolum">
            <div className="kt-bolum-bas">
              <span className="kt-bolum-no">06</span>
              <span className="kt-bolum-ad">Sırt Yazısı</span>
            </div>
            <div className="kt-alanlar">
              <div className="kt-alan kt-alan-tam">
                <div className="kt-etiket-satir">
                  <label className="kt-etiket">Metin</label>
                  <label className="kt-renk-kap">
                    <span>{t("cover.editor.colorLabel")}</span>
                    <input type="color" value={sirtYaziRenk}
                      onChange={e => setSirtYaziRenk(e.target.value)} className="kt-renk-giris" />
                  </label>
                </div>
                <input className="kt-giris" type="text" value={sirtYazi}
                  onChange={e => setSirtYazi(e.target.value)} maxLength={60}
                  placeholder="Dergi adı, yıl vb." />
              </div>
            </div>
            <select className="kt-font-sec" value={sirtFont}
              onChange={e => setSirtFont(e.target.value)}>
              {FONTLAR.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
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
        <button className={`kt-araç-btn${acikDrawer === "sirt" ? " kt-araç-btn--aktif" : ""}`}
          onClick={() => setAcikDrawer(acikDrawer === "sirt" ? null : "sirt")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="2" width="4" height="20" rx="1"/>
            <line x1="10" y1="7" x2="20" y2="7"/><line x1="10" y1="12" x2="20" y2="12"/>
          </svg>
          <span>Sırt</span>
        </button>
        <button className="kt-araç-btn" onClick={handleIndir} disabled={dışaAktariliyor || (!bgFoto && !onFoto)}>
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

      {/* ══════ BİRLEŞTİRME EDİTÖRÜ MODAL ══════ */}
      {yyAcik && (
        <div className="kt-yy-overlay" onClick={() => setYyAcik(false)}>
          <div className="kt-yy-modal" onClick={e => e.stopPropagation()}>
            <div className="kt-yy-modal-bas">
              <span>Fotoğraf Birleştirici</span>
              <button className="kt-yy-kapat" onClick={() => setYyAcik(false)}>✕</button>
            </div>

            {/* Mod seçici */}
            <div className="kt-yy-mod-satir">
              {([["yanyanya","Yan Yana"],["ustuste","Üst Üste"],["feather","Oval"]] as const).map(([m,l]) => (
                <button key={m} className={`kt-yy-mod-btn${yyMod===m?" kt-yy-mod-btn--aktif":""}`}
                  onClick={() => setYyMod(m)}>{l}</button>
              ))}
            </div>

            {/* Canvas */}
            <div className="kt-yy-canvas-wrap">
              <canvas ref={yyCanvasRef} width={360} height={480} className="kt-yy-canvas"
                onPointerDown={yyPointerBasla} onPointerMove={yyPointerHareket}
                onPointerUp={yyPointerBitir} onPointerLeave={yyPointerBitir} />
            </div>

            {/* Hangi fotoğrafı sürükle */}
            <div className="kt-yy-hedef-satir">
              <span className="kt-yy-etiket">Sürükle:</span>
              <button className={`kt-yy-hedef-btn${yyHedef==="unlu"?" kt-yy-hedef-btn--aktif":""}`}
                onClick={() => setYyHedef("unlu")}>Ünlü</button>
              <button className={`kt-yy-hedef-btn${yyHedef==="kullanici"?" kt-yy-hedef-btn--aktif":""}`}
                onClick={() => setYyHedef("kullanici")}>Ben</button>
            </div>

            {/* Zoom — aktif hedef için */}
            <div className="kt-yy-zoom-bolum">
              <span className="kt-yy-etiket">Büyüklük</span>
              <div className="kt-yy-zoom-satir">
                {yyHedef==="kullanici" ? <>
                  <button className="kt-yy-z-btn" onClick={() => setYyZoom(z=>Math.max(0.3,+(z-0.1).toFixed(1)))}>−</button>
                  <input type="range" min="30" max="300" value={Math.round(yyZoom*100)}
                    onChange={e=>setYyZoom(+e.target.value/100)} className="kt-yy-slider"/>
                  <button className="kt-yy-z-btn" onClick={() => setYyZoom(z=>Math.min(3,+(z+0.1).toFixed(1)))}>+</button>
                  <span className="kt-yy-zoom-yuzde">{Math.round(yyZoom*100)}%</span>
                </> : <>
                  <button className="kt-yy-z-btn" onClick={() => setYyUnluZoom(z=>Math.max(0.3,+(z-0.1).toFixed(1)))}>−</button>
                  <input type="range" min="30" max="300" value={Math.round(yyUnluZoom*100)}
                    onChange={e=>setYyUnluZoom(+e.target.value/100)} className="kt-yy-slider"/>
                  <button className="kt-yy-z-btn" onClick={() => setYyUnluZoom(z=>Math.min(3,+(z+0.1).toFixed(1)))}>+</button>
                  <span className="kt-yy-zoom-yuzde">{Math.round(yyUnluZoom*100)}%</span>
                </>}
              </div>
            </div>

            {/* Opaklık — sadece üst üste modda */}
            {yyMod==="ustuste" && (
              <div className="kt-yy-zoom-bolum">
                <span className="kt-yy-etiket">Opaklık</span>
                <div className="kt-yy-zoom-satir">
                  <input type="range" min="10" max="100" value={Math.round(yyOpacity*100)}
                    onChange={e=>setYyOpacity(+e.target.value/100)} className="kt-yy-slider"/>
                  <span className="kt-yy-zoom-yuzde">{Math.round(yyOpacity*100)}%</span>
                </div>
              </div>
            )}

            {/* Filtre */}
            <div className="kt-yy-filtre-satir">
              {([["none","Normal"],["bw","S/B"],["sepia","Sepia"],["warm","Sıcak"],["cool","Soğuk"],["sinemask","Film"]] as const).map(([f,l]) => (
                <button key={f} className={`kt-yy-filtre-btn${yyFiltre===f?" kt-yy-filtre-btn--aktif":""}`}
                  onClick={() => setYyFiltre(f)}>{l}</button>
              ))}
            </div>


            {/* AI sonuç önizleme */}
            {(yyAiSonuc || yyAiYukleniyor || yyAiHata) && (
              <div className="kt-yy-ai-sonuc">
                {yyAiYukleniyor && (
                  <div className="kt-yy-ai-yukleniyor">
                    <span className="kt-yy-ai-spinner" />
                    <span>AI birleştiriyor… (30–60 sn)</span>
                  </div>
                )}
                {yyAiHata && (
                  <div className="kt-yy-ai-hata">❌ {yyAiHata}</div>
                )}
                {yyAiSonuc && !yyAiYukleniyor && (
                  <div className="kt-yy-ai-onizleme">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={yyAiSonuc} alt="AI sonucu" />
                    <span className="kt-yy-ai-etiket">✨ AI Sonucu — Uygula butonu bunu kaydeder</span>
                  </div>
                )}
              </div>
            )}

            {/* Alt butonlar */}
            <div className="kt-yy-alt-btns">
              <button className="kt-yy-sifirla" onClick={() => {
                setYyZoom(1); setYyX(0); setYyY(0);
                setYyUnluZoom(1); setYyUnluX(-300); setYyUnluY(0);
                setYyAiSonuc(null); setYyAiHata(null);
              }}>Sıfırla</button>
              <div style={{display:"flex",gap:8}}>
                <button className="kt-yy-iptal" onClick={() => { setYyAcik(false); setYyAiSonuc(null); setYyAiHata(null); }}>İptal</button>
                <button className="kt-yy-ai-btn" onClick={yyAiBirlestir} disabled={yyAiYukleniyor}>
                  {yyAiYukleniyor ? "⏳" : "🤖 AI Birleştir"}
                </button>
                <button className="kt-yy-uygula" onClick={yyUygula} disabled={yyAiYukleniyor}>
                  {yyAiSonuc ? "✅ Uygula" : "Uygula"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
