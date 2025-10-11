/**
 * User Profile Preference Entity
 * Represents user preferences for personalization
 */

export interface CreateUserProfilePreferenceData {
  userId: string;
  personalizationOptIn?: boolean;
  categories?: Record<string, any>;
  targetMoods?: Record<string, any>;
  language?: string;
}

export interface UpdateUserProfilePreferenceData {
  personalizationOptIn?: boolean;
  categories?: Record<string, any>;
  targetMoods?: Record<string, any>;
  language?: string;
}

export class UserProfilePreferenceEntity {
  userId: string;
  personalizationOptIn: boolean;
  categories?: Record<string, any>;
  targetMoods?: Record<string, any>;
  language?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: {
    user_id: string;
    personalization_opt_in: boolean;
    categories?: any;
    target_moods?: any;
    language?: string;
    created_at: string;
    updated_at: string;
  }) {
    this.userId = data.user_id;
    this.personalizationOptIn = data.personalization_opt_in;
    this.categories = data.categories;
    this.targetMoods = data.target_moods;
    this.language = data.language;
    this.createdAt = new Date(data.created_at);
    this.updatedAt = new Date(data.updated_at);
  }

  // Business logic methods
  isPersonalizationEnabled(): boolean {
    return this.personalizationOptIn;
  }

  getPreferredCategories(): string[] {
    if (!this.categories) return [];
    return Object.keys(this.categories).filter(key => 
      this.categories![key] === true || this.categories![key] > 0
    );
  }

  getCategoryPreference(category: string): number {
    if (!this.categories || !this.categories[category]) return 0;
    const value = this.categories[category];
    return typeof value === 'boolean' ? (value ? 1 : 0) : value;
  }

  hasCategoryPreference(category: string): boolean {
    return this.getCategoryPreference(category) > 0;
  }

  getPreferredMoods(): string[] {
    if (!this.targetMoods) return [];
    return Object.keys(this.targetMoods).filter(key => 
      this.targetMoods![key] === true || this.targetMoods![key] > 0
    );
  }

  getMoodPreference(mood: string): number {
    if (!this.targetMoods || !this.targetMoods[mood]) return 0;
    const value = this.targetMoods[mood];
    return typeof value === 'boolean' ? (value ? 1 : 0) : value;
  }

  hasMoodPreference(mood: string): boolean {
    return this.getMoodPreference(mood) > 0;
  }

  getLanguage(): string {
    return this.language || 'en';
  }

  setLanguage(language: string): void {
    this.language = language;
  }

  enablePersonalization(): void {
    this.personalizationOptIn = true;
  }

  disablePersonalization(): void {
    this.personalizationOptIn = false;
  }

  addCategoryPreference(category: string, weight: number = 1): void {
    if (!this.categories) {
      this.categories = {};
    }
    this.categories[category] = weight;
  }

  removeCategoryPreference(category: string): void {
    if (this.categories) {
      delete this.categories[category];
    }
  }

  addMoodPreference(mood: string, weight: number = 1): void {
    if (!this.targetMoods) {
      this.targetMoods = {};
    }
    this.targetMoods[mood] = weight;
  }

  removeMoodPreference(mood: string): void {
    if (this.targetMoods) {
      delete this.targetMoods[mood];
    }
  }

  getTopCategories(limit: number = 5): Array<{ category: string; weight: number }> {
    if (!this.categories) return [];
    
    return Object.entries(this.categories)
      .filter(([_, weight]) => weight > 0)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([category, weight]) => ({ category, weight }));
  }

  getTopMoods(limit: number = 5): Array<{ mood: string; weight: number }> {
    if (!this.targetMoods) return [];
    
    return Object.entries(this.targetMoods)
      .filter(([_, weight]) => weight > 0)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([mood, weight]) => ({ mood, weight }));
  }

  getPreferenceScore(): number {
    // Returns overall preference strength (0-1)
    const categoryCount = this.getPreferredCategories().length;
    const moodCount = this.getPreferredMoods().length;
    const maxScore = 10; // Maximum possible score
    
    return Math.min((categoryCount + moodCount) / maxScore, 1);
  }

  getPersonalizationLevel(): 'none' | 'basic' | 'advanced' {
    const score = this.getPreferenceScore();
    if (score >= 0.7) return 'advanced';
    if (score >= 0.3) return 'basic';
    return 'none';
  }

  hasAnyPreferences(): boolean {
    return this.getPreferredCategories().length > 0 || 
           this.getPreferredMoods().length > 0;
  }

  getPreferenceDiversity(): number {
    // Measures diversity of preferences (0-1)
    const categories = this.getPreferredCategories();
    const moods = this.getPreferredMoods();
    const total = categories.length + moods.length;
    
    if (total === 0) return 0;
    if (total === 1) return 0.2;
    if (total <= 3) return 0.5;
    if (total <= 6) return 0.8;
    return 1.0;
  }

  getRecommendationWeight(): number {
    // Returns weight for recommendation algorithms
    if (!this.isPersonalizationEnabled()) return 0;
    
    const preferenceScore = this.getPreferenceScore();
    const diversityScore = this.getPreferenceDiversity();
    
    return (preferenceScore * 0.7) + (diversityScore * 0.3);
  }

  isRecent(days: number = 30): boolean {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.updatedAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= days;
  }

  getPreferenceAge(): number {
    // Returns age of preferences in days
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.updatedAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  needsUpdate(): boolean {
    // Returns true if preferences need updating
    return this.getPreferenceAge() > 90; // 90 days
  }

  getEngagementLevel(): 'low' | 'medium' | 'high' {
    const score = this.getPreferenceScore();
    if (score >= 0.6) return 'high';
    if (score >= 0.3) return 'medium';
    return 'low';
  }

  getCustomizationLevel(): 'minimal' | 'moderate' | 'extensive' {
    const categoryCount = this.getPreferredCategories().length;
    const moodCount = this.getPreferredMoods().length;
    const total = categoryCount + moodCount;
    
    if (total >= 8) return 'extensive';
    if (total >= 4) return 'moderate';
    return 'minimal';
  }

  getPreferenceStability(): number {
    // Returns preference stability score (0-1)
    // This would need historical data to determine
    // For now, return based on preference age
    const age = this.getPreferenceAge();
    if (age <= 7) return 0.2; // Very recent, unstable
    if (age <= 30) return 0.5; // Somewhat stable
    if (age <= 90) return 0.8; // Stable
    return 1.0; // Very stable
  }
}
