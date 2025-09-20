import { FeatureHighlight } from "../_domain/feature-highlight";

export const onboardingHighlights: readonly FeatureHighlight[] = [
  {
    title: "Streak Odaklı Haber",
    description:
      "Haber başlıklarını kendi ritminde takip et, her okuduğun haberde XP kazan ve günlük streak ödüllerini kaçırma.",
    icon: "📈",
  },
  {
    title: "Quiz ile Pekiştir",
    description:
      "Anadolu Ajansı doğrulamasından gelen haberleri quiz'lerle pekiştir, doğru her cevapta ekstra 25 XP kap.",
    icon: "🧠",
  },
  {
    title: "Şehir Bazlı Filtre",
    description:
      "İstanbul'dan Ankara'ya, bulunduğun şehirdeki nabzı sez. Konumuna uygun haber akışını kişiselleştir.",
    icon: "📍",
  },
  {
    title: "Kart Koleksiyonu",
    description:
      "Common'dan Legendary'ye kadar gazeteci kartlarını topla, profilini güçlendir ve liderlik tablosunda öne çık.",
    icon: "🎴",
  },
] as const;
