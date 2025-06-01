import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, ThumbsUp, ThumbsDown, Share, Building, MapPin, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Article } from "@/lib/types";

interface ArticleModalProps {
  article: Article;
  onClose: () => void;
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case "Goal Misgeneralization":
      return "bg-red-100 text-red-800";
    case "Reward Hacking":
      return "bg-yellow-100 text-yellow-800";
    case "Distribution Shift":
      return "bg-purple-100 text-purple-800";
    case "Mesa-Optimization":
      return "bg-blue-100 text-blue-800";
    case "Deceptive Alignment":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
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

export default function ArticleModal({ article, onClose }: ArticleModalProps) {
  const [likes, setLikes] = useState(article.likes);
  const [dislikes, setDislikes] = useState(article.dislikes);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasDisliked, setHasDisliked] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: async (increment: boolean) => {
      const response = await apiRequest('POST', `/api/articles/${article.id}/like`, { increment });
      return response.json();
    },
    onSuccess: (data) => {
      setLikes(data.likes);
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update likes",
        variant: "destructive",
      });
    },
  });

  const dislikeMutation = useMutation({
    mutationFn: async (increment: boolean) => {
      const response = await apiRequest('POST', `/api/articles/${article.id}/dislike`, { increment });
      return response.json();
    },
    onSuccess: (data) => {
      setDislikes(data.dislikes);
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to update dislikes",
        variant: "destructive",
      });
    },
  });

  const handleLike = () => {
    if (hasDisliked) {
      dislikeMutation.mutate(false);
      setHasDisliked(false);
    }
    
    const newLikedState = !hasLiked;
    likeMutation.mutate(newLikedState);
    setHasLiked(newLikedState);
  };

  const handleDislike = () => {
    if (hasLiked) {
      likeMutation.mutate(false);
      setHasLiked(false);
    }
    
    const newDislikedState = !hasDisliked;
    dislikeMutation.mutate(newDislikedState);
    setHasDisliked(newDislikedState);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Article link copied to clipboard",
      });
    }
  };

  // Convert markdown-style content to JSX
  const renderContent = (content: string) => {
    const parts = content.split('\n\n');
    
    return parts.map((part, index) => {
      if (part.startsWith('## ')) {
        return (
          <h2 key={index} className="text-2xl font-semibold text-gray-900 mb-4 mt-6">
            {part.replace('## ', '')}
          </h2>
        );
      } else if (part.startsWith('> ')) {
        const quote = part.replace('> ', '');
        const [text, attribution] = quote.split('\n> — ');
        return (
          <blockquote key={index} className="border-l-4 border-blue-600 pl-4 italic text-gray-600 mb-6">
            {text}
            {attribution && (
              <footer className="text-sm text-gray-500 mt-2">— {attribution}</footer>
            )}
          </blockquote>
        );
      } else {
        return (
          <p key={index} className="text-gray-700 mb-4 leading-relaxed">
            {part}
          </p>
        );
      }
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-card border-2 border-foreground/30">
        <DialogHeader className="sticky top-0 bg-card border-b-2 border-foreground/20 p-8 flex flex-row justify-between items-center">
          <div className="flex items-center space-x-4">
            <Badge className={`${getCategoryColor(article.category)} font-bold text-sm px-4 py-2`}>
              {article.category}
            </Badge>
            <span className="text-sm text-muted-foreground font-semibold">
              {formatTimestamp(article.timestamp)}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-muted">
            <X className="h-6 w-6" />
          </Button>
        </DialogHeader>

        <div className="p-8">
          <h1 className="text-4xl font-bold text-foreground mb-6 leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
            {article.title}
          </h1>

          <div className="flex items-center space-x-6 text-sm text-muted-foreground mb-8 border-b border-foreground/20 pb-4">
            <span className="flex items-center space-x-2">
              <Building className="w-5 h-5" />
              <span className="font-semibold">{article.company}</span>
            </span>
            {article.location && (
              <span className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span className="font-semibold">{article.location}</span>
              </span>
            )}
            <span className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">{article.readTime}</span>
            </span>
          </div>

          <div className="prose max-w-none mb-8 text-foreground text-lg leading-relaxed">
            {renderContent(article.content)}
          </div>

          <Separator className="my-8 border-foreground/30" />

          <div className="flex items-center justify-between bg-muted/50 p-6 rounded border border-foreground/20">
            <div className="flex items-center space-x-6">
              <Button
                variant={hasLiked ? "default" : "outline"}
                size="lg"
                onClick={handleLike}
                disabled={likeMutation.isPending}
                className="flex items-center space-x-2 font-bold"
              >
                <ThumbsUp className="w-5 h-5" />
                <span>{likes}</span>
              </Button>
              <Button
                variant={hasDisliked ? "default" : "outline"}
                size="lg"
                onClick={handleDislike}
                disabled={dislikeMutation.isPending}
                className="flex items-center space-x-2 font-bold"
              >
                <ThumbsDown className="w-5 h-5" />
                <span>{dislikes}</span>
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleShare}
                className="flex items-center space-x-2 font-bold"
              >
                <Share className="w-5 h-5" />
                <span>Share</span>
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              Reported by <span className="font-bold text-foreground">{article.reporter}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
