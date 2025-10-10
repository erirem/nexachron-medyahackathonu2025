import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

type RecommendRequest = {
  readonly type?: 'news' | 'games';
  readonly limit?: number;
  readonly window?: number; // gün cinsinden zaman penceresi
};

// Kişiselleştirme politikaları (servis katmanında)
interface RecommendationPolicy {
  readonly categoryWeight: number; // Tercih edilen kategori ağırlığı
  readonly freshnessWeight: number; // Tazelik ağırlığı
  readonly diversityWeight: number; // Çeşitlilik ağırlığı
  readonly coldStartThreshold: number; // Cold-start eşiği (etkileşim sayısı)
  readonly maxCategories: number; // Maksimum kategori sayısı
  readonly discoveryRate: number; // Keşif oranı (0-1 arası)
}

interface UserProfile {
  readonly totalInteractions: number;
  readonly uniqueCategories: number;
  readonly engagementLevel: string;
  readonly topCategories: Array<{
    readonly category: string;
    readonly percentage: number;
    readonly interactions: number;
  }>;
  readonly isColdStart: boolean;
  readonly isHighEngagement: boolean;
  readonly hasDiverseInterests: boolean;
  // Okuma davranışı sinyalleri
  readonly totalReadingTime: number;
  readonly avgReadingTime: number;
  readonly readingConsistency: number;
  readonly preferredReadingCategories: Array<{
    readonly category: string;
    readonly timeSeconds: number;
    readonly articles: number;
  }>;
  readonly isDeepReader: boolean; // 5+ dakika ortalama okuma süresi
  readonly isConsistentReader: boolean; // Düzenli okuma alışkanlığı
}

interface ScoredNewsItem {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly imageUrl: string;
  readonly category: string;
  readonly createdAt: string;
  readonly publishedAt: string;
  readonly city: string;
  readonly categoryScore: number;
  readonly freshnessScore: number;
  readonly popularityScore: number;
  readonly finalScore: number;
  readonly reason: string;
}

@Injectable()
export class RecommendationsHybridService {
  private readonly logger = new Logger(RecommendationsHybridService.name);

  // A/B test ve feature flag için politikalar
  private readonly policies: Record<string, RecommendationPolicy> = {
    default: {
      categoryWeight: 0.6,
      freshnessWeight: 0.3,
      diversityWeight: 0.1,
      coldStartThreshold: 5,
      maxCategories: 3,
      discoveryRate: 0.2,
    },
    highEngagement: {
      categoryWeight: 0.7,
      freshnessWeight: 0.2,
      diversityWeight: 0.1,
      coldStartThreshold: 20,
      maxCategories: 5,
      discoveryRate: 0.1,
    },
    discovery: {
      categoryWeight: 0.4,
      freshnessWeight: 0.3,
      diversityWeight: 0.3,
      coldStartThreshold: 2,
      maxCategories: 2,
      discoveryRate: 0.5,
    },
  };

  constructor(private readonly supabase: SupabaseService) {}

  async getRecommendations(req: RecommendRequest, userId?: string) {
    const limit = Math.min(Math.max(req.limit ?? 20, 1), 50);
    const window = req.window ?? 30;

    // Kullanıcı ID'si varsa hibrit kişiselleştirme
    if (userId) {
      try {
        return await this.getHybridRecommendations(userId, limit, window);
      } catch (error) {
        this.logger.error(`Error in hybrid recommendations: ${error.message}`);
        return this.getPopularNews(limit);
      }
    }

    // Fallback: popüler haberler
    return this.getPopularNews(limit);
  }

