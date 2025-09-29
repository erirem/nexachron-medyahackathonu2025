export const locales = [
  'tr',
  'en',
  'ru',
  'fr',
  'es',
  'fa',
  'id',
  'bs',
  'sq',
  'mk',
] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'tr';

const translations: Record<Locale, Record<string, string>> = {
  tr: {
    'errors.fetchNews': 'Haberler alınırken bir hata oluştu.',
    'errors.fetchPopular': 'Popüler haberler getirilemedi.',
    'errors.fetchByMode': 'Belirtilen moda göre haberler getirilemedi.',
    'errors.fetchById': 'Haber detayı alınamadı.',
    'errors.addComment': 'Yorum eklenirken bir hata oluştu.',
    'errors.addReaction': 'Tepki eklenirken bir hata oluştu.',
    'errors.unauthorized': 'Supabase kullanıcısı bulunamadı.',
    'messages.commentAdded': 'Yorum başarıyla eklendi.',
    'messages.reactionAdded': 'Tepki başarıyla eklendi.',
  },
  en: {
    'errors.fetchNews': "We couldn't load the news feed.",
    'errors.fetchPopular': "We couldn't load the popular news feed.",
    'errors.fetchByMode': "We couldn't retrieve news for the selected mode.",
    'errors.fetchById': "We couldn't retrieve that news item.",
    'errors.addComment': "We couldn't save your comment.",
    'errors.addReaction': "We couldn't save your reaction.",
    'errors.unauthorized': 'Supabase user could not be found.',
    'messages.commentAdded': 'Comment added successfully.',
    'messages.reactionAdded': 'Reaction added successfully.',
  },
  ru: {
    'errors.fetchNews': 'Не удалось загрузить ленту новостей.',
    'errors.fetchPopular': 'Не удалось загрузить популярные новости.',
    'errors.fetchByMode': 'Не удалось получить новости для выбранного режима.',
    'errors.fetchById': 'Не удалось получить выбранную новость.',
    'errors.addComment': 'Не удалось сохранить комментарий.',
    'errors.addReaction': 'Не удалось сохранить реакцию.',
    'errors.unauthorized': 'Пользователь Supabase не найден.',
    'messages.commentAdded': 'Комментарий успешно добавлен.',
    'messages.reactionAdded': 'Реакция успешно добавлена.',
  },
  fr: {
    'errors.fetchNews': "Impossible de charger le flux d'actualités.",
    'errors.fetchPopular': 'Impossible de charger les actualités populaires.',
    'errors.fetchByMode':
      'Impossible de récupérer les actualités pour ce mode.',
    'errors.fetchById': 'Impossible de récupérer cette actualité.',
    'errors.addComment': 'Enregistrement du commentaire impossible.',
    'errors.addReaction': 'Enregistrement de la réaction impossible.',
    'errors.unauthorized': 'Utilisateur Supabase introuvable.',
    'messages.commentAdded': 'Commentaire ajouté avec succès.',
    'messages.reactionAdded': 'Réaction enregistrée avec succès.',
  },
  es: {
    'errors.fetchNews': 'No pudimos cargar las noticias.',
    'errors.fetchPopular': 'No pudimos cargar las noticias populares.',
    'errors.fetchByMode': 'No pudimos obtener noticias para ese modo.',
    'errors.fetchById': 'No pudimos recuperar esa noticia.',
    'errors.addComment': 'No pudimos guardar tu comentario.',
    'errors.addReaction': 'No pudimos guardar tu reacción.',
    'errors.unauthorized': 'No se encontró el usuario de Supabase.',
    'messages.commentAdded': 'Comentario agregado correctamente.',
    'messages.reactionAdded': 'Reacción agregada correctamente.',
  },
  fa: {
    'errors.fetchNews': 'بارگذاری خبرها با خطا مواجه شد.',
    'errors.fetchPopular': 'بارگذاری خبرهای محبوب انجام نشد.',
    'errors.fetchByMode': 'دریافت خبر برای این حالت ممکن نبود.',
    'errors.fetchById': 'خبر مورد نظر یافت نشد.',
    'errors.addComment': 'ثبت دیدگاه انجام نشد.',
    'errors.addReaction': 'ثبت واکنش انجام نشد.',
    'errors.unauthorized': 'کاربر Supabase پیدا نشد.',
    'messages.commentAdded': 'دیدگاه با موفقیت ثبت شد.',
    'messages.reactionAdded': 'واکنش با موفقیت ثبت شد.',
  },
  id: {
    'errors.fetchNews': 'Kami tidak dapat memuat berita.',
    'errors.fetchPopular': 'Kami tidak dapat memuat berita populer.',
    'errors.fetchByMode':
      'Kami tidak dapat mengambil berita untuk mode tersebut.',
    'errors.fetchById': 'Kami tidak dapat mengambil berita tersebut.',
    'errors.addComment': 'Komentar Anda tidak dapat disimpan.',
    'errors.addReaction': 'Reaksi Anda tidak dapat disimpan.',
    'errors.unauthorized': 'Pengguna Supabase tidak ditemukan.',
    'messages.commentAdded': 'Komentar berhasil ditambahkan.',
    'messages.reactionAdded': 'Reaksi berhasil ditambahkan.',
  },
  bs: {
    'errors.fetchNews': 'Nismo mogli učitati vijesti.',
    'errors.fetchPopular': 'Nismo mogli učitati popularne vijesti.',
    'errors.fetchByMode': 'Nismo mogli dohvatiti vijesti za taj režim.',
    'errors.fetchById': 'Nismo mogli dohvatiti traženu vijest.',
    'errors.addComment': 'Komentar nije moguće sačuvati.',
    'errors.addReaction': 'Reakciju nije moguće sačuvati.',
    'errors.unauthorized': 'Supabase korisnik nije pronađen.',
    'messages.commentAdded': 'Komentar je uspješno dodan.',
    'messages.reactionAdded': 'Reakcija je uspješno dodana.',
  },
  sq: {
    'errors.fetchNews': 'Nuk arritëm të ngarkojmë lajmet.',
    'errors.fetchPopular': 'Nuk arritëm të ngarkojmë lajmet e njohura.',
    'errors.fetchByMode': 'Nuk arritëm të marrim lajme për këtë mënyrë.',
    'errors.fetchById': 'Nuk arritëm të marrim lajmin e kërkuar.',
    'errors.addComment': 'Nuk mundëm të ruajmë komentin.',
    'errors.addReaction': 'Nuk mundëm të ruajmë reagimin.',
    'errors.unauthorized': 'Nuk u gjet përdoruesi Supabase.',
    'messages.commentAdded': 'Komenti u shtua me sukses.',
    'messages.reactionAdded': 'Reagimi u shtua me sukses.',
  },
  mk: {
    'errors.fetchNews': 'Не можевме да ги вчитаме вестите.',
    'errors.fetchPopular': 'Не можевме да ги вчитаме популарните вести.',
    'errors.fetchByMode': 'Не можевме да ги добиеме вестите за тој режим.',
    'errors.fetchById': 'Не можевме да ја добиеме бараната вест.',
    'errors.addComment': 'Коментарот не можеше да се зачува.',
    'errors.addReaction': 'Реакцијата не можеше да се зачува.',
    'errors.unauthorized': 'Корисникот на Supabase не е пронајден.',
    'messages.commentAdded': 'Коментарот е успешно додаден.',
    'messages.reactionAdded': 'Реакцијата е успешно додадена.',
  },
};

export function resolveLocale(header?: string): Locale {
  if (!header) {
    return defaultLocale;
  }

  const requested = header
    .split(',')
    .map((entry) => entry.trim().split(';')[0])
    .find((tag) => locales.includes(tag as Locale));

  if (requested) {
    return requested as Locale;
  }

  const fallback = header
    .split(',')
    .map((entry) => entry.trim().split(';')[0].split('-')[0])
    .find((tag) => locales.includes(tag as Locale));

  return (fallback as Locale) ?? defaultLocale;
}

export function translate(locale: Locale, key: string): string {
  const dictionary = translations[locale] ?? translations[defaultLocale];
  return dictionary[key] ?? translations[defaultLocale][key] ?? key;
}
