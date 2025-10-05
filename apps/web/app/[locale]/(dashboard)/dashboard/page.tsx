import type { JSX } from "react";

import { Dashboard } from "./_components/dashboard";
import type { DashboardTopic } from "./_components/types";
import { newsItems } from "./_components/news-data";

const topics: DashboardTopic[] = [
  {
    id: "topic-market",
    title: "Borsa & Piyasalar",
    change: "+2,4%",
    sentiment: "positive",
    description: "Bankacılık hisselerinde güçlü alım, BIST 100 endeksi kapanışta yeni zirveyi test etti.",
    icon: "BZ",
  },
  {
    id: "topic-defense",
    title: "Savunma Sanayii",
    change: "+1,1%",
    sentiment: "positive",
    description: "Yeni İHA teslimatı ihracat beklentilerini hızlandırırken Katar ile ortak eğitim süreci genişliyor.",
    icon: "SV",
  },
  {
    id: "topic-diplomacy",
    title: "Diplomasi Masası",
    change: "Yeni",
    sentiment: "neutral",
    description: "Ankara’da gerçekleştirilen üçlü görüşmede enerji koridorları ve Karadeniz güvenliği masaya yatırıldı.",
    icon: "DM",
  },
  {
    id: "topic-energy",
    title: "Enerji Dönüşümü",
    change: "-0,6%",
    sentiment: "negative",
    description: "Brent petrol fiyatındaki gevşeme ithalat faturasında rahatlama yarattı; güneş yatırımları hız kazanıyor.",
    icon: "EN",
  },
  {
    id: "topic-tech",
    title: "Teknoloji Gündemi",
    change: "+0,8%",
    sentiment: "positive",
    description: "Yerli siber güvenlik girişimi yeni yatırımla Avrupa açılımı başlatırken kamuda pilot uygulamalar sürüyor.",
    icon: "TG",
  },
  {
    id: "topic-culture",
    title: "Anadolu Hikayeleri",
    change: "Özel",
    sentiment: "neutral",
    description: "Anadolu Ajansı muhabirleri deprem bölgesinde toparlanan yaşam hikâyelerini sahadan aktarıyor.",
    icon: "AH",
  },
];

export default function DashboardPage(): JSX.Element {
  return <Dashboard news={newsItems} topics={topics} />;
}
