import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { SummaryType } from '../dto/news-item.dto';

export interface SummaryRequest {
  title: string;
  content: string;
  description: string;
  category: string;
}

export interface SummaryResponse {
  summary: string;
  summary_type: SummaryType;
  confidence: number;
}

@Injectable()
export class AiSummaryService {
  private readonly logger = new Logger(AiSummaryService.name);
  private openai: OpenAI | null = null;
  private readonly isEnabled: boolean;

  // Budget tracking (simple in-memory for now)
  private usageStats = {
    totalRequests: 0,
    totalTokens: 0,
    estimatedCost: 0,
    dailyLimit: 100, // Max requests per day to stay under budget
    lastReset: new Date().toDateString(),
  };

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.isEnabled = !!apiKey;

    if (this.isEnabled) {
      this.openai = new OpenAI({
        apiKey: apiKey,
      });
      this.logger.log('OpenAI API initialized with budget controls');
    } else {
      this.logger.warn(
        'OpenAI API key not found. AI summarization disabled. Set OPENAI_API_KEY to enable.',
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
      this.logger.log('Daily AI usage counter reset');
    }

    // Check daily limit
    if (this.usageStats.totalRequests >= this.usageStats.dailyLimit) {
      this.logger.warn(
        `Daily AI request limit reached (${this.usageStats.dailyLimit})`,
      );
      return false;
    }

    return true;
  }

  /**
   * Determines if an article is worth AI summarization
   * Only summarize if content is significantly longer than description
   */
  private shouldSummarize(request: SummaryRequest): boolean {
    const contentLength = request.content.length;
    const descriptionLength = request.description.length;

    // Only summarize if:
    // 1. Content is at least 3x longer than description
    // 2. Content has substantial length (500+ characters)
    // 3. Description is relatively short (less than 200 chars)
    return (
      contentLength > descriptionLength * 3 &&
      contentLength > 500 &&
      descriptionLength < 200
    );
  }

  /**
   * Generates an AI summary for a news article (budget-conscious)
   */
  async generateSummary(request: SummaryRequest): Promise<SummaryResponse | null> {
    if (!this.canMakeRequest()) {
      this.logger.debug(
        'Skipping AI summary due to budget limits or availability',
      );
      return {
        summary: request.description,
        summary_type: SummaryType.ORIGINAL,
        confidence: 1.0,
      };
    }

    if (!this.shouldSummarize(request)) {
      this.logger.debug(
        `Skipping AI summary - content not significantly longer than description`,
      );
      return {
        summary: request.description,
        summary_type: SummaryType.ORIGINAL,
        confidence: 1.0,
      };
    }

    try {
      const prompt = this.buildEfficientPrompt(request);

      const completion = await this.openai!.chat.completions.create({
        model: 'gpt-3.5-turbo', // Cheapest model
        messages: [
          {
            role: 'system',
            content: 'Sen Türkçe haber özetleyicisisin. Kısa, net özetler yap.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 200, // Allow for more complete summaries (~150 words)
        temperature: 0.1, // Low creativity for consistent, factual summaries
      });

      const response = completion.choices[0]?.message?.content?.trim();

      if (!response) {
        throw new Error('No response from OpenAI');
      }

      // Update usage stats
      this.usageStats.totalRequests++;
      this.usageStats.totalTokens += completion.usage?.total_tokens || 0;
      this.usageStats.estimatedCost +=
        (completion.usage?.total_tokens || 0) * 0.0000015; // Rough estimate

      this.logger.log(
        `AI summary generated. Usage: ${this.usageStats.totalRequests}/${this.usageStats.dailyLimit} daily requests`,
      );
      return {
        summary: response,
        summary_type: SummaryType.AI_GENERATED,
        confidence: 0.8, // Good confidence for AI-generated summary
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate AI summary for: ${request.title}`,
        error,
      );
      return {
        summary: request.description,
        summary_type: SummaryType.ORIGINAL,
        confidence: 1.0,
      };
    }
  }

  /**
   * Builds an efficient prompt to minimize token usage
   */
  private buildEfficientPrompt(request: SummaryRequest): string {
    // Keep prompt short to save tokens
    const truncatedContent =
      request.content.length > 1500
        ? request.content.substring(0, 1500) + '...'
        : request.content;

    return `Başlık: ${request.title}

İçerik: ${truncatedContent}

Bu haberi net ve anlaşılır şekilde özetle. 3-4 cümle kullan. Her cümle maksimum 15-20 kelime olsun. Önemli detayları kaçırma. 
ÖNEMLİ: Başlığı tekrar etme, sadece içeriği özetle. Başlık zaten verildi, özetin başında tekrar yazma.
Sadece özet yaz, başka açıklama ekleme.`;
  }

  /**
   * Batch summarization with strict budget controls
   */
  async generateBatchSummaries(
    requests: SummaryRequest[],
    maxRequests = 10, // Limit batch size
  ): Promise<SummaryResponse[]> {
    if (!this.isEnabled) {
      return requests.map((req) => ({
        summary: req.description,
        summary_type: SummaryType.ORIGINAL,
        confidence: 1.0,
      }));
    }

    this.logger.log(
      `Starting budget-conscious batch summarization for ${requests.length} articles`,
    );

    const results: SummaryResponse[] = [];
    let processedCount = 0;

    for (const request of requests.slice(0, maxRequests)) {
      if (!this.canMakeRequest()) {
        // Use original description for remaining items
        results.push({
          summary: request.description,
          summary_type: SummaryType.ORIGINAL,
          confidence: 1.0,
        });
        continue;
      }

      const response = await this.generateSummary(request);
      results.push(response || {
        summary: request.description,
        summary_type: SummaryType.ORIGINAL,
        confidence: 1.0,
      });
      processedCount++;

      // Small delay to be nice to the API
      if (processedCount < requests.length) {
        await this.delay(500); // 0.5 second delay
      }
    }

    // Fill remaining with descriptions if we hit limits
    while (results.length < requests.length) {
      results.push({
        summary: requests[results.length].description,
        summary_type: SummaryType.ORIGINAL,
        confidence: 1.0,
      });
    }

    this.logger.log(
      `Batch summarization completed: ${processedCount} AI summaries, ${requests.length - processedCount} fallbacks`,
    );
    return results;
  }

  /**
   * Get usage statistics for monitoring budget
   */
  getUsageStats() {
    return {
      ...this.usageStats,
      remainingDailyRequests:
        this.usageStats.dailyLimit - this.usageStats.totalRequests,
      estimatedMonthlyCost: this.usageStats.estimatedCost * 30, // Rough monthly projection
    };
  }

  /**
   * Check if AI summarization is available
   */
  isAvailable(): boolean {
    return this.isEnabled && this.canMakeRequest();
  }

  /**
   * Helper method for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Update daily limit for budget control
   */
  setDailyLimit(limit: number): void {
    this.usageStats.dailyLimit = limit;
    this.logger.log(`AI daily request limit updated to: ${limit}`);
  }
}

