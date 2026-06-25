"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { DEFAULT_LANG } from "./settings";

import tr from "@/public/locales/tr/common.json";
import en from "@/public/locales/en/common.json";
import de from "@/public/locales/de/common.json";
import ru from "@/public/locales/ru/common.json";

if (!i18n.isInitialized) {
  if (typeof window !== "undefined" && !localStorage.getItem("hatira_lang_user_set")) {
    localStorage.removeItem("hatira_lang");
  }

  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        tr: { common: tr },
        en: { common: en },
        de: { common: de },
        ru: { common: ru },
      },
      fallbackLng: DEFAULT_LANG,
      defaultNS: "common",
      interpolation: { escapeValue: false },
      detection: {
        order: ["localStorage"],
        lookupLocalStorage: "hatira_lang",
        caches: ["localStorage"],
      },
    });
}

export default i18n;
