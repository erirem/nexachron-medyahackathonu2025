import { notFound } from 'next/navigation';
import { type JSX } from 'react';
import { NewsArticle } from './_components/news-article';
import { NewsSidebar } from './_components/news-sidebar';
import { ReadingProgress } from './_components/reading-progress';
import { SmoothScrollWrapper } from './_components/smooth-scroll-wrapper';
import { DynamicScrollbarWrapper } from './_components/dynamic-scrollbar-wrapper';
import type { DashboardNewsItem } from '../../dashboard/_components/types';
import './_components/scrollbar.css';

// Sample news data (same as dashboard)
const newsItems: DashboardNewsItem[] = [
  {
    id: "haber-1",
    category: "Finans",
    title: "Borsa İstanbul rekor hacimle haftayı tamamladı",
    subtitle: "TCMB politika adımları bankacılık sektörünü güçlendirdi",
    summary: "BIST 100 endeksi bankacılık hisselerindeki %3'lük primle 9.780 puanı aşarak tarihi zirveye yükseldi.",
    detail:
      "Yabancı yatırımcıların artan ilgisiyle birlikte 2,1 milyar dolarlık hacim gerçekleşti. Analistler, TCMB'nin sadeleşme adımlarının bankacılık tarafını desteklediğini vurguluyor.",
    fullContent: "Borsa İstanbul'da yaşanan tarihi performans, yatırımcıların dikkatini çekti. BIST 100 endeksi bankacılık hisselerindeki güçlü alımlarla birlikte %3'lük artışla günü 9.780 puanın üzerinde kapattı.\\n\\nYabancı yatırımcıların artan ilgisi ile birlikte günlük işlem hacmi 2,1 milyar doları buldu. Bu rakam, 2023 yılının en yüksek günlük hacim rekoru olma özelliği taşıyor.\\n\\nTCMB'nin son dönemde açıkladığı sadeleşme adımları ve para politikasındaki tutarlı duruş, özellikle bankacılık sektörünü olumlu etkiliyor. Garanti BBVA ve İş Bankası hisseleri günü %4'ün üzerinde artışla tamamladı.\\n\\nUzmanlar, bu trendin sürdürülebilirliği için küresel piyasalardaki gelişmelerin de yakından izlenmesi gerektiğini belirtiyor.",
    timestamp: "12 dk önce",
    publishedAt: "27 Eylül 2024, 16:30",
    readingTime: "4 dk okuma",
    dateline: "İstanbul",
    tags: ["BIST100", "Bankacılık", "TCMB", "sponsor"],
    imageUrl: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=720&q=60",
    images: [
      {
        url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=720&q=60",
        alt: "Borsa İstanbul genel görünüm",
        caption: "Borsa İstanbul işlem salonu",
        credit: "AA Fotoğraf"
      },
      {
        url: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=720&q=60",
        alt: "Bankacılık hisseleri grafiği",
        caption: "Bankacılık endeksi günlük performansı"
      }
    ],
    author: {
      name: "Mehmet Özkan",
      title: "Ekonomi Muhabiri"
    },
    sentiment: "positive",
    impact: "Yüksek",
    viewCount: 3420,
    likeCount: 189,
    shareCount: 67,
    storyId: "borsa-rekorlari",
    timelineOrder: 3,
    storyTitle: "Borsa İstanbul Hacim Rekorları Serisi"
  },
  {
    id: "haber-2",
    category: "Diplomasi",
    title: "Ankara'da üçlü enerji koridoru zirvesi",
    summary: "Türkiye, Azerbaycan ve Gürcistan enerji bakanları doğal gaz ve elektrikte entegre iletim planı için mutabakata vardı.",
    detail:
      "Toplantıda TANAP kapasite artışı ve yeşil hidrojen taşınması için ortak fizibilite çalışmalarının eylül ayında başlatılması kararlaştırıldı.",
    timestamp: "25 dk önce",
    publishedAt: "27 Eylül 2024, 16:05",
    readingTime: "3 dk okuma",
    dateline: "Ankara",
    tags: ["Enerji", "TANAP", "Diplomasi"],
    imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=720&q=60",
    sentiment: "neutral",
    impact: "Orta",
  },
  {
    id: "haber-3",
    category: "Savunma",
    title: "Yeni nesil İHA'lar seri üretime geçti",
    subtitle: "Türkiye'nin savunma teknolojilerinde yeni dönem",
    summary: "TAI'nin geliştirdiği dikey iniş kalkış yeteneğine sahip İHA, ilk parti teslimatla Kara Kuvvetleri envanterine girdi.",
    detail:
      "Araç, gece görüş entegrasyonu ve yapay zekâ destekli rota optimizasyonu ile 18 saate kadar havada kalabiliyor. İhracat için iki ülke ile ön anlaşma yapıldı.",
    fullContent: "Türkiye Havacılık ve Uzay Sanayii A.Ş. (TAI) tarafından geliştirilen ve dikey kalkış-iniş (VTOL) kabiliyetine sahip yeni nesil insansız hava aracı (IHA), resmi olarak Kara Kuvvetleri envanterine girdi.\\n\\nİlk parti olarak 12 adet teslim edilen IHA'lar, geniş operasyonel yetenekleri ile dikkat çekiyor. Araç, gelişmiş gece görüş sistemi ve yapay zeka destekli otonom navigasyon sistemiyle donatılı. 18 saate kadar kesintisiz uçuş yapabilen IHA, 500 km'ye kadar menzile sahip.\\n\\nSavunma Sanayii Başkanlığı'ndan yapılan açıklamada, bu IHA'ların özellikle sınır güvenliği ve terörle mücadele operasyonlarında kullanılacağı belirtildi.\\n\\nProje kapsamında ayrıca, Katar ve Azerbaycan ile ihracat konusunda ön anlaşmalar imzalandı. 2025 yılının ilk çeyreğinde seri üretimin daha da artırılması planlanıyor.",
    timestamp: "42 dk önce",
    publishedAt: "27 Eylül 2024, 15:50",
    storyDate: "2024-09-27T15:50:00+03:00",
    readingTime: "5 dk okuma",
    dateline: "Eskişehir",
    tags: ["İHA", "Savunma", "YapayZeka"],
    imageUrl: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=720&q=60",
    images: [
      {
        url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=720&q=60",
        alt: "TAI fabrika görünümü",
        caption: "TAI'nin Ankara'daki üretim tesisi",
        credit: "TAI"
      },
      {
        url: "https://images.unsplash.com/photo-1473773508845-188df298d2d1?auto=format&fit=crop&w=720&q=60",
        alt: "Drone uçuş testi",
        caption: "Yeni nesil IHA'nın test uçuşu"
      }
    ],
    author: {
      name: "Ayşe Demir",
      title: "Savunma Sanayii Muhabiri"
    },
    sentiment: "positive",
    impact: "Yüksek",
    viewCount: 2156,
    likeCount: 234,
    shareCount: 89,
    storyId: "tai-vtol-iha",
    timelineOrder: 3,
    storyTitle: "TAI VTOL İHA Projesi: Başlangıçtan Envantere"
  },
  {
    id: "haber-4",
    category: "Teknoloji",
    title: "Yerli siber güvenlik girişimi 35 milyon dolar yatırım aldı",
    summary: "Siber savunma platformu ShieldMind, Avrupa genişlemesi öncesinde Seri B turunu tamamladı.",
    detail:
      "Fon, kamu kurumları için yapay zekâ destekli tehdit avcılığı modüllerinin geliştirilmesinde kullanılacak. Startup, 2025'te Londra ofisi açmayı planlıyor.",
    timestamp: "1 s önce",
    publishedAt: "27 Eylül 2024, 15:30",
    readingTime: "4 dk okuma",
    dateline: "İstanbul",
    tags: ["SiberGüvenlik", "Yatırım", "Startup"],
    imageUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=720&q=60",
    sentiment: "positive",
    impact: "Orta",
  },
  {
    id: "haber-5",
    category: "Enerji",
    title: "Güneş enerjisinde yeni dünya rekoru",
    summary: "Türk mühendislerin geliştirdiği perovskite güneş paneli %31.3 verimlilik oranına ulaştı.",
    detail:
      "TÜBITAK destekli projeyle geliştirilen teknoloji, silikon bazlı panellerden %40 daha verimli. Kitlesel üretim için patent başvurusu yapıldı.",
    timestamp: "58 dk önce",
    publishedAt: "27 Eylül 2024, 15:15",
    readingTime: "6 dk okuma",
    dateline: "Ankara",
    tags: ["GunesEnerji", "Inovasyon", "TUBITAK", "sponsorlu"],
    imageUrl: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=720&q=60",
    sentiment: "positive",
    impact: "Yüksek",
  },
  // Timeline haberleri - TAI VTOL İHA Projesi
  {
    id: "haber-vtol-1",
    category: "Savunma",
    title: "TAI yeni nesil VTOL İHA projesini başlattı",
    summary: "Dikey kalkış-iniş özelliğine sahip insansız hava aracı projesi SSB tarafından onaylanarak resmi olarak başlatıldı.",
    detail: "Proje kapsamında 3 yılda tamamlanması hedeflenen İHA, hem sivil hem askeri amaçlarla kullanılabilecek.",
    timestamp: "2 yıl önce",
    publishedAt: "15 Mart 2022, 10:30",
    storyDate: "2022-03-15T10:30:00+03:00",
    readingTime: "3 dk okuma",
    dateline: "Ankara",
    tags: ["İHA", "Savunma", "TAI"],
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=720&q=60",
    sentiment: "positive",
    impact: "Yüksek",
    viewCount: 5420,
    storyId: "tai-vtol-iha",
    timelineOrder: 1,
    storyTitle: "TAI VTOL İHA Projesi: Başlangıçtan Envantere"
  },
  {
    id: "haber-vtol-2",
    category: "Savunma",
    title: "VTOL İHA ilk uçuş testini başarıyla tamamladı",
    summary: "TAI tarafından geliştirilen dikey kalkış özellikli İHA, 45 dakika süren ilk test uçuşunu başarıyla gerçekleştirdi.",
    detail: "Test uçuşunda 1000 metre irtifaya ulaşan araç, otonom kalkış ve iniş yeteneklerini gösterdi.",
    timestamp: "8 ay önce",
    publishedAt: "12 Ocak 2024, 14:15",
    storyDate: "2024-01-12T14:15:00+03:00",
    readingTime: "4 dk okuma",
    dateline: "Eskişehir",
    tags: ["İHA", "Test", "TAI"],
    imageUrl: "https://images.unsplash.com/photo-1564428433544-7a10602c8ef8?auto=format&fit=crop&w=720&q=60",
    sentiment: "positive",
    impact: "Orta",
    viewCount: 3245,
    storyId: "tai-vtol-iha",
    timelineOrder: 2,
    storyTitle: "TAI VTOL İHA Projesi: Başlangıçtan Envantere"
  },
  // Timeline haberleri - Borsa İstanbul Rekorları
  {
    id: "haber-borsa-1",
    category: "Finans",
    title: "Borsa İstanbul tarihinin en büyük hacim rekoru",
    summary: "BIST 100 endeksi 3,2 milyar dolarlık işlem hacmiyle tarihi zirve yaptı.",
    detail: "Yabancı yatırımcıların yoğun ilgisi ve kurumsal alımların etkisiyle gerçekleşen rekor hacim, piyasada büyük heyecan yarattı.",
    timestamp: "2 yıl önce",
    publishedAt: "23 Şubat 2022, 18:00",
    storyDate: "2022-02-23T18:00:00+03:00",
    readingTime: "3 dk okuma",
    dateline: "İstanbul",
    tags: ["BIST100", "Bankacılık", "Hacim"],
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=720&q=60",
    sentiment: "positive",
    impact: "Yüksek",
    viewCount: 8750,
    storyId: "borsa-rekorlari",
    timelineOrder: 1,
    storyTitle: "Borsa İstanbul Hacim Rekorları Serisi"
  },
  {
    id: "haber-borsa-2",
    category: "Finans",
    title: "BIST 100 ikinci çeyrekte yeni seviyeler gördü",
    summary: "Bankacılık sektörünün güçlü performansıyla endeks 8.500 seviyesini aştı.",
    detail: "TCMB'nin para politikasındaki kararlılık ve enflasyon beklentilerindeki iyileşme, bankacılık hisselerine olan ilgiyi artırdı.",
    timestamp: "1 yıl önce",
    publishedAt: "15 Haziran 2023, 16:45",
    storyDate: "2023-06-15T16:45:00+03:00",
    readingTime: "4 dk okuma",
    dateline: "İstanbul",
    tags: ["BIST100", "Bankacılık", "TCMB"],
    imageUrl: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=720&q=60",
    sentiment: "positive",
    impact: "Yüksek",
    viewCount: 6420,
    storyId: "borsa-rekorlari",
    timelineOrder: 2,
    storyTitle: "Borsa İstanbul Hacim Rekorları Serisi"
  }
];

