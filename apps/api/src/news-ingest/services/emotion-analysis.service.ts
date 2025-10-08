import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { NewsModeType } from '../dto/news-item.dto';

export interface EmotionAnalysisRequest {
  title: string;
  content: string;
  summary: string;
  category: string;
}

export interface EmotionAnalysisResponse {
  emotion: NewsModeType;
  confidence: number;
  reasoning: string;
}

export type EmotionType = 'JOY' | 'SADNESS' | 'ANGER' | 'FEAR' | 'SURPRISE' | 'NEUTRAL';

@Injectable()
export class EmotionAnalysisService {
  private readonly logger = new Logger(EmotionAnalysisService.name);
  private openai: OpenAI | null = null;
  private readonly isEnabled: boolean;

  // Budget tracking
  private usageStats = {
    totalRequests: 0,
    totalTokens: 0,
    estimatedCost: 0,
    dailyLimit: 1000, // Max requests per day for emotion analysis
    lastReset: new Date().toDateString(),
  };

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.isEnabled = !!apiKey;

    if (this.isEnabled) {
      this.openai = new OpenAI({
        apiKey: apiKey,
      });
      this.logger.log('OpenAI API initialized for emotion analysis');
    } else {
      this.logger.warn(
        'OpenAI API key not found. Emotion analysis disabled. Set OPENAI_API_KEY to enable.',
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
      this.usageStats.lastReset = today;
    }

    return this.usageStats.totalRequests < this.usageStats.dailyLimit;
  }

  /**
   * Checks if emotion analysis is available
   */
  isAvailable(): boolean {
    return this.isEnabled && this.canMakeRequest();
  }

  /**
   * Determines if content is worth analyzing for emotions
   */
  private shouldAnalyze(request: EmotionAnalysisRequest): boolean {
    const contentLength = request.content.length;
    const titleLength = request.title.length;
    
    // Only analyze if content is substantial enough
    return contentLength > 100 && titleLength > 10;
  }

  /**
   * Analyzes the emotional impact of a news article
   */
  async analyzeEmotion(
    request: EmotionAnalysisRequest,
  ): Promise<EmotionAnalysisResponse | null> {
    if (!this.canMakeRequest()) {
      this.logger.debug(
        'Skipping emotion analysis due to budget limits or availability',
      );
      return {
        emotion: NewsModeType.NEUTRAL,
        confidence: 0.5,
        reasoning: 'Analysis skipped due to budget limits',
      };
    }

    if (!this.shouldAnalyze(request)) {
      this.logger.debug(
        `Skipping emotion analysis - content too short`,
      );
      return {
        emotion: NewsModeType.NEUTRAL,
        confidence: 0.5,
        reasoning: 'Content too short for analysis',
      };
    }

    try {
      const prompt = this.buildEmotionAnalysisPrompt(request);

      const completion = await this.openai!.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Sen bir haber duygu analizi uzmanısın. Haberlerin insanlarda oluşturduğu duyguları analiz ediyorsun.

Duygu kategorileri:
- JOY: Mutluluk, sevinç, umut verici haberler
- SADNESS: Üzüntü, hüzün, acıklı haberler
- ANGER: Öfke, kızgınlık, protesto haberleri
- FEAR: Korku, endişe, tehdit içeren haberler
- SURPRISE: Şaşkınlık, beklenmedik haberler
- NEUTRAL: Duygusal yükü az, objektif haberler

Sadece bu kategorilerden birini seç ve güven seviyesini 0-1 arasında belirt.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 150,
        temperature: 0.1,
      });

      const response = completion.choices[0]?.message?.content?.trim();

      if (!response) {
        throw new Error('No response from OpenAI');
      }

      // Parse the response
      const analysis = this.parseEmotionResponse(response);

      // Update usage stats
      this.usageStats.totalRequests++;
      this.usageStats.totalTokens += completion.usage?.total_tokens || 0;
      // Real GPT-3.5-turbo pricing: $0.0015/1K input, $0.002/1K output
      const inputTokens = completion.usage?.prompt_tokens || 0;
      const outputTokens = completion.usage?.completion_tokens || 0;
      const inputCost = (inputTokens / 1000) * 0.0015;
      const outputCost = (outputTokens / 1000) * 0.002;
      this.usageStats.estimatedCost += inputCost + outputCost;