  // Hibrit öneri sistemi: DB'den ham veri, serviste iş mantığı
  private async getHybridRecommendations(
    userId: string,
    limit: number,
    window: number,
  ) {
    // 1. DB'den ham sinyalleri al (okuma süresi dahil)
    const [userSignals, engagementSignals, readingSignals, popularNews] = await Promise.all([
      this.getUserCategorySignals(userId, window),
      this.getUserEngagementSignals(userId, window),
      this.getUserReadingSignals(userId, window),
      this.getPopularNewsSignals(limit * 2, 7), // 2x al, sonra filtrele
    ]);

    if (!userSignals.ok || !engagementSignals.ok || !popularNews.ok) {
      this.logger.warn(
        'Failed to fetch user signals, falling back to popular news',
      );
      return this.getPopularNews(limit);
    }

    // 2. Kullanıcı profili analizi (servis katmanında - okuma süresi dahil)
    const userProfile = this.analyzeUserProfile(
      userSignals.data,
      engagementSignals.data,
      readingSignals.data,
    );

    // 3. Cold start kontrolü - onboarding tercihlerini kullan
    if (userProfile.isColdStart) {
      return this.getColdStartRecommendations(userId, limit, popularNews.data);
    }

    // 4. Politika seçimi (A/B test için)
    const policy = this.selectPolicy(userProfile);

    // 5. Kişiselleştirilmiş skorlama (servis katmanında)
    const scoredNews = this.scoreNews(popularNews.data, userProfile, policy);

    // 6. Çeşitlilik ve keşif ekleme
    const diversifiedNews = this.addDiversity(scoredNews, policy);

    // 7. Sonuçları sırala ve sınırla
    const finalRecommendations = diversifiedNews
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, limit);

    this.logger.log(
      `Generated ${finalRecommendations.length} recommendations for user ${userId} using policy: ${policy.name}`,
    );

