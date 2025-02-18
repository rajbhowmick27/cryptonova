import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Twitter, 
  Users, 
  BarChart3, 
  Star, 
  Globe, 
  MessageCircle,
  Activity,
  DollarSign,
  Share2,
  ThumbsUp,
  Repeat,
  MessageSquare
} from 'lucide-react';
import type { NewsItem } from '../lib/news';

interface NewsDetailProps {
  news: NewsItem;
  coinMetrics: {
    socialMetrics: {
      twitter: {
        mentions: number;
        sentiment: number;
        trending: boolean;
      };
      reddit: {
        mentions: number;
        sentiment: number;
        trending: boolean;
      };
      telegram: {
        mentions: number;
        sentiment: number;
        trending: boolean;
      };
    };
    celebrityInfluence: {
      recent: {
        name: string;
        platform: string;
        reach: number;
        sentiment: number;
        date: string;
      }[];
      impact: number;
    };
    marketMetrics: {
      volume24h: number;
      volumeChange: number;
      correlation: {
        btc: number;
        eth: number;
      };
      volatility: number;
    };
    memeMetrics: {
      viralScore: number;
      platforms: {
        name: string;
        score: number;
        trending: boolean;
      }[];
      sentiment: number;
    };
  };
  onClose: () => void;
}

export const NewsDetail: React.FC<NewsDetailProps> = ({ news, coinMetrics, onClose }) => {
  const formatNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(2);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="relative">
        <img 
          src={news.urlToImage || 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&auto=format&fit=crop&q=60'} 
          alt={news.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-2">
              {news.source === 'Twitter' && (
                <Twitter className="w-5 h-5 text-blue-400" />
              )}
              <span className="text-white text-sm">{news.source}</span>
            </div>
            <h2 className="text-white text-2xl font-bold">{news.title}</h2>
            <p className="text-gray-200 mt-2">{new Date(news.date).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="prose max-w-none">
          <p className="text-gray-700">{news.content}</p>
        </div>

        {/* Twitter Metrics */}
        {news.source === 'Twitter' && news.twitterMetrics && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-blue-600">
              <Twitter className="w-5 h-5 mr-2" />
              Twitter Engagement
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center text-blue-500 mb-1">
                  <ThumbsUp className="w-4 h-4 mr-1" />
                </div>
                <p className="text-sm text-gray-600">Likes</p>
                <p className="text-lg font-semibold text-blue-600">
                  {formatNumber(news.twitterMetrics.engagement.likes)}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center text-blue-500 mb-1">
                  <Repeat className="w-4 h-4 mr-1" />
                </div>
                <p className="text-sm text-gray-600">Retweets</p>
                <p className="text-lg font-semibold text-blue-600">
                  {formatNumber(news.twitterMetrics.engagement.retweets)}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center text-blue-500 mb-1">
                  <MessageSquare className="w-4 h-4 mr-1" />
                </div>
                <p className="text-sm text-gray-600">Replies</p>
                <p className="text-lg font-semibold text-blue-600">
                  {formatNumber(news.twitterMetrics.engagement.replies)}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-blue-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Follower Reach</span>
                <span className="font-semibold text-blue-600">
                  {formatNumber(news.twitterMetrics.followers)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Market Impact Analysis */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-green-500" />
            Market Impact Analysis
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">Sentiment</p>
              <p className={`text-xl font-bold ${
                news.sentiment === 'positive' ? 'text-green-600' : 
                news.sentiment === 'negative' ? 'text-red-600' : 
                'text-gray-600'
              }`}>
                {news.sentiment === 'positive' ? '+' : news.sentiment === 'negative' ? '-' : ''}
                {coinMetrics.socialMetrics.twitter.sentiment}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Volume Impact</p>
              <p className={`text-xl font-bold ${
                coinMetrics.marketMetrics.volumeChange > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {coinMetrics.marketMetrics.volumeChange > 0 ? '+' : ''}
                {coinMetrics.marketMetrics.volumeChange.toFixed(1)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Social Score</p>
              <p className="text-xl font-bold text-blue-600">
                {coinMetrics.socialMetrics.twitter.sentiment}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};