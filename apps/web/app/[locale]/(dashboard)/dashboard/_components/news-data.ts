import type { DashboardNewsItem } from "./types";

export const newsItems: DashboardNewsItem[] = [
  {
    id: "haber-1",
    category: "Finans",
    title: "Borsa İstanbul rekor hacimle haftayı tamamladı",
    subtitle: "TCMB politika adımları bankacılık sektörünü güçlendirdi",
    summary: "BIST 100 endeksi bankacılık hisselerindeki %3'lük primle 9.780 puanı aşarak tarihi zirveye yükseldi.",
    detail:
      "Yabancı yatırımcıların artan ilgisiyle birlikte 2,1 milyar dolarlık hacim gerçekleşti. Analistler, TCMB'nin sadeleşme adımlarının bankacılık tarafını desteklediğini vurguluyor.",
    fullContent:
      "Borsa İstanbul'da yaşanan tarihi performans, yatırımcıların dikkatini çekti. BIST 100 endeksi bankacılık hisselerindeki güçlü alımlarla birlikte %3'lük artışla günü 9.780 puanın üzerinde kapattı.\n\nYabancı yatırımcıların artan ilgisi ile birlikte günlük işlem hacmi 2,1 milyar doları buldu. Bu rakam, 2023 yılının en yüksek günlük hacim rekoru olma özelliği taşıyor.\n\nTCMB'nin son dönemde açıkladığı sadeleşme adımları ve para politikasındaki tutarlı duruş, özellikle bankacılık sektörünü olumlu etkiliyor. Garanti BBVA ve İş Bankası hisseleri günü %4'ün üzerinde artışla tamamladı.\n\nUzmanlar, bu trendin sürdürülebilirliği için küresel piyasalardaki gelişmelerin de yakından izlenmesi gerektiğini belirtiyor.",
    timestamp: "12 dk önce",
    publishedAt: "27 Eylül 2024, 16:30",
    readingTime: "4 dk okuma",
    dateline: "İstanbul",
    tags: ["BIST100", "Bankacılık", "TCMB", "sponsor"],
    imageUrl:
      "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=720&q=60",
    images: [
      {
        url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=720&q=60",
        alt: "Borsa İstanbul genel görünüm",
        caption: "Borsa İstanbul işlem salonu",
        credit: "AA Fotoğraf",
      },
      {
        url: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=720&q=60",
        alt: "Bankacılık hisseleri grafiği",
        caption: "Bankacılık endeksi günlük performansı",
      },
    ],
    author: {
      name: "Mehmet Özkan",
      title: "Ekonomi Muhabiri",
    },
    sentiment: "positive",
    impact: "Yüksek",
    viewCount: 3420,
    likeCount: 189,
    shareCount: 67,
  },
  {
    id: "haber-2",
    category: "Diplomasi",
    title: "Ankara'da üçlü enerji koridoru zirvesi",
    summary:
      "Türkiye, Azerbaycan ve Gürcistan enerji bakanları doğal gaz ve elektrikte entegre iletim planı için mutabakata vardı.",
    detail:
      "Toplantıda TANAP kapasite artışı ve yeşil hidrojen taşınması için ortak fizibilite çalışmalarının eylül ayında başlatılması kararlaştırıldı.",
    timestamp: "25 dk önce",
    publishedAt: "27 Eylül 2024, 16:05",
    readingTime: "3 dk okuma",
    dateline: "Ankara",
    tags: ["Enerji", "TANAP", "Diplomasi"],
    imageUrl:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=720&q=60",
    sentiment: "neutral",
    impact: "Orta",
  },
  {
    id: "haber-3",
    category: "Savunma",
    title: "Yeni nesil İHA'lar seri üretime geçti",
    subtitle: "Türkiye'nin savunma teknolojilerinde yeni dönem",
    summary:
      "TAI'nin geliştirdiği dikey iniş kalkış yeteneğine sahip İHA, ilk parti teslimatla Kara Kuvvetleri envanterine girdi.",
    detail:
      "Araç, gece görüş entegrasyonu ve yapay zekâ destekli rota optimizasyonu ile 18 saate kadar havada kalabiliyor. İhracat için iki ülke ile ön anlaşma yapıldı.",
    fullContent:
      "Türkiye Havacılık ve Uzay Sanayii A.Ş. (TAI) tarafından geliştirilen ve dikey kalkış-iniş (VTOL) kabiliyetine sahip yeni nesil insansız hava aracı (IHA), resmi olarak Kara Kuvvetleri envanterine girdi.\n\nİlk parti olarak 12 adet teslim edilen IHA'lar, geniş operasyonel yetenekleri ile dikkat çekiyor. Araç, gelişmiş gece görüş sistemi ve yapay zeka destekli otonom navigasyon sistemiyle donatılı. 18 saate kadar kesintisiz uçuş yapabilen IHA, 500 km'ye kadar menzile sahip.\n\nSavunma Sanayii Başkanlığı'ndan yapılan açıklamada, bu IHA'ların özellikle sınır güvenliği ve terörle mücadele operasyonlarında kullanılacağı belirtildi.\n\nProje kapsamında ayrıca, Katar ve Azerbaycan ile ihracat konusunda ön anlaşmalar imzalandı. 2025 yılının ilk çeyreğinde seri üretimin daha da artırılması planlanıyor.",
    timestamp: "42 dk önce",
    publishedAt: "27 Eylül 2024, 15:50",
    storyDate: "2024-09-27T15:50:00+03:00",
    readingTime: "5 dk okuma",
    dateline: "Eskişehir",
    tags: ["İHA", "Savunma", "YapayZeka"],
    imageUrl:
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=720&q=60",
    images: [
      {
        url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=720&q=60",
        alt: "TAI fabrika görünümü",
        caption: "TAI'nin Ankara'daki üretim tesisi",
        credit: "TAI",
      },
      {
        url: "https://images.unsplash.com/photo-1473773508845-188df298d2d1?auto=format&fit=crop&w=720&q=60",
        alt: "Drone uçuş testi",
        caption: "Yeni nesil IHA'nın test uçuşu",
      },
    ],
    author: {
      name: "Ayşe Demir",
      title: "Savunma Sanayii Muhabiri",
    },
    sentiment: "positive",
    impact: "Yüksek",
    viewCount: 2156,
    likeCount: 234,
    shareCount: 89,
    storyId: "tai-vtol-iha",
    timelineOrder: 3,
    storyTitle: "TAI VTOL İHA Projesi: Başlangıçtan Envantere",
  },
  {
    id: "haber-4",
    category: "Teknoloji",
    title: "Yerli siber güvenlik girişimi 35 milyon dolar yatırım aldı",
    summary:
      "Siber savunma platformu ShieldMind, Avrupa genişlemesi öncesinde Seri B turunu tamamladı.",
    detail:
      "Fon, kamu kurumları için yapay zekâ destekli tehdit avcılığı modüllerinin geliştirilmesinde kullanılacak. Startup, 2025'te Londra ofisi açmayı planlıyor.",
    timestamp: "1 s önce",
    publishedAt: "27 Eylül 2024, 15:30",
    readingTime: "4 dk okuma",
    dateline: "İstanbul",
    tags: ["SiberGüvenlik", "Yatırım", "Startup"],
    imageUrl:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=720&q=60",
    sentiment: "positive",
    impact: "Orta",
  },
  {
    id: "haber-5",
    category: "Enerji",
    title: "Güneş enerjisinde yeni dünya rekoru",
    summary:
      "Türk mühendislerin geliştirdiği perovskite güneş paneli %31.3 verimlilik oranına ulaştı.",
    detail:
      "TÜBITAK destekli projeyle geliştirilen teknoloji, silikon bazlı panellerden %40 daha verimli. Kitlesel üretim için patent başvurusu yapıldı.",
    timestamp: "58 dk önce",
    publishedAt: "27 Eylül 2024, 15:15",
    readingTime: "6 dk okuma",
    dateline: "Ankara",
    tags: ["GunesEnerji", "Inovasyon", "TUBITAK", "sponsorlu"],
    imageUrl:
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=720&q=60",
    sentiment: "positive",
    impact: "Yüksek",
  },
  {
    id: "haber-6",
    category: "Sağlık",
    title: "Yerli kanser ilacı insan denemesine başlıyor",
    summary:
      "Hacettepe Üniversitesi'nde geliştirilen CAR-T hücre terapisi, pankreas kanserine karşı umut veriyor.",
    detail:
      "Dünyada sadece 3 merkezde uygulanan teknoloji, hastanın kendi bağışıklık sistemi kullanılarak kanser hücrelerini yok ediyor. Fase 1 denemeleri başlıyor.",
    timestamp: "1 sa önce",
    publishedAt: "27 Eylül 2024, 15:00",
    readingTime: "5 dk okuma",
    dateline: "Ankara",
    tags: ["Kanser", "YerliIlac", "Universite"],
    imageUrl:
      "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=720&q=60",
    sentiment: "positive",
    impact: "Yüksek",
  },
  {
    id: "haber-7",
    category: "Ekonomi",
    title: "İhracat rakamları beklentileri aştı",
    summary:
      "Eylül ayı ihracatı bir önceki yıla göre %12.8 artışla 23.2 milyar dolara ulaştı.",
    detail:
      "Otomotiv, makine ve kimya sektörleri büyümenin lokomotifi oldu. Almanya ve ABD pazarlarında güçlü performans sergilendi.",
    timestamp: "2 sa önce",
    publishedAt: "27 Eylül 2024, 14:45",
    readingTime: "3 dk okuma",
    dateline: "Ankara",
    tags: ["Ihracat", "Ekonomi", "Otomotiv"],
    imageUrl:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=720&q=60",
    sentiment: "positive",
    impact: "Orta",
  },
  {
    id: "haber-8",
    category: "Teknoloji",
    title: "5G altyapısı genişleme planı açıklandı",
    summary:
      "Türk Telekom ve Turkcell ortaklığıyla 2024 sonuna kadar 500 şehirde 5G hizmeti verilecek.",
    detail:
      "Milli 5G teknolojisi ile geliştirilen altyapı, akıllı şehir uygulamalarına zemin hazırlayacak. İlk etapta İstanbul, Ankara ve İzmir'de test edilecek.",
    timestamp: "3 sa önce",
    publishedAt: "27 Eylül 2024, 14:00",
    readingTime: "4 dk okuma",
    dateline: "İstanbul",
    tags: ["5G", "Telekom", "AkilliSehir"],
    imageUrl:
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=720&q=60",
    sentiment: "neutral",
    impact: "Orta",
  },
  {
    id: "haber-9",
    category: "Çevre",
    title: "Marmara Denizi'nde müsilaj temizliği tamamlandı",
    summary:
      "2 yıl süren koordineli çalışma sonucu deniz salyası tamamen temizlendi, ekosistem normale döndü.",
    detail:
      "Çevre Bakanlığı koordinasyonunda yürütülen proje kapsamında 15 bin ton müsilaj toplandı. Su kalitesi izlemeleri olumlu sonuçlar veriyor.",
    timestamp: "4 sa önce",
    publishedAt: "27 Eylül 2024, 13:00",
    readingTime: "4 dk okuma",
    dateline: "İstanbul",
    tags: ["Marmara", "Musilaj", "Cevre"],
    imageUrl:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=720&q=60",
    sentiment: "positive",
    impact: "Yüksek",
  },
  {
    id: "haber-10",
    category: "Spor",
    title: "Türk atletizminde tarihi başarı",
    summary:
      "Dünya Atletizm Şampiyonası'nda 3 madalya kazanan milli takım, rekor kırdı.",
    detail:
      "Ramil Guliyev'in 200 metrede altını, Yasmani Copello'nun 400 metre engellede gümüşü, kadın bayrak takımının bronzu aldığı şampiyonada tarihi başarı elde edildi.",
    timestamp: "6 sa önce",
    publishedAt: "27 Eylül 2024, 11:00",
    readingTime: "3 dk okuma",
    dateline: "Budapeşte",
    tags: ["Atletizm", "Madalya", "Sampiyonluk"],
    imageUrl:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=720&q=60",
    sentiment: "positive",
    impact: "Orta",
  },
  {
    id: "haber-11",
    category: "Turizm",
    title: "2023 turizm hedefi erken ulaşıldı",
    summary: "Yılsonu hedefi olan 60 milyon turist sayısı ekim ayında aşıldı.",
    detail:
      "Rusya ve Almanya pazarlarındaki toparlanma, Orta Doğu'dan artan talep ve cruise turizmindeki artışla hedef erken gerçekleşti. Gelir hedefi de revize ediliyor.",
    timestamp: "8 sa önce",
    publishedAt: "27 Eylül 2024, 09:00",
    readingTime: "5 dk okuma",
    dateline: "Antalya",
    tags: ["Turizm", "Rekor", "Gelir"],
    imageUrl:
      "https://images.unsplash.com/photo-1520637836862-4d197d17c89a?auto=format&fit=crop&w=720&q=60",
    sentiment: "positive",
    impact: "Orta",
  },
  {
    id: "haber-12",
    category: "Tarım",
    title: "Drone'larla akıllı tarım yaygınlaşıyor",
    summary: "AI destekli tarım drone'ları ile verimlilikte %25 artış sağlandı.",
    detail:
      "Ziraat Bankası kredisiyle alınan 5 bin drone, hastalık tespiti ve ilaçlamada kullanılıyor. Çiftçiler maliyetleri %30 azalttı, verimi artırdı.",
    timestamp: "12 sa önce",
    publishedAt: "27 Eylül 2024, 05:00",
    readingTime: "4 dk okuma",
    dateline: "Konya",
    tags: ["AkilliTarim", "Drone", "Verimlilik"],
    imageUrl:
      "https://images.unsplash.com/photo-1594736797933-d0601ba2fe65?auto=format&fit=crop&w=720&q=60",
    sentiment: "positive",
    impact: "Orta",
  },
];


