import { Request, Response } from "express";
import { storage } from "./storage";
import { insertArticleSchema } from "@shared/schema";
import { z } from "zod";

interface GitHubCommit {
  id: string;
  message: string;
  added: string[];
  modified: string[];
  removed: string[];
  author: {
    name: string;
    email: string;
  };
}

interface GitHubWebhookPayload {
  ref: string;
  commits: GitHubCommit[];
  repository: {
    name: string;
    full_name: string;
  };
  pusher: {
    name: string;
  };
}

const articleFileSchema = z.object({
  title: z.string(),
  excerpt: z.string(),
  content: z.string(),
  category: z.enum(["Goal Misgeneralization", "Reward Hacking", "Distribution Shift", "Mesa-Optimization", "Deceptive Alignment"]),
  severity: z.enum(["critical", "concerning", "monitoring"]),
  company: z.string(),
  location: z.string().optional(),
  reporter: z.string().optional(),
  readTime: z.string().optional(),
});

export async function handleGitHubWebhook(req: Request, res: Response) {
  try {
    const payload: GitHubWebhookPayload = req.body;

    if (payload.ref !== 'refs/heads/main') {
      return res.status(200).json({ message: 'Ignored non-main branch push' });
    }

    const articlesAdded: string[] = [];

    for (const commit of payload.commits) {
      const addedFiles = commit.added?.filter(file =>
        file.startsWith('articles/') && file.endsWith('.json')
      ) || [];

      const modifiedFiles = commit.modified?.filter(file =>
        file.startsWith('articles/') && file.endsWith('.json')
      ) || [];

      const articleFiles = [...addedFiles, ...modifiedFiles];

      for (const filePath of articleFiles) {
        try {
          const fileContent = await fetchFileFromGitHub(payload.repository.full_name, filePath);
          const articleData = JSON.parse(fileContent);

          const validatedData = articleFileSchema.parse(articleData);

          const articleToInsert = {
            ...validatedData,
            reporter: validatedData.reporter || "AI Safety Fails Team",
            readTime: validatedData.readTime || "5 min read",
          };

          await storage.createArticle(articleToInsert);
          articlesAdded.push(validatedData.title);

        } catch (error) {
          console.error(`Failed to process article file ${filePath}:`, error);
        }
      }
    }

    res.status(200).json({
      message: 'Webhook processed successfully',
      articlesAdded: articlesAdded.length,
      titles: articlesAdded
    });

  } catch (error) {
    console.error('GitHub webhook error:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
}

async function fetchFileFromGitHubInternal(repoFullName: string, filePath: string): Promise<string> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GitHub token not configured');
  }

  const url = `https://api.github.com/repos/${repoFullName}/contents/${filePath}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'AI-Safety-Tribune'
    }
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (data.encoding === 'base64') {
    return Buffer.from(data.content, 'base64').toString('utf-8');
  }

  throw new Error('Unexpected file encoding from GitHub API');
}

export { articleFileSchema };

export async function fetchFileFromGitHub(repoFullName: string, filePath: string): Promise<string> {
  return fetchFileFromGitHubInternal(repoFullName, filePath);
}