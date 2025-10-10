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

@Injectable()
export class RecommendationsService {
  private readonly logger = new Logger(RecommendationsService.name);
  
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
  private async getHybridRecommendations(userId: string, limit: number, window: number) {
    // 1. DB'den ham sinyalleri al
    const [userSignals, engagementSignals, popularNews] = await Promise.all([
      this.getUserCategorySignals(userId, window),
      this.getUserEngagementSignals(userId, window),
      this.getPopularNewsSignals(limit * 2, 7) // 2x al, sonra filtrele
    ]);

    if (!userSignals.ok || !engagementSignals.ok || !popularNews.ok) {
      this.logger.warn('Failed to fetch user signals, falling back to popular news');
      return this.getPopularNews(limit);
    }

    // 2. Kullanıcı profili analizi (servis katmanında)
    const userProfile = this.analyzeUserProfile(userSignals.data, engagementSignals.data);
    
    // 3. Politika seçimi (A/B test için)
    const policy = this.selectPolicy(userProfile);
    
    // 4. Kişiselleştirilmiş skorlama (servis katmanında)
    const scoredNews = this.scoreNews(popularNews.data, userProfile, policy);
    
    // 5. Çeşitlilik ve keşif ekleme
    const diversifiedNews = this.addDiversity(scoredNews, policy);
    
    // 6. Sonuçları sırala ve sınırla
    const finalRecommendations = diversifiedNews
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, limit);

    this.logger.log(`Generated ${finalRecommendations.length} recommendations for user ${userId} using policy: ${policy.name}`);

    return {
      ok: true,
      items: finalRecommendations,
      personalized: true,
      reason: `Kişiselleştirilmiş öneriler (${policy.name})`,
      userProfile,
      policy: policy.name
    };
  }

  // DB'den kullanıcı kategori sinyalleri
  private async getUserCategorySignals(userId: string, window: number) {
    const { data, error } = await this.supabase.adminSupabase.rpc(
      'nxa_user_category_signals',
      { p_user_id: userId, p_time_window_days: window }
    );
    return { ok: !error, data: error ? null : data, error: error?.message };
  }

  // DB'den kullanıcı etkileşim sinyalleri
  private async getUserEngagementSignals(userId: string, window: number) {
    const { data, error } = await this.supabase.adminSupabase.rpc(
      'nxa_user_engagement_signals',
      { p_user_id: userId, p_time_window_days: window }
    );
    return { ok: !error, data: error ? null : data?.[0], error: error?.message };
  }

  // DB'den popüler haber sinyalleri
  private async getPopularNewsSignals(limit: number, window: number) {
    const { data, error } = await this.supabase.adminSupabase.rpc(
      'nxa_popular_news_signals',
      { p_limit: limit, p_time_window_days: window }
    );
    return { ok: !error, data: error ? null : data, error: error?.message };
  }

  // Kullanıcı profili analizi (servis katmanında)
  private analyzeUserProfile(categorySignals: any[], engagementSignals: any) {
    const totalInteractions = engagementSignals?.total_interactions || 0;
    const uniqueCategories = engagementSignals?.unique_categories || 0;
    const engagementLevel = engagementSignals?.engagement_level || 'low';
    
    // En çok etkileşim kurduğu kategoriler
    const topCategories = categorySignals
      .slice(0, 5)
      .map(cat => ({
        category: cat.category,
        percentage: cat.category_percentage,
        interactions: cat.interaction_count
      }));

    return {
      totalInteractions,
      uniqueCategories,
      engagementLevel,
      topCategories,
      isColdStart: totalInteractions < 5,
      isHighEngagement: totalInteractions > 50,
      hasDiverseInterests: uniqueCategories > 3
    };
  }

  // Politika seçimi (A/B test için)
  private selectPolicy(userProfile: any): RecommendationPolicy & { name: string } {
    if (userProfile.isColdStart) {
      return { ...this.policies.discovery, name: 'discovery' };
    }
    if (userProfile.isHighEngagement) {
      return { ...this.policies.highEngagement, name: 'highEngagement' };
    }
    return { ...this.policies.default, name: 'default' };
  }

  // Haber skorlama (servis katmanında)
  private scoreNews(news: any[], userProfile: any, policy: RecommendationPolicy) {
    return news.map(item => {
      // Kategori tercihi skoru
      const categoryMatch = userProfile.topCategories.find(
        (cat: any) => cat.category === item.category
      );
      const categoryScore = categoryMatch 
        ? (categoryMatch.percentage / 100) * policy.categoryWeight * 100
        : 0;

      // Tazelik skoru
      const freshnessScore = (item.freshness_score / 100) * policy.freshnessWeight * 100;

      // Popülerlik skoru
      const popularityScore = Math.min(item.popularity_score * 10, 100); // 0-100 arası normalize et

      // Final skor
      const finalScore = categoryScore + freshnessScore + (popularityScore * 0.3);

      return {
        ...item,
        categoryScore,
        freshnessScore,
        popularityScore,
        finalScore,
        reason: categoryMatch ? 'Tercih ettiğiniz kategori' : 'Popüler içerik'
      };
    });
  }

  // Çeşitlilik ekleme
  private addDiversity(scoredNews: any[], policy: RecommendationPolicy) {
    const discoveryCount = Math.floor(scoredNews.length * policy.discoveryRate);
    const preferredCount = scoredNews.length - discoveryCount;

    // Tercih edilen kategorilerden
    const preferred = scoredNews
      .filter(item => item.categoryScore > 0)
      .slice(0, preferredCount);

    // Keşif için farklı kategorilerden
    const discovery = scoredNews
      .filter(item => item.categoryScore === 0)
      .slice(0, discoveryCount);

    return [...preferred, ...discovery];
  }

  private async getPopularNews(limit: number) {
    // Popularity: count recent events per item (last 48h), weight event types
    const { data: popular, error } = await this.supabase.adminSupabase
      .rpc('nxa_popular_news', { p_limit: limit });

    if (!error && Array.isArray(popular)) {
      return { 
        ok: true, 
        items: popular, 
        personalized: false,
        reason: 'Popüler haberler'
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
      reason: 'En yeni haberler'
    };
  }

  // Kullanıcı tercih analizi için yardımcı fonksiyon
  async getUserPreferences(userId: string) {
    try {
      const { data, error } = await this.supabase.adminSupabase.rpc(
        'nxa_user_category_preferences',
        { 
          p_user_id: userId,
          p_limit: 5,
          p_time_window_days: 30
        }
      );

      if (error) {
        this.logger.error(`Error fetching user preferences: ${error.message}`);
        return { ok: false, error: error.message };
      }

      return { ok: true, preferences: data };
    } catch (error) {
      this.logger.error(`Error in getUserPreferences: ${error.message}`);
      return { ok: false, error: error.message };
    }
  }

  // Kullanıcı etkileşim özeti
  async getUserEngagementSummary(userId: string) {
    try {
      const { data, error } = await this.supabase.adminSupabase.rpc(
        'nxa_user_engagement_summary',
        { 
          p_user_id: userId,
          p_time_window_days: 30
        }
      );

      if (error) {
        this.logger.error(`Error fetching user engagement: ${error.message}`);
        return { ok: false, error: error.message };
      }

      return { ok: true, summary: data?.[0] };
    } catch (error) {
      this.logger.error(`Error in getUserEngagementSummary: ${error.message}`);
      return { ok: false, error: error.message };
    }
  }
}


