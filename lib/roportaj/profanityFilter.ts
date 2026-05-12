const BLOCKED_WORDS = [
  'amk', 'orospu', 'sik', 'sikiş', 'sikik', 'sikerim', 'sikeyim',
  'göt', 'götü', 'oç', 'piç', 'piçlik',
  'bok', 'boktan', 'boklu',
  'sürtük', 'fahişe', 'kaltak',
  'ibne', 'götveren',
  'salak', 'aptal', 'gerizekalı', 'geri zekalı', 'mal', 'dangalak',
  'it', 'köpek', 'eşek', 'eşşek',
  'kahpe', 'orospu çocuğu', 'orsp',
  'meme', 'yarak', 'yarrak', 'amına', 'amını',
  'sıktır', 'siktir',
  'pezevenk', 'pezeveng',
  'haysiyetsiz', 'alçak', 'namussuz', 'ahlaksız', 'kasar', 'kasmer', 'yavşak', 'amı', 'amina', 'amına',
];

const PATTERNS = [
  /s[\s.\-_*]*i[\s.\-_*]*k/i,
  /a[\s.\-_*]*m[\s.\-_*]*[kq]/i,
  /o[\s.\-_*]*r[\s.\-_*]*o[\s.\-_*]*s[\s.\-_*]*p[\s.\-_*]*u/i,
  /g[\s.\-_*]*[o0ö][\s.\-_*]*t/i,
];

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/1/g, 'i').replace(/3/g, 'e').replace(/0/g, 'o')
    .replace(/4/g, 'a').replace(/5/g, 's');
}

export function checkProfanity(text: string): { isClean: boolean; matchedWords: string[] } {
  if (!text || text.trim() === '') return { isClean: true, matchedWords: [] };
  const normalized = normalizeText(text);
  const matchedWords: string[] = [];
  for (const word of BLOCKED_WORDS) {
    if (normalized.includes(normalizeText(word))) matchedWords.push(word);
  }
  for (const pattern of PATTERNS) {
    if (pattern.test(normalized)) matchedWords.push('[pattern]');
  }
  return { isClean: matchedWords.length === 0, matchedWords: [...new Set(matchedWords)] };
}
