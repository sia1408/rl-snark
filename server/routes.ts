import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { handleGitHubWebhook } from "./github-integration";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/articles", async (req, res) => {
    try {
      const searchQuery = req.query.search as string;
      const categoriesQuery = req.query.categories as string;
      const severityQuery = req.query.severity as string;
      const limitQuery = req.query.limit as string;
      const offsetQuery = req.query.offset as string;

      const filters: any = {};
      
      if (searchQuery) filters.search = searchQuery;
      if (categoriesQuery) filters.categories = categoriesQuery.split(',');
      if (severityQuery && severityQuery !== 'all') filters.severity = severityQuery;
      if (limitQuery) filters.limit = parseInt(limitQuery, 10);
      if (offsetQuery) filters.offset = parseInt(offsetQuery, 10);

      const articles = await storage.getArticles(filters);
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  app.get("/api/articles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid article ID" });

      const article = await storage.getArticle(id);
      if (!article) return res.status(404).json({ message: "Article not found" });

      await storage.updateArticleViews(id);
      res.json(article);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  app.post("/api/articles/:id/like", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid article ID" });

      const { increment } = req.body;
      if (typeof increment !== 'boolean') {
        return res.status(400).json({ message: "Increment must be a boolean" });
      }

      const article = await storage.getArticle(id);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      await storage.updateArticleLikes(id, increment);
      const updated = await storage.getArticle(id);
      res.json({ likes: updated!.likes });
    } catch (error) {
      res.status(500).json({ message: "Failed to update likes" });
    }
  });

  app.post("/api/articles/:id/dislike", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid article ID" });

      const { increment } = req.body;
      if (typeof increment !== 'boolean') {
        return res.status(400).json({ message: "Increment must be a boolean" });
      }

      const article = await storage.getArticle(id);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      await storage.updateArticleDislikes(id, increment);
      const updated = await storage.getArticle(id);
      res.json({ dislikes: updated!.dislikes });
    } catch (error) {
      res.status(500).json({ message: "Failed to update dislikes" });
    }
  });

  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  app.post("/api/github/webhook", async (req, res) => {
    try {
      console.log("Webhook received:", JSON.stringify(req.body, null, 2));
      await handleGitHubWebhook(req, res);
    } catch (error) {
      console.error("GitHub webhook error:", error);
      res.status(500).json({ message: "Failed to process webhook" });
    }
  });

  app.post("/api/test/create-article", async (req, res) => {
    try {
      const { repoFullName, filePath } = req.body;

      if (!repoFullName || !filePath) {
        return res.status(400).json({ message: "repoFullName and filePath are required" });
      }

      const { fetchFileFromGitHub, articleFileSchema } = await import("./github-integration");

      const fileContent = await fetchFileFromGitHub(repoFullName, filePath);
      const articleData = JSON.parse(fileContent);
      const validatedData = articleFileSchema.parse(articleData);

      const articleToInsert = {
        ...validatedData,
        reporter: validatedData.reporter || "AI Safety Fails Team",
        readTime: validatedData.readTime || "5 min read",
      };

      const newArticle = await storage.createArticle(articleToInsert);

      res.status(200).json({
        message: "Article created successfully",
        article: newArticle
      });
    } catch (error) {
      console.error("Test endpoint error:", error);
      res.status(500).json({ message: "Failed to create article", error: String(error) });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
