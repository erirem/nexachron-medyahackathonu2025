export type DashboardTopic = {
  readonly id: string;
  readonly title: string;
  readonly change: string;
  readonly sentiment: "positive" | "neutral" | "negative";
  readonly description: string;
  readonly icon: string;
};

export type NewsImage = {
  readonly url: string;
  readonly caption?: string;
  readonly alt: string;
  readonly credit?: string;
};

export type NewsAuthor = {
  readonly name: string;
  readonly title?: string;
  readonly avatar?: string;
};

export type DashboardNewsItem = {
  readonly id: string;
  readonly category: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly summary: string;
  readonly detail: string;
  readonly fullContent?: string;
  readonly timestamp: string;
  readonly publishedAt: string;
  readonly storyDate?: string;
  readonly readingTime: string;
  readonly dateline: string;
  readonly tags: readonly string[];
  readonly imageUrl: string;
  readonly images?: readonly NewsImage[];
  readonly author?: NewsAuthor;
  readonly sentiment: "positive" | "neutral" | "negative";
  readonly impact: "Yüksek" | "Orta" | "Düşük";
  readonly viewCount?: number;
  readonly likeCount?: number;
  readonly shareCount?: number;
  readonly relatedIds?: readonly string[];
  readonly storyId?: string; // Groups related news in a timeline
  readonly timelineOrder?: number; // Order in the timeline
  readonly storyTitle?: string; // Overall story title
};
