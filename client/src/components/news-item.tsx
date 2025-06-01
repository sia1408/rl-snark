import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, MessageSquare, Building } from "lucide-react";
import type { Article } from "@/lib/types";

interface NewsItemProps {
  article: Article;
  onClick: () => void;
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case "Goal Misgeneralization":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    case "Reward Hacking":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    case "Distribution Shift":
      return "bg-purple-100 text-purple-800 hover:bg-purple-200";
    case "Mesa-Optimization":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    case "Deceptive Alignment":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};

const getSeverityLabel = (severity: string) => {
  switch (severity) {
    case "critical":
      return "🚨 Critical";
    case "concerning":
      return "⚠️ Concerning";
    case "monitoring":
      return "📊 Monitoring";
    default:
      return "ℹ️ Info";
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical":
      return "text-red-600";
    case "concerning":
      return "text-amber-500";
    case "monitoring":
      return "text-gray-600";
    default:
      return "text-blue-600";
  }
};

const formatTimestamp = (timestamp: Date) => {
  const now = new Date();
  const diff = now.getTime() - new Date(timestamp).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  return new Date(timestamp).toLocaleDateString();
};

export default function NewsItem({ article, onClick }: NewsItemProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-foreground/20 bg-card" onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4 border-b border-foreground/20 pb-3">
          <div className="flex items-center space-x-3">
            <Badge className={`${getCategoryColor(article.category)} font-semibold text-xs px-3 py-1`}>
              {article.category}
            </Badge>
            <span className="text-xs text-muted-foreground font-medium">
              {formatTimestamp(article.timestamp)}
            </span>
          </div>
          <span className={`text-sm font-bold ${getSeverityColor(article.severity)} border border-current px-2 py-1 rounded`}>
            {getSeverityLabel(article.severity)}
          </span>
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-3 hover:text-primary transition-colors leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
          {article.title}
        </h2>

        <p className="text-foreground/80 mb-5 line-clamp-3 text-lg leading-relaxed">
          {article.excerpt}
        </p>

        <div className="flex items-center justify-between border-t border-foreground/20 pt-4">
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <span className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span className="font-semibold">{article.views.toLocaleString()}</span>
            </span>
            <span className="flex items-center space-x-1">
              <MessageSquare className="w-4 h-4" />
              <span className="font-semibold">{article.comments}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Building className="w-4 h-4" />
              <span className="font-semibold">{article.company}</span>
            </span>
          </div>
          <Button 
            variant="ghost" 
            className="text-primary hover:text-primary/80 p-0 h-auto font-bold text-sm border-b-2 border-transparent hover:border-primary"
          >
            READ FULL REPORT →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
