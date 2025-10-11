/**
 * News categories and their Turkish labels
 * Centralized category management for the API
 */

export const CATEGORY_LABELS: Record<string, string> = {
  gundem: 'Gündem',
  spor: 'Spor',
  ekonomi: 'Ekonomi',
  teknoloji: 'Teknoloji',
  dunya: 'Dünya',
  politika: 'Politika',
  finans: 'Finans',
  savunma: 'Savunma',
  enerji: 'Enerji',
  saglik: 'Sağlık',
  diplomasi: 'Diplomasi',
  cevre: 'Çevre',
  turizm: 'Turizm',
  tarim: 'Tarım',
  kultur: 'Kültür',
  sanat: 'Sanat',
  egitim: 'Eğitim',
  bilim: 'Bilim',
  yasam: 'Yaşam',
  magazin: 'Magazin',
  genel: 'Genel',
} as const;

export const NEWS_MODES = {
  WORLD: 'WORLD',
  LOCAL: 'LOCAL',
  SPORTS: 'SPORTS',
  POLITICS: 'POLITICS',
  ECONOMY: 'ECONOMY',
  TECHNOLOGY: 'TECHNOLOGY',
} as const;

export const NEWS_CITIES = {
  ISTANBUL: 'İstanbul',
  ANKARA: 'Ankara',
  IZMIR: 'İzmir',
  BURSA: 'Bursa',
  ANTALYA: 'Antalya',
  ADANA: 'Adana',
  KONYA: 'Konya',
  GAZIANTEP: 'Gaziantep',
  MERSIN: 'Mersin',
  DIYARBAKIR: 'Diyarbakır',
} as const;

export type CategoryKey = keyof typeof CATEGORY_LABELS;
export type NewsMode = typeof NEWS_MODES[keyof typeof NEWS_MODES];
export type NewsCity = typeof NEWS_CITIES[keyof typeof NEWS_CITIES];

/**
 * Get category label by key
 */
export function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] || category.charAt(0).toUpperCase() + category.slice(1);
}

/**
 * Get all available categories
 */
export function getAllCategories(): Array<{ key: string; label: string }> {
  return Object.entries(CATEGORY_LABELS).map(([key, label]) => ({ key, label }));
}
