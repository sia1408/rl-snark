import { articles, type Article, type InsertArticle } from "@shared/schema";

export interface IStorage {
  getArticles(filters?: {
    search?: string;
    categories?: string[];
    severity?: string;
    limit?: number;
    offset?: number;
  }): Promise<Article[]>;
  getArticle(id: number): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticleViews(id: number): Promise<void>;
  updateArticleLikes(id: number, increment: boolean): Promise<void>;
  updateArticleDislikes(id: number, increment: boolean): Promise<void>;
  getStats(): Promise<{
    totalIncidents: number;
    activeThisWeek: number;
    criticalLevel: number;
    categoryCounts: Record<string, number>;
  }>;
}

export class MemStorage implements IStorage {
  private articles: Map<number, Article>;
  private currentId: number;

  constructor() {
    this.articles = new Map();
    this.currentId = 1;
    this.seedData();
  }

  private seedData() {
    const seedArticles: Omit<Article, 'id'>[] = [];

    seedArticles.forEach(articleData => {
      const id = this.currentId++;
      const article: Article = { ...articleData, id };
      this.articles.set(id, article);
    });
  }

  async getArticles(filters?: {
    search?: string;
    categories?: string[];
    severity?: string;
    limit?: number;
    offset?: number;
  }): Promise<Article[]> {
    let filtered = Array.from(this.articles.values());

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(search) ||
        article.excerpt.toLowerCase().includes(search) ||
        article.company.toLowerCase().includes(search)
      );
    }

    if (filters?.categories && filters.categories.length > 0) {
      filtered = filtered.filter(article =>
        filters.categories!.includes(article.category)
      );
    }

    if (filters?.severity && filters.severity !== 'all') {
      filtered = filtered.filter(article => article.severity === filters.severity);
    }

    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const offset = filters?.offset || 0;
    const limit = filters?.limit || 10;
    
    return filtered.slice(offset, offset + limit);
  }

  async getArticle(id: number): Promise<Article | undefined> {
    return this.articles.get(id);
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const id = this.currentId++;
    const article: Article = {
      ...insertArticle,
      id,
      views: 0,
      comments: 0,
      likes: 0,
      dislikes: 0,
      timestamp: new Date(),
    };
    this.articles.set(id, article);
    return article;
  }

  async updateArticleViews(id: number): Promise<void> {
    const article = this.articles.get(id);
    if (article) {
      article.views++;
      this.articles.set(id, article);
    }
  }

  async updateArticleLikes(id: number, increment: boolean): Promise<void> {
    const article = this.articles.get(id);
    if (article) {
      if (increment) {
        article.likes++;
      } else if (article.likes > 0) {
        article.likes--;
      }
      this.articles.set(id, article);
    }
  }

  async updateArticleDislikes(id: number, increment: boolean): Promise<void> {
    const article = this.articles.get(id);
    if (article) {
      if (increment) {
        article.dislikes++;
      } else if (article.dislikes > 0) {
        article.dislikes--;
      }
      this.articles.set(id, article);
    }
  }

  async getStats(): Promise<{
    totalIncidents: number;
    activeThisWeek: number;
    criticalLevel: number;
    categoryCounts: Record<string, number>;
  }> {
    const articles = Array.from(this.articles.values());
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const activeThisWeek = articles.filter(article => 
      new Date(article.timestamp) > oneWeekAgo
    ).length;

    const criticalLevel = articles.filter(article => 
      article.severity === 'critical'
    ).length;

    const categoryCounts: Record<string, number> = {};
    articles.forEach(article => {
      categoryCounts[article.category] = (categoryCounts[article.category] || 0) + 1;
    });

    return {
      totalIncidents: articles.length,
      activeThisWeek,
      criticalLevel,
      categoryCounts,
    };
  }
}

export const storage = new MemStorage();
