export type Lang = "en" | "fr";

export type Translate = (en: string, fr: string) => string;

export const makeT =
  (lang: Lang): Translate =>
  (en, fr) =>
    lang === "fr" ? fr : en;

export const asLang = (value: unknown): Lang => (value === "fr" ? "fr" : "en");
