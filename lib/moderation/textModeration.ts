import { blockedWords } from "./blockedWords";

// Metni normalize et: Türkçe karakter, büyük/küçük harf,
// boşluk, noktalama ve araya eklenen karakterler sıfırlanır.
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/İ/g, "i")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/[^a-z]/g, ""); // tüm boşluk, noktalama, rakam vs. çıkar
}

// Yasaklı kelimeleri bir kere normalize et
const normalizedBlocked = blockedWords.map(normalize);

// Tek bir metinde yasaklı kelime var mı?
export function containsBlockedWord(text: string | null | undefined): boolean {
  if (!text) return false;
  const normalized = normalize(text);
  return normalizedBlocked.some((blocked) => normalized.includes(blocked));
}

// Birden fazla alanı tek çağrıyla kontrol et
export function moderateTexts(
  texts: (string | null | undefined)[]
): boolean {
  return texts.some((t) => containsBlockedWord(t));
}
