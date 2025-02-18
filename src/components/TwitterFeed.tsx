import React from 'react';
import { Twitter, ThumbsUp, MessageCircle, Repeat, ExternalLink, TrendingUp, TrendingDown } from 'lucide-react';
import type { NewsItem } from '../lib/news';

interface TwitterFeedProps {
  news: NewsItem[];
  loading: boolean;
  onSelectNews: (news: NewsItem) => void;
}

export const TwitterFeed: React.FC<TwitterFeedProps> = ({ news, loading, onSelectNews }) => {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="text-center p-4">
        <Twitter className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-300">No tweets available at the moment</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {news.map((item) => (
        <div
          key={item.id}
          className="bg-white/5 backdrop-blur-sm rounded-lg p-4 cursor-pointer hover:bg-white/10 transition-colors"
          onClick={() => onSelectNews(item)}
        >
          <div className="flex items-start space-x-3">
            {item.author?.avatar && (
              <img
                src={item.author.avatar}
                alt={item.author.name}
                className="w-12 h-12 rounded-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png';
                }}
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-white">{item.author?.name}</span>
                <span className="text-gray-400 text-sm">@{item.author?.username}</span>
                <span className="text-gray-500 text-sm">·</span>
                <span className="text-gray-400 text-sm">{formatTimeAgo(item.date)}</span>
              </div>
              
              <p className="mt-1 text-white">{item.content}</p>

              <div className="mt-3 flex items-center space-x-6">
                <div className="flex items-center space-x-2 text-gray-400">
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-sm">{formatNumber(item.twitterMetrics?.engagement.likes || 0)}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <Repeat className="w-4 h-4" />
                  <span className="text-sm">{formatNumber(item.twitterMetrics?.engagement.retweets || 0)}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">{formatNumber(item.twitterMetrics?.engagement.replies || 0)}</span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.sentiment === 'positive' ? 'bg-green-500/20 text-green-300' :
                    item.sentiment === 'negative' ? 'bg-red-500/20 text-red-300' :
                    'bg-blue-500/20 text-blue-300'
                  }`}>
                    {item.sentiment === 'positive' ? (
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>Bullish</span>
                      </div>
                    ) : item.sentiment === 'negative' ? (
                      <div className="flex items-center space-x-1">
                        <TrendingDown className="w-3 h-3" />
                        <span>Bearish</span>
                      </div>
                    ) : (
                      <span>Neutral</span>
                    )}
                  </div>
                  {item.twitterMetrics?.followers && (
                    <span className="text-xs text-gray-400">
                      {formatNumber(item.twitterMetrics.followers)} followers
                    </span>
                  )}
                </div>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};