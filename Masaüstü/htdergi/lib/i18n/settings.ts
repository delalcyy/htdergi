export const LANGUAGES = [
  { code: "tr", label: "TR", name: "Türkçe" },
  { code: "en", label: "EN", name: "English" },
  { code: "de", label: "DE", name: "Deutsch" },
  { code: "ru", label: "RU", name: "Русский" },
] as const;

export type LangCode = (typeof LANGUAGES)[number]["code"];
export const DEFAULT_LANG: LangCode = "tr";
export const NAMESPACES = ["common"] as const;
export type Namespace = (typeof NAMESPACES)[number];
