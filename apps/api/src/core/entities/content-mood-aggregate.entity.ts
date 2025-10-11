/**
 * Content Mood Aggregate Entity
 * Represents aggregated mood data for content items
 */

export enum MoodType {
  HAPPY = 'happy',
  SURPRISED = 'surprised',
  THOUGHTFUL = 'thoughtful',
  SAD = 'sad',
  ANGRY = 'angry',
  NEUTRAL = 'neutral',
}

export interface CreateContentMoodAggregateData {
  itemId: string;
  happyCount?: number;
  surprisedCount?: number;
  thoughtfulCount?: number;
  sadCount?: number;
  angryCount?: number;
  neutralCount?: number;
  lastUpdatedAt?: Date;
}

export interface UpdateContentMoodAggregateData {
  happyCount?: number;
  surprisedCount?: number;
  thoughtfulCount?: number;
  sadCount?: number;
  angryCount?: number;
  neutralCount?: number;
  lastUpdatedAt?: Date;
}

export class ContentMoodAggregateEntity {
  itemId: string;
  happyCount: number;
  surprisedCount: number;
  thoughtfulCount: number;
  sadCount: number;
  angryCount: number;
  neutralCount: number;
  lastUpdatedAt: Date;

  constructor(data: {
    item_id: string;
    happy_count: number;
    surprised_count: number;
    thoughtful_count: number;
    sad_count: number;
    angry_count: number;
    neutral_count: number;
    last_updated_at: string;
  }) {
    this.itemId = data.item_id;
    this.happyCount = data.happy_count;
    this.surprisedCount = data.surprised_count;
    this.thoughtfulCount = data.thoughtful_count;
    this.sadCount = data.sad_count;
    this.angryCount = data.angry_count;
    this.neutralCount = data.neutral_count;
    this.lastUpdatedAt = new Date(data.last_updated_at);
  }

  // Business logic methods
  getTotalReactions(): number {
    return this.happyCount + this.surprisedCount + this.thoughtfulCount + 
           this.sadCount + this.angryCount + this.neutralCount;
  }

  getDominantMood(): MoodType {
    const moods = [
      { type: MoodType.HAPPY, count: this.happyCount },
      { type: MoodType.SURPRISED, count: this.surprisedCount },
      { type: MoodType.THOUGHTFUL, count: this.thoughtfulCount },
      { type: MoodType.SAD, count: this.sadCount },
      { type: MoodType.ANGRY, count: this.angryCount },
      { type: MoodType.NEUTRAL, count: this.neutralCount },
    ];
    
    return moods.reduce((max, current) => 
      current.count > max.count ? current : max
    ).type;
  }

  getMoodDistribution(): Record<MoodType, number> {
    const total = this.getTotalReactions();
    if (total === 0) {
      return {
        [MoodType.HAPPY]: 0,
        [MoodType.SURPRISED]: 0,
        [MoodType.THOUGHTFUL]: 0,
        [MoodType.SAD]: 0,
        [MoodType.ANGRY]: 0,
        [MoodType.NEUTRAL]: 0,
      };
    }

    return {
      [MoodType.HAPPY]: (this.happyCount / total) * 100,
      [MoodType.SURPRISED]: (this.surprisedCount / total) * 100,
      [MoodType.THOUGHTFUL]: (this.thoughtfulCount / total) * 100,
      [MoodType.SAD]: (this.sadCount / total) * 100,
      [MoodType.ANGRY]: (this.angryCount / total) * 100,
      [MoodType.NEUTRAL]: (this.neutralCount / total) * 100,
    };
  }

  getMoodPercentage(mood: MoodType): number {
    const total = this.getTotalReactions();
    if (total === 0) return 0;
    
    switch (mood) {
      case MoodType.HAPPY:
        return (this.happyCount / total) * 100;
      case MoodType.SURPRISED:
        return (this.surprisedCount / total) * 100;
      case MoodType.THOUGHTFUL:
        return (this.thoughtfulCount / total) * 100;
      case MoodType.SAD:
        return (this.sadCount / total) * 100;
      case MoodType.ANGRY:
        return (this.angryCount / total) * 100;
      case MoodType.NEUTRAL:
        return (this.neutralCount / total) * 100;
      default:
        return 0;
    }
  }

