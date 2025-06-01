import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import NewsFeed from "@/components/news-feed";
import SidebarFilters from "@/components/sidebar-filters";
import ArticleModal from "@/components/article-modal";
import { Button } from "@/components/ui/button";
import { Bot, Menu } from "lucide-react";
import type { Article, Stats, Filters } from "@/lib/types";

export default function Home() {
  const [filters, setFilters] = useState<Filters>({
    search: "",
    categories: ["Goal Misgeneralization", "Reward Hacking", "Distribution Shift"],
    severity: "all",
  });
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [offset, setOffset] = useState(0);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const limit = 5;

  const { data: articles = [], isLoading: articlesLoading, refetch: refetchArticles } = useQuery({
    queryKey: ['/api/articles', filters, offset],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.categories.length > 0) params.append('categories', filters.categories.join(','));
      if (filters.severity !== 'all') params.append('severity', filters.severity);
      params.append('limit', limit.toString());
      params.append('offset', offset.toString());

      const response = await fetch(`/api/articles?${params}`);
      if (!response.ok) throw new Error('Failed to fetch articles');
      const data = await response.json();
      
      if (offset === 0) {
        setAllArticles(data);
      } else {
        setAllArticles(prev => [...prev, ...data]);
      }
      
      return data;
    },
  });

  const { data: stats } = useQuery<Stats>({
    queryKey: ['/api/stats'],
  });

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters);
    setOffset(0);
    setAllArticles([]);
  };

  const handleLoadMore = () => {
    setOffset(prev => prev + limit);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b-2 border-foreground sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 border-b border-foreground/20">
            <div className="flex items-center space-x-4">
              <Bot className="h-10 w-10 text-accent" />
              <div>
                <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'Playfair Display, serif' }}>
                  The AI Safety Tribune
                </h1>
                <p className="text-sm text-muted-foreground italic">
                  "All the Digital Darwin Awards That's Fit to Print"
                </p>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-foreground hover:text-primary transition-colors font-semibold border-b-2 border-transparent hover:border-primary pb-1">Latest Incidents</a>
              <a href="#" className="text-foreground hover:text-primary transition-colors font-semibold border-b-2 border-transparent hover:border-primary pb-1">Categories</a>
              <a href="#" className="text-foreground hover:text-primary transition-colors font-semibold border-b-2 border-transparent hover:border-primary pb-1">Analysis</a>
              <a href="#" className="text-foreground hover:text-primary transition-colors font-semibold border-b-2 border-transparent hover:border-primary pb-1">Submit Report</a>
            </nav>

            <Button 
              variant="ghost" 
              size="sm"
              className="md:hidden"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="bg-foreground text-background py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-sm">
            <span className="font-semibold">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
            <span className="italic">
              Vol. 1, No. 42 • Established 2024
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className={`lg:col-span-1 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
            <SidebarFilters 
              filters={filters}
              onFiltersChange={handleFiltersChange}
              stats={stats}
            />
          </aside>

          <main className="lg:col-span-3">
            <NewsFeed 
              articles={allArticles}
              stats={stats}
              isLoading={articlesLoading}
              onArticleClick={setSelectedArticle}
              onLoadMore={handleLoadMore}
              hasMore={articles.length === limit}
            />
          </main>
        </div>
      </div>

      {selectedArticle && (
        <ArticleModal 
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </div>
  );
}