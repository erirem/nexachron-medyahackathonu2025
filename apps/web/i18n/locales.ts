export const locales = [
  "tr",
  "en",
  "ru",
  "fr",
  "es",
  "fa",
  "id",
  "bs",
  "sq",
  "mk",
] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "tr";

export const localeLabels: Record<Locale, string> = {
  tr: "Türkçe",
  en: "English",
  ru: "Русский",
  fr: "Français",
  es: "Español",
  fa: "فارسی",
  id: "Bahasa Indonesia",
  bs: "Bosanski",
  sq: "Shqip",
  mk: "Македонски",
};