  getMoodScore(): number {
    // Weighted mood score (-1 to 1, where 1 is most positive)
    const total = this.getTotalReactions();
    if (total === 0) return 0;
    
    const weights = {
      [MoodType.HAPPY]: 1.0,
      [MoodType.SURPRISED]: 0.5,
      [MoodType.THOUGHTFUL]: 0.2,
      [MoodType.NEUTRAL]: 0.0,
      [MoodType.SAD]: -0.5,
      [MoodType.ANGRY]: -1.0,
    };
    
    let score = 0;
    for (const [mood, weight] of Object.entries(weights)) {
      const count = this.getMoodCount(mood as MoodType);
      score += (count / total) * weight;
    }
    
    return score;
  }

  getMoodCount(mood: MoodType): number {
    switch (mood) {
      case MoodType.HAPPY:
        return this.happyCount;
      case MoodType.SURPRISED:
        return this.surprisedCount;
      case MoodType.THOUGHTFUL:
        return this.thoughtfulCount;
      case MoodType.SAD:
        return this.sadCount;
      case MoodType.ANGRY:
        return this.angryCount;
      case MoodType.NEUTRAL:
        return this.neutralCount;
      default:
        return 0;
    }
  }

  getMoodSentiment(): 'positive' | 'negative' | 'neutral' {
    const score = this.getMoodScore();
    if (score > 0.2) return 'positive';
    if (score < -0.2) return 'negative';
    return 'neutral';
  }

  getMoodIntensity(): 'low' | 'medium' | 'high' {
    const total = this.getTotalReactions();
    if (total >= 100) return 'high';
    if (total >= 20) return 'medium';
    return 'low';
  }

  getMoodDiversity(): number {
    // Calculate mood diversity using Shannon entropy
    const total = this.getTotalReactions();
    if (total === 0) return 0;
    
    const moods = [
      this.happyCount,
      this.surprisedCount,
      this.thoughtfulCount,
      this.sadCount,
      this.angryCount,
      this.neutralCount,
    ].filter(count => count > 0);
    
    if (moods.length <= 1) return 0;
    
    let entropy = 0;
    for (const count of moods) {
      const probability = count / total;
      entropy -= probability * Math.log2(probability);
    }
    
    return entropy;
  }

  getTopMoods(limit: number = 3): Array<{ mood: MoodType; count: number; percentage: number }> {
    const moods = [
      { mood: MoodType.HAPPY, count: this.happyCount },
      { mood: MoodType.SURPRISED, count: this.surprisedCount },
      { mood: MoodType.THOUGHTFUL, count: this.thoughtfulCount },
      { mood: MoodType.SAD, count: this.sadCount },
      { mood: MoodType.ANGRY, count: this.angryCount },
      { mood: MoodType.NEUTRAL, count: this.neutralCount },
    ]
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
    
    const total = this.getTotalReactions();
    return moods.map(item => ({
      ...item,
      percentage: total > 0 ? (item.count / total) * 100 : 0,
    }));
  }

  getMoodConsistency(): number {
    // Measures how consistent the mood is (0-1, where 1 is most consistent)
    const total = this.getTotalReactions();
    if (total === 0) return 0;
    
    const dominantCount = Math.max(
      this.happyCount,
      this.surprisedCount,
      this.thoughtfulCount,
      this.sadCount,
      this.angryCount,
      this.neutralCount
    );
    
    return dominantCount / total;
  }

  isRecent(days: number = 7): boolean {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.lastUpdatedAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= days;
  }

  getMoodTrend(): 'improving' | 'declining' | 'stable' {
    // This would need historical data to determine
    // For now, return based on mood score
    const score = this.getMoodScore();
    if (score > 0.3) return 'improving';
    if (score < -0.3) return 'declining';
    return 'stable';
  }

  getEngagementLevel(): 'low' | 'medium' | 'high' {
    const total = this.getTotalReactions();
    if (total >= 50) return 'high';
    if (total >= 10) return 'medium';
    return 'low';
  }

  getMoodBalance(): number {
    // Returns mood balance score (0-1, where 1 is most balanced)
    const positiveCount = this.happyCount + this.surprisedCount;
    const negativeCount = this.sadCount + this.angryCount;
    const neutralCount = this.neutralCount + this.thoughtfulCount;
    
    const total = this.getTotalReactions();
    if (total === 0) return 0;
    
    const maxCount = Math.max(positiveCount, negativeCount, neutralCount);
    return 1 - (maxCount / total);
  }
}