    return {
      ok: true,
      items: finalRecommendations,
      personalized: true,
      reason: `Kişiselleştirilmiş öneriler (${policy.name})`,
      userProfile,
      policy: policy.name,
    };
  }

  // Cold start kullanıcıları için onboarding tercihlerine dayalı öneriler
  private async getColdStartRecommendations(userId: string, limit: number, popularNews: any[]) {
    try {
      // Kullanıcının onboarding tercihlerini al
      const { data: preferences } = await this.supabase.adminSupabase
        .from('user_profile_preferences')
        .select('categories, target_moods')
        .eq('user_id', userId)
        .single();

      if (!preferences) {
        // Tercih yoksa popüler haberler döndür
        return this.getPopularNews(limit);
      }

      const preferredCategories = preferences.categories?.preferred || [];
      const preferredMoods = preferences.target_moods?.prefer || [];

      // Tercih edilen kategorilere göre filtrele
      const filteredNews = popularNews.filter(item => 
        preferredCategories.includes(item.category)
      );

      // Eğer tercih edilen kategorilerde yeterli haber yoksa, popüler haberlerle doldur
      const remainingSlots = limit - filteredNews.length;
      const additionalNews = popularNews
        .filter(item => !preferredCategories.includes(item.category))
        .slice(0, remainingSlots);

      const finalNews = [...filteredNews, ...additionalNews].slice(0, limit);

      // Cold start için özel skorlama
      const scoredNews = finalNews.map(item => {
        const categoryMatch = preferredCategories.includes(item.category);
        const moodMatch = this.checkMoodMatch(item, preferredMoods);
        
        const finalScore = 
          (categoryMatch ? 80 : 20) + // Kategori eşleşmesi ağırlıklı
          (moodMatch ? 20 : 0) + // Mood eşleşmesi bonus
          (item.popularity_score * 0.1); // Popülerlik bonus

        return {
          ...item,
          finalScore,
          reason: categoryMatch 
            ? 'Seçtiğiniz kategorilerden' 
            : 'Popüler içerik'
        };
      });

      this.logger.log(
        `Generated ${scoredNews.length} cold start recommendations for user ${userId}`
      );

      return {
        ok: true,
        items: scoredNews,
        personalized: true,
        reason: 'Onboarding tercihlerinize göre öneriler',
        userProfile: { isColdStart: true },
        policy: 'coldStartWithPreferences',
      };

    } catch (error) {
      this.logger.error(`Cold start recommendations failed: ${error.message}`);
      return this.getPopularNews(limit);
    }
  }

  // Mood eşleşmesi kontrolü
  private checkMoodMatch(item: any, preferredMoods: string[]): boolean {
    // Basit mood eşleşmesi - gerçek implementasyonda daha karmaşık olabilir
    const itemMood = this.detectItemMood(item);
    return preferredMoods.includes(itemMood);
  }

  // Haber içeriğinden mood tespiti (basit versiyon)
  private detectItemMood(item: any): string {
    const title = (item.title || '').toLowerCase();
    const summary = (item.summary || '').toLowerCase();
    const content = `${title} ${summary}`;

    if (content.includes('gelişme') || content.includes('başarı') || content.includes('artış')) {
      return 'pozitif';
    }
    if (content.includes('analiz') || content.includes('detay') || content.includes('rapor')) {
      return 'derinlemesine';
    }
    if (content.includes('son dakika') || content.includes('acil') || content.includes('hızlı')) {
      return 'hızlı';
    }
    return 'nötr';
  }

  // DB'den kullanıcı kategori sinyalleri
  private async getUserCategorySignals(userId: string, window: number) {
    const { data, error } = await this.supabase.adminSupabase.rpc(
      'nxa_user_category_signals',
      { p_user_id: userId, p_time_window_days: window },
    );
    return { ok: !error, data: error ? null : data, error: error?.message };
  }

  // DB'den kullanıcı etkileşim sinyalleri (okuma süresi dahil)
  private async getUserEngagementSignals(userId: string, window: number) {
    const { data, error } = await this.supabase.adminSupabase.rpc(
      'nxa_user_engagement_signals',
      { p_user_id: userId, p_time_window_days: window },
    );
    return {
      ok: !error,
      data: error ? null : data?.[0],
      error: error?.message,
    };
  }

  // DB'den kullanıcı okuma davranışı sinyalleri
  private async getUserReadingSignals(userId: string, window: number) {
    const { data, error } = await this.supabase.adminSupabase.rpc(
      'nxa_user_reading_patterns',
      { p_user_id: userId, p_time_window_days: window },
    );
    return {
      ok: !error,
      data: error ? null : data?.[0],
      error: error?.message,
    };
  }

  // DB'den popüler haber sinyalleri
  private async getPopularNewsSignals(limit: number, window: number) {
    const { data, error } = await this.supabase.adminSupabase.rpc(
      'nxa_popular_news_signals',
      { p_limit: limit, p_time_window_days: window },
    );
    return { ok: !error, data: error ? null : data, error: error?.message };
  }

  // Kullanıcı profili analizi (servis katmanında - okuma süresi dahil)
  private analyzeUserProfile(
    categorySignals: any[],
    engagementSignals: any,
    readingSignals: any,
  ): UserProfile {
    const totalInteractions = engagementSignals?.total_interactions || 0;
    const uniqueCategories = engagementSignals?.unique_categories || 0;
    const engagementLevel = engagementSignals?.engagement_level || 'low';

    // Okuma davranışı sinyalleri
    const totalReadingTime = readingSignals?.total_reading_time_seconds || 0;
    const avgReadingTime = readingSignals?.avg_reading_time_seconds || 0;
    const readingConsistency = readingSignals?.reading_consistency_score || 0;
    const preferredReadingCategories = readingSignals?.preferred_categories || [];
    const readingEngagementLevel = readingSignals?.engagement_level || 'low';

    // En çok etkileşim kurduğu kategoriler
    const topCategories = categorySignals
      .slice(0, 5)
      .map((cat) => ({
        category: cat.category,
        percentage: cat.category_percentage,
        interactions: cat.interaction_count,
      }));

    return {
      totalInteractions,
      uniqueCategories,
      engagementLevel,
      topCategories,
      isColdStart: totalInteractions < 5,
      isHighEngagement: totalInteractions > 50,
      hasDiverseInterests: uniqueCategories > 3,
      // Okuma davranışı
      totalReadingTime,
      avgReadingTime,
      readingConsistency,
      preferredReadingCategories,
      isDeepReader: avgReadingTime >= 300, // 5+ dakika ortalama
      isConsistentReader: readingConsistency >= 30, // %30+ tutarlılık
    };
  }

  // Politika seçimi (A/B test için)
  private selectPolicy(
    userProfile: UserProfile,
  ): RecommendationPolicy & { name: string } {
    if (userProfile.isColdStart) {
      // Cold start kullanıcıları için onboarding tercihlerini kullan
      return { ...this.policies.discovery, name: 'coldStartWithPreferences' };
    }
    if (userProfile.isHighEngagement) {
      return { ...this.policies.highEngagement, name: 'highEngagement' };
    }
    return { ...this.policies.default, name: 'default' };
  }

  // Haber skorlama (servis katmanında - okuma süresi dahil)
  private scoreNews(
    news: any[],
    userProfile: UserProfile,
    policy: RecommendationPolicy,
  ): ScoredNewsItem[] {
    return news.map((item) => {
      // Kategori tercihi skoru
      const categoryMatch = userProfile.topCategories.find(
        (cat) => cat.category === item.category,
      );
      const categoryScore = categoryMatch
        ? (categoryMatch.percentage / 100) * policy.categoryWeight * 100
        : 0;

      // Okuma davranışı skoru (yeni!)
      const readingMatch = userProfile.preferredReadingCategories.find(
        (cat) => cat.category === item.category,
      );
      const readingScore = readingMatch
        ? Math.min((readingMatch.timeSeconds / 300) * 20, 50) // Max 50 puan
        : 0;

      // Tazelik skoru
      const freshnessScore =
        (item.freshness_score / 100) * policy.freshnessWeight * 100;

      // Popülerlik skoru
      const popularityScore = Math.min(item.popularity_score * 10, 100); // 0-100 arası normalize et

      // Derin okur için uzun içerik bonusu
      const contentLengthBonus = userProfile.isDeepReader ? 10 : 0;

      // Tutarlı okur için kategori bonusu
      const consistencyBonus = userProfile.isConsistentReader && categoryMatch ? 15 : 0;

      // Final skor (okuma davranışı dahil)
      const finalScore = 
        categoryScore + 
        readingScore + 
        freshnessScore + 
        (popularityScore * 0.3) + 
        contentLengthBonus + 
        consistencyBonus;

      // Öneri nedeni
      let reason = 'Popüler içerik';
      if (categoryMatch && readingMatch) {
        reason = 'Tercih ettiğiniz kategori ve okuma alışkanlığınız';
      } else if (categoryMatch) {
        reason = 'Tercih ettiğiniz kategori';
      } else if (readingMatch) {
        reason = 'Okuma alışkanlığınıza uygun';
      } else if (userProfile.isDeepReader) {
        reason = 'Derinlemesine okuma için uygun';
      }

      return {
        id: item.id,
        title: item.title,
        summary: item.summary,
        imageUrl: item.image_url,
        category: item.category,
        createdAt: item.created_at,
        publishedAt: item.published_at,
        city: item.city,
        categoryScore,
        freshnessScore,
        popularityScore,
        finalScore,
        reason,
      };
    });
  }

  // Çeşitlilik ekleme
  private addDiversity(
    scoredNews: ScoredNewsItem[],
    policy: RecommendationPolicy,
  ): ScoredNewsItem[] {
    const discoveryCount = Math.floor(scoredNews.length * policy.discoveryRate);
    const preferredCount = scoredNews.length - discoveryCount;

    // Tercih edilen kategorilerden
    const preferred = scoredNews
      .filter((item) => item.categoryScore > 0)
      .slice(0, preferredCount);

    // Keşif için farklı kategorilerden
    const discovery = scoredNews
      .filter((item) => item.categoryScore === 0)
      .slice(0, discoveryCount);

    return [...preferred, ...discovery];
  }

  private async getPopularNews(limit: number) {
    // Popularity: count recent events per item (last 48h), weight event types
    const { data: popular, error } = await this.supabase.adminSupabase.rpc(
      'nxa_popular_news',
      { p_limit: limit },
    );

    if (!error && Array.isArray(popular)) {
      return {
        ok: true,
        items: popular,
        personalized: false,
        reason: 'Popüler haberler',
      };
    }

    // Fallback: latest news by created_at desc
    const { data: latest, error: newsErr } = await this.supabase.adminSupabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (newsErr) return { ok: false, error: newsErr.message };
    return {
      ok: true,
      items: latest ?? [],
      personalized: false,
      reason: 'En yeni haberler',
    };
  }
}
