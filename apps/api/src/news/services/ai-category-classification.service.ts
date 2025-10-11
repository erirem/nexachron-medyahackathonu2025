import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { AACategory } from '../../shared/enums/news-category.enum';

export interface CategoryClassificationRequest {
  title: string;
  content?: string;
  description?: string;
}

export interface CategoryClassificationResponse {
  category: AACategory;
  confidence: number;
  reasoning: string;
}

@Injectable()
export class AiCategoryClassificationService {
  private readonly logger = new Logger(AiCategoryClassificationService.name);
  private openai: OpenAI | null = null;
  private readonly isEnabled: boolean;

  // Budget tracking
  private usageStats = {
    totalRequests: 0,
    totalTokens: 0,
    estimatedCost: 0,
    dailyLimit: 500, // Max requests per day for category classification
    lastReset: new Date().toDateString(),
  };

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.isEnabled = !!apiKey;

    if (this.isEnabled) {
      this.openai = new OpenAI({
        apiKey: apiKey,
      });
      this.logger.log('OpenAI API initialized for category classification');
    } else {
      this.logger.warn(
        'OpenAI API key not found. Category classification disabled. Set OPENAI_API_KEY to enable.',
      );
    }
  }

  /**
   * Checks if we can make AI requests without exceeding budget
   */
  private canMakeRequest(): boolean {
    if (!this.isEnabled) return false;

    // Reset daily counter if new day
    const today = new Date().toDateString();
    if (this.usageStats.lastReset !== today) {
      this.usageStats.totalRequests = 0;
      this.usageStats.totalTokens = 0;
      this.usageStats.estimatedCost = 0;
      this.usageStats.lastReset = today;
    }

    return this.usageStats.totalRequests < this.usageStats.dailyLimit;
  }

  /**
   * Determines if content is suitable for AI analysis
   */
  private shouldClassify(request: CategoryClassificationRequest): boolean {
    const titleLength = request.title?.length || 0;
    const contentLength = request.content?.length || 0;
    const descriptionLength = request.description?.length || 0;

    // Sadece başlık yeterli - içerik olmasa da çalışsın
    return titleLength > 10;
  }

  /**
   * Classifies news article into appropriate category using AI
   */
  async classifyCategory(
    request: CategoryClassificationRequest,
  ): Promise<CategoryClassificationResponse | null> {
    if (!this.canMakeRequest()) {
      this.logger.debug(
        'Skipping category classification due to budget limits or availability',
      );
      return {
        category: AACategory.GUNCEL,
        confidence: 0.5,
        reasoning: 'Classification skipped due to budget limits',
      };
    }

    if (!this.shouldClassify(request)) {
      this.logger.debug(
        `Skipping category classification - content too short`,
      );
      return {
        category: AACategory.GUNCEL,
        confidence: 0.5,
        reasoning: 'Content too short for analysis',
      };
    }

    try {
      const prompt = this.buildCategoryClassificationPrompt(request);

      const completion = await this.openai!.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Sen bir haber kategorisi uzmanısın. Haberleri içeriklerine göre uygun kategorilere ayırıyorsun.

Mevcut kategoriler:
- guncel: Güncel, genel haberler, önemli gelişmeler
- ekonomi: Ekonomi, finans, iş dünyası, para politikası
- spor: Spor, futbol, basketbol, olimpiyatlar
- dunya: Dünya haberleri, uluslararası gelişmeler
- teknoloji: Teknoloji, bilim, inovasyon, dijital dünya
- yasam: Yaşam, günlük hayat, sosyal konular
- saglik: Sağlık, tıp, hastalıklar, sağlık politikaları
- politika: Siyaset, hükümet, seçimler, siyasi gelişmeler
- analiz: Analiz, yorum, değerlendirme yazıları
- kultur: Kültür, sanat, edebiyat, müzik
- egitim: Eğitim, okullar, üniversiteler, eğitim politikaları
- futbol: Futbol, futbol maçları, futbolcular
- basketbol: Basketbol, NBA, basketbol maçları
- koronavirus: COVID-19, pandemi, aşı haberleri
- video: Video içerik, görsel haberler

Sadece bu kategorilerden birini seç ve güven seviyesini 0-1 arasında belirt.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 200,
        temperature: 0.1,
      });

      const response = completion.choices[0]?.message?.content?.trim();

      if (!response) {
        throw new Error('No response from OpenAI');
      }

      // Parse the response
      const classification = this.parseCategoryResponse(response);

      // Update usage stats
      this.usageStats.totalRequests++;
      this.usageStats.totalTokens += completion.usage?.total_tokens || 0;
      this.usageStats.estimatedCost +=
        (completion.usage?.total_tokens || 0) * 0.0000015; // Rough estimate

      this.logger.log(
        `Category classification completed. Usage: ${this.usageStats.totalRequests}/${this.usageStats.dailyLimit} daily requests`,
      );

      return classification;
    } catch (error) {
      this.logger.error(`Category classification failed: ${error.message}`);
      return {
        category: AACategory.GUNCEL,
        confidence: 0.3,
        reasoning: `Classification failed: ${error.message}`,
      };
    }
  }

  /**
   * Builds the prompt for category classification
   */
  private buildCategoryClassificationPrompt(
    request: CategoryClassificationRequest,
  ): string {
    const content = request.content || request.description || '';
    const contentPreview = content.length > 500 ? content.substring(0, 500) + '...' : content;

    // İçerik varsa kullan, yoksa sadece başlıkla çalış
    if (content.length > 0) {
      return `Haber başlığı: "${request.title}"

Haber içeriği: "${contentPreview}"

Bu haberi yukarıdaki kategorilerden hangisine ait olduğunu belirle. Sadece kategori adını ve güven seviyesini (0-1 arası) ver.`;
    } else {
      return `Haber başlığı: "${request.title}"

Bu haber başlığını yukarıdaki kategorilerden hangisine ait olduğunu belirle. Sadece kategori adını ve güven seviyesini (0-1 arası) ver.`;
    }
  }

  /**
   * Parses the AI response to extract category and confidence
   */
  private parseCategoryResponse(response: string): CategoryClassificationResponse {
    try {
      // Try to extract category and confidence from response
      const lines = response.split('\n').map(line => line.trim()).filter(line => line);
      
      let category = AACategory.GUNCEL;
      let confidence = 0.7;
      let reasoning = response;

      // Look for category in response
      for (const line of lines) {
        const lowerLine = line.toLowerCase();
        
        // Check for category matches
        if (lowerLine.includes('guncel') || lowerLine.includes('güncel')) {
          category = AACategory.GUNCEL;
        } else if (lowerLine.includes('ekonomi')) {
          category = AACategory.EKONOMI;
        } else if (lowerLine.includes('spor')) {
          category = AACategory.SPOR;
        } else if (lowerLine.includes('dunya') || lowerLine.includes('dünya')) {
          category = AACategory.DUNYA;
        } else if (lowerLine.includes('teknoloji')) {
          category = AACategory.TEKNOLOJI;
        } else if (lowerLine.includes('yasam') || lowerLine.includes('yaşam')) {
          category = AACategory.YASAM;
        } else if (lowerLine.includes('saglik') || lowerLine.includes('sağlık')) {
          category = AACategory.SAGLIK;
        } else if (lowerLine.includes('politika')) {
          category = AACategory.POLITIKA;
        } else if (lowerLine.includes('analiz')) {
          category = AACategory.ANALIZ;
        } else if (lowerLine.includes('kultur') || lowerLine.includes('kültür')) {
          category = AACategory.KULTUR;
        } else if (lowerLine.includes('egitim') || lowerLine.includes('eğitim')) {
          category = AACategory.EGITIM;
        } else if (lowerLine.includes('futbol')) {
          category = AACategory.FUTBOL;
        } else if (lowerLine.includes('basketbol')) {
          category = AACategory.BASKETBOL;
        } else if (lowerLine.includes('koronavirus') || lowerLine.includes('covid')) {
          category = AACategory.KORONAVIRUS;
        } else if (lowerLine.includes('video')) {
          category = AACategory.VIDEO;
        }

        // Try to extract confidence score
        const confidenceMatch = line.match(/(\d+\.?\d*)/);
        if (confidenceMatch) {
          const score = parseFloat(confidenceMatch[1]);
          if (score >= 0 && score <= 1) {
            confidence = score;
          }
        }
      }

      return {
        category,
        confidence,
        reasoning: reasoning.substring(0, 200), // Limit reasoning length
      };
    } catch (error) {
      this.logger.error(`Failed to parse category response: ${error.message}`);
      return {
        category: AACategory.GUNCEL,
        confidence: 0.5,
        reasoning: 'Failed to parse AI response',
      };
    }
  }

  /**
   * Get usage statistics
   */
  getUsageStats() {
    return {
      ...this.usageStats,
      isEnabled: this.isEnabled,
    };
  }

  /**
   * Reset usage statistics
   */
  resetUsageStats() {
    this.usageStats.totalRequests = 0;
    this.usageStats.totalTokens = 0;
    this.usageStats.estimatedCost = 0;
    this.usageStats.lastReset = new Date().toDateString();
  }
}