interface NewsPageProps {
  readonly params: Promise<{
    readonly id: string;
    readonly locale: string;
  }>;
}

export default async function NewsPage({ params }: NewsPageProps): Promise<JSX.Element> {
  const { id } = await params;
  const article = newsItems.find(item => item.id === id);

  if (!article) {
    notFound();
  }

  // Get popular news (sorted by view count)
  const popularNews = [...newsItems]
    .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
    .slice(0, 6);

  // Get recent news (sorted by timestamp - simulated)
  const recentNews = [...newsItems]
    .sort((a, b) => {
      const aTime = a.timestamp.includes('dk') ? parseInt(a.timestamp) : 
                   a.timestamp.includes('sa') ? parseInt(a.timestamp) * 60 : 1000;
      const bTime = b.timestamp.includes('dk') ? parseInt(b.timestamp) : 
                   b.timestamp.includes('sa') ? parseInt(b.timestamp) * 60 : 1000;
      return aTime - bTime;
    })
    .slice(0, 5);

  // Get related news (same category or similar tags)
  const relatedNews = newsItems
    .filter(item => 
      item.id !== article.id && 
      (item.category === article.category || 
       item.tags.some(tag => article.tags.includes(tag)))
    )
    .slice(0, 4);

  const currentUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://nexachron.com'}/haber/${article.id}`;
  
  return (
    <>
      <ReadingProgress 
        articleTitle={article.title}
        articleUrl={currentUrl}
      />
      
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#162639_0%,#1a2234_55%,#0f1624_100%)]">
        <DynamicScrollbarWrapper>
          <SmoothScrollWrapper>
          <div className="container mx-auto px-6 py-8">
            <div className="flex gap-8 max-w-7xl mx-auto lg:h-[calc(100vh-4rem)] lg:overflow-hidden">
              {/* Main Content */}
              <main className="flex-1 min-w-0">
                <div
                  id="article-scroll-container"
                  className="lg:h-full lg:overflow-y-auto lg:pr-6 lg:pb-12 dynamic-scrollbar"
                >
                  <NewsArticle 
                    article={article} 
                    relatedNews={relatedNews}
                    allNews={newsItems}
                  />
                </div>
              </main>
              
              {/* Sidebar */}
              <NewsSidebar 
                popularNews={popularNews}
                recentNews={recentNews}
                currentArticleId={article.id}
              />
            </div>
          </div>
          </SmoothScrollWrapper>
        </DynamicScrollbarWrapper>
      </div>
    </>
  );
}
