import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import NewsItem from "./news-item";
import type { Article, Stats } from "@/lib/types";

interface NewsFeedProps {
  articles: Article[];
  stats?: Stats;
  isLoading: boolean;
  onArticleClick: (article: Article) => void;
  onLoadMore: () => void;
  hasMore: boolean;
}

export default function NewsFeed({ 
  articles, 
  stats, 
  isLoading, 
  onArticleClick, 
  onLoadMore, 
  hasMore 
}: NewsFeedProps) {
  if (isLoading && articles.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center">
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                  <Skeleton className="h-4 w-24 mx-auto" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex items-center justify-between">
                  <div className="flex space-x-4">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {stats && (
        <Card className="border-2 border-foreground/30 bg-card shadow-lg">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center border-b-2 border-foreground/20 pb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Current Investigation Status
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center border-r border-foreground/20 last:border-r-0">
                <div className="text-4xl font-bold text-foreground mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {stats.totalIncidents}
                </div>
                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Total Cases</div>
              </div>
              <div className="text-center border-r border-foreground/20 last:border-r-0">
                <div className="text-4xl font-bold text-amber-600 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {stats.activeThisWeek}
                </div>
                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">This Week</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-red-600 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {stats.criticalLevel}
                </div>
                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Breaking News</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {articles.length === 0 && !isLoading ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">
              No articles found matching your criteria. Try adjusting your filters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {articles.map((article) => (
            <NewsItem 
              key={article.id}
              article={article}
              onClick={() => onArticleClick(article)}
            />
          ))}
        </div>
      )}

      {hasMore && articles.length > 0 && (
        <div className="text-center border-t-2 border-foreground/20 pt-8">
          <Button 
            onClick={onLoadMore}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-bold tracking-wide border-2 border-primary"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            {isLoading ? "INVESTIGATING..." : "LOAD MORE REPORTS"}
          </Button>
        </div>
      )}
    </div>
  );
}
