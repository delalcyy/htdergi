import { blockedWords } from "./blockedWords";

/**
 * Metni normalize eder:
 * 1. Leet speak sayıları harfe çevirir  (4→a, 3→e, 1→i, 0→o, 5→s)
 * 2. Türkçe karakterleri ASCII'ye çevirir (ı→i, ş→s, ç→c, ö→o, ü→u, ğ→g)
 * 3. Küçük harfe çevirir
 * 4. Harf olmayan her şeyi siler (boşluk, noktalama, özel karakter, rakam)
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    // Leet speak
    .replace(/4|@/g, "a")
    .replace(/3/g, "e")
    .replace(/1|!/g, "i")
    .replace(/0/g, "o")
    .replace(/5|\$/g, "s")
    // Türkçe karakterler
    .replace(/İ/g, "i")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    // Harf olmayan her şeyi sil
    .replace(/[^a-z]/g, "");
}

/**
 * Yasaklı kelimeden regex pattern üretir.
 * Her harf tekrarlı eşleşebilsin: "amcik" → /a+m+c+i+k+/
 * Böylece "ammcık", "a.m.c.ı.k", "amciiiik" hepsi yakalanır.
 */
function buildPattern(word: string): RegExp | null {
  const normalized = normalizeText(word);
  if (!normalized) return null;
  const pattern = normalized
    .split("")
    .map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "+")
    .join("");
  return new RegExp(pattern);
}

// Modül yüklendiğinde tüm pattern'leri bir kez derle
const compiled: RegExp[] = blockedWords
  .map(buildPattern)
  .filter((p): p is RegExp => p !== null);

/**
 * Tek bir metinde yasaklı kelime var mı?
 * amcık / ammcık / a.m.c.ı.k / 4mcık / amciiiik → hepsi yakalanır
 */
export function containsBlockedWord(text: string | null | undefined): boolean {
  if (!text) return false;
  const normalized = normalizeText(text);
  return compiled.some((pattern) => pattern.test(normalized));
}

/**
 * Birden fazla alanı tek çağrıyla kontrol et
 */
export function moderateTexts(
  texts: (string | null | undefined)[]
): boolean {
  return texts.some((t) => containsBlockedWord(t));
}
