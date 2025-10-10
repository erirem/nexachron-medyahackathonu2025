import type { JSX } from "react";
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
import type {
  CategoriesOverviewResponse,
  CategoryNewsDetailResponse,
  DashboardNewsDataPayload,
  NewsListDataPayload,
} from "@nexachron/shared-types";

import { fetchCategories, fetchDashboardNews, fetchPopularNews } from "@/services/api";

import { Dashboard } from "./_components/dashboard";
import type { DashboardTopic } from "./_components/types";

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

function buildInitialNewsPayload(data: DashboardNewsDataPayload): NewsListDataPayload {
  const items = data.items ?? [];
  const total = data.total ?? items.length;
  const pageSize = items.length || 10;

  return {
    items,
    pagination: {
      page: 1,
      pageSize,
      total,
      hasMore: total > pageSize,
    },
  };
}

function isCategoriesOverview(
  value: CategoriesOverviewResponse | CategoryNewsDetailResponse,
): value is CategoriesOverviewResponse {
  return !('items' in value);
}

export default async function DashboardPage(): Promise<JSX.Element> {
  const [categoriesResult, popularResult] = await Promise.allSettled([
    fetchCategories(),
    fetchPopularNews(5), // Fetch 5 popular news items
  ]);

  const categoriesOverview: CategoriesOverviewResponse | undefined =
    categoriesResult.status === 'fulfilled' &&
    'categories' in categoriesResult.value &&
    isCategoriesOverview(categoriesResult.value)
      ? categoriesResult.value
      : undefined;

  const popularNews: DashboardNewsDataPayload =
    popularResult.status === 'fulfilled'
      ? popularResult.value
      : { items: [], total: 0 };

  // Don't pre-fetch news on the server, instead let the client handle infinite scrolling
  const initialNews = {
    items: [],
    pagination: {
      page: 1,
      pageSize: 10,
      total: 0,
      hasMore: true,
    },
  };

  return (
    <Dashboard
      initialNews={initialNews}
      topics={topics}
      categoriesOverview={categoriesOverview}
      initialPopularNews={popularNews}
    />
  );
}
