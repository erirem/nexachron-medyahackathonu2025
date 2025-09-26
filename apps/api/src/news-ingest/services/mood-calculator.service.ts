import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { MoodType } from '../dto/news-item.dto';

@Injectable()
export class MoodCalculatorService {
  private readonly logger = new Logger(MoodCalculatorService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Calculate mood for a news article based on user reactions
   */
  async calculateMoodForNews(newsId: string): Promise<MoodType> {
    try {
      // Get all reactions for this news item
      const { data: reactions, error } =
        await this.supabaseService.adminSupabase
          .from('reactions')
          .select('emoji')
          .eq('news_id', newsId);

      if (error) {
        this.logger.warn(
          `Failed to fetch reactions for news ${newsId}:`,
          error,
        );
        return MoodType.WORLD; // Default fallback
      }

      if (!reactions || reactions.length === 0) {
        return MoodType.WORLD; // Default for no reactions
      }

      // Calculate mood based on reaction distribution
      const reactionCounts = this.countReactions(reactions);
      return this.determineMoodFromReactions(reactionCounts);
    } catch (error) {
      this.logger.error(`Error calculating mood for news ${newsId}:`, error);
      return MoodType.WORLD; // Default fallback
    }
  }

  /**
   * Count reactions by emoji type
   */
  private countReactions(
    reactions: Array<{ emoji: string }>,
  ): Record<string, number> {
    const counts: Record<string, number> = {};

    reactions.forEach((reaction) => {
      counts[reaction.emoji] = (counts[reaction.emoji] || 0) + 1;
    });

    return counts;
  }

  /**
   * Determine mood based on reaction patterns
   */
  private determineMoodFromReactions(
    reactionCounts: Record<string, number>,
  ): MoodType {
    const totalReactions = Object.values(reactionCounts).reduce(
      (sum, count) => sum + count,
      0,
    );

    if (totalReactions === 0) {
      return MoodType.WORLD;
    }

    // Calculate percentages
    const percentages: Record<string, number> = {};
    Object.entries(reactionCounts).forEach(([emoji, count]) => {
      percentages[emoji] = (count / totalReactions) * 100;
    });

    // Mood determination algorithm based on emoji patterns
    const positiveEmojis = ['LIKE', 'LOVE', 'LAUGH'];
    const negativeEmojis = ['SAD', 'ANGRY'];
    const surpriseEmojis = ['WOW'];

    const positivePercentage = positiveEmojis.reduce(
      (sum, emoji) => sum + (percentages[emoji] || 0),
      0,
    );
    const negativePercentage = negativeEmojis.reduce(
      (sum, emoji) => sum + (percentages[emoji] || 0),
      0,
    );
    const surprisePercentage = surpriseEmojis.reduce(
      (sum, emoji) => sum + (percentages[emoji] || 0),
      0,
    );

    // Decision logic
    if (surprisePercentage > 40) {
      return MoodType.SURPRISE;
    }

    if (positivePercentage > 60) {
      return MoodType.HAPPY;
    }

    if (negativePercentage > 40 || totalReactions > 20) {
      return MoodType.TOP; // Important/controversial news gets attention
    }

    return MoodType.WORLD; // Default neutral mood
  }

  /**
   * Batch update moods for multiple news items
   */
  async updateMoodsForRecentNews(hours: number = 24): Promise<void> {
    try {
      // Get news items from the last X hours that have reactions
      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() - hours);

      const { data: newsWithReactions, error } =
        await this.supabaseService.adminSupabase
          .from('news')
          .select('id')
          .gte('created_at', cutoffTime.toISOString())
          .not('id', 'is', null);

      if (error || !newsWithReactions) {
        this.logger.warn('Failed to fetch recent news for mood update:', error);
        return;
      }

      this.logger.log(
        `Updating moods for ${newsWithReactions.length} recent news items`,
      );

      // Update mood for each news item
      for (const news of newsWithReactions) {
        const newMood = await this.calculateMoodForNews(news.id);

        await this.supabaseService.adminSupabase
          .from('news')
          .update({ mode: newMood })
          .eq('id', news.id);
      }

      this.logger.log(
        `Completed mood updates for ${newsWithReactions.length} news items`,
      );
    } catch (error) {
      this.logger.error('Error in batch mood update:', error);
    }
  }
}
