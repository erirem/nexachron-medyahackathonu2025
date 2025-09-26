export type DashboardTopic = {
  readonly id: string;
  readonly title: string;
  readonly change: string;
  readonly sentiment: "positive" | "neutral" | "negative";
  readonly description: string;
  readonly icon: string;
};

export type DashboardNewsItem = {
  readonly id: string;
  readonly category: string;
  readonly title: string;
  readonly summary: string;
  readonly detail: string;
  readonly timestamp: string;
  readonly readingTime: string;
  readonly dateline: string;
  readonly tags: readonly string[];
  readonly imageUrl: string;
  readonly sentiment: "positive" | "neutral" | "negative";
  readonly impact: "Yüksek" | "Orta" | "Düşük";
};
