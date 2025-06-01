import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  severity: text("severity").notNull(), // 'critical', 'concerning', 'monitoring'
  company: text("company").notNull(),
  location: text("location"),
  views: integer("views").default(0),
  comments: integer("comments").default(0),
  likes: integer("likes").default(0),
  dislikes: integer("dislikes").default(0),
  reporter: text("reporter").default("AI Safety Fails Team"),
  readTime: text("read_time").default("5 min read"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  views: true,
  comments: true,
  likes: true,
  dislikes: true,
  timestamp: true,
});

export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articles.$inferSelect;

export const categories = [
  "Goal Misgeneralization",
  "Reward Hacking",
  "Distribution Shift",
  "Mesa-Optimization",
  "Deceptive Alignment"
] as const;

export const severityLevels = [
  "critical",
  "concerning", 
  "monitoring"
] as const;
