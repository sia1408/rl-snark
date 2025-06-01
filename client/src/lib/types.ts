export type Article = {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  severity: string;
  company: string;
  location?: string;
  views: number;
  comments: number;
  likes: number;
  dislikes: number;
  reporter: string;
  readTime: string;
  timestamp: Date;
};

export type Stats = {
  totalIncidents: number;
  activeThisWeek: number;
  criticalLevel: number;
  categoryCounts: Record<string, number>;
};

export type Filters = {
  search: string;
  categories: string[];
  severity: string;
};
