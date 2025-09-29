export const localeEntries = [
  { code: "tr", label: "Türkçe" },
  { code: "en", label: "English" },
  { code: "ru", label: "Русский" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "fa", label: "فارسی" },
  { code: "id", label: "Bahasa Indonesia" },
  { code: "bs", label: "Bosanski" },
  { code: "sq", label: "Shqip" },
  { code: "mk", label: "Makedonski" },
] as const;

export type Locale = (typeof localeEntries)[number]["code"];

export const locales = localeEntries.map((entry) => entry.code) as Array<Locale>;

export const defaultLocale: Locale = "tr";

export const localeLabels = Object.fromEntries(
  localeEntries.map(({ code, label }) => [code, label]),
) as Record<Locale, string>;