      this.logger.log(
        `Emotion analysis completed. Usage: ${this.usageStats.totalRequests}/${this.usageStats.dailyLimit} daily requests`,
      );

      return analysis;
    } catch (error) {
      this.logger.error('Emotion analysis failed:', error);
      return {
        emotion: NewsModeType.NEUTRAL,
        confidence: 0.3,
        reasoning: 'Analysis failed, defaulting to neutral',
      };
    }
  }

  /**
   * Batch emotion analysis for multiple articles
   */
  async analyzeBatchEmotions(
    requests: EmotionAnalysisRequest[],
    maxItems: number = 20,
  ): Promise<EmotionAnalysisResponse[]> {
    if (!this.isAvailable()) {
      return requests.slice(0, maxItems).map(() => ({
        emotion: NewsModeType.NEUTRAL,
        confidence: 0.5,
        reasoning: 'Analysis not available',
      }));
    }

    const limitedRequests = requests.slice(0, maxItems);
    const results: EmotionAnalysisResponse[] = [];

    for (const request of limitedRequests) {
      try {
        // Check if we can still make requests before analyzing
        if (!this.canMakeRequest()) {
          this.logger.debug('Budget limit reached, stopping batch analysis');
          break; // Stop processing when limit is reached
        }
        
        const analysis = await this.analyzeEmotion(request);
        results.push(analysis || {
          emotion: NewsModeType.NEUTRAL,
          confidence: 0.3,
          reasoning: 'Analysis failed',
        });
      } catch (error) {
        this.logger.error('Batch emotion analysis failed for item:', error);
        results.push({
          emotion: NewsModeType.NEUTRAL,
          confidence: 0.3,
          reasoning: 'Analysis error',
        });
      }
    }

    return results;
  }

  /**
   * Builds the prompt for emotion analysis
   */
  private buildEmotionAnalysisPrompt(request: EmotionAnalysisRequest): string {
    return `Haber Başlığı: ${request.title}

Haber Kategorisi: ${request.category}

Haber Özeti: ${request.summary}

Haber İçeriği: ${request.content.substring(0, 1000)}...

Bu haberin insanlarda oluşturacağı ana duyguyu belirle. Sadece şu formatta yanıtla:
DUYGU: [JOY|SADNESS|ANGER|FEAR|SURPRISE|NEUTRAL]
GÜVEN: [0.0-1.0 arası sayı]
AÇIKLAMA: [Kısa açıklama]`;
  }

  /**
   * Parses the AI response to extract emotion data
   */
  private parseEmotionResponse(response: string): EmotionAnalysisResponse {
    const lines = response.split('\n');
    let emotion: NewsModeType = NewsModeType.NEUTRAL;
    let confidence = 0.5;
    let reasoning = 'Default analysis';

    for (const line of lines) {
      if (line.startsWith('DUYGU:')) {
        const emotionMatch = line.match(/DUYGU:\s*(\w+)/);
        if (emotionMatch) {
          const emotionStr = emotionMatch[1].toUpperCase();
          // Map emotion strings to NewsModeType enum values
          switch (emotionStr) {
            case 'JOY':
              emotion = NewsModeType.JOY;
              break;
            case 'SADNESS':
              emotion = NewsModeType.SADNESS;
              break;
            case 'ANGER':
              emotion = NewsModeType.ANGER;
              break;
            case 'FEAR':
              emotion = NewsModeType.FEAR;
              break;
            case 'SURPRISE':
              emotion = NewsModeType.SURPRISE;
              break;
            case 'NEUTRAL':
              emotion = NewsModeType.NEUTRAL;
              break;
            default:
              emotion = NewsModeType.NEUTRAL;
          }
        }
      } else if (line.startsWith('GÜVEN:')) {
        const confidenceMatch = line.match(/GÜVEN:\s*([0-9.]+)/);
        if (confidenceMatch) {
          confidence = Math.max(0, Math.min(1, parseFloat(confidenceMatch[1])));
        }
      } else if (line.startsWith('AÇIKLAMA:')) {
        reasoning = line.replace('AÇIKLAMA:', '').trim();
      }
    }

    return {
      emotion,
      confidence,
      reasoning,
    };
  }

  /**
   * Get usage statistics for monitoring budget
   */
  getUsageStats() {
    return {
      ...this.usageStats,
      isAvailable: this.isAvailable(),
    };
  }
}
