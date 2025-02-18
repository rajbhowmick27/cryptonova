import { fetchTwitterMetrics } from './twitter';
import type { TwitterMetrics } from './twitter';

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  source: string;
  date: string;
  url: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  urlToImage?: string;
  twitterMetrics?: TwitterMetrics;
  author?: {
    name: string;
    username: string;
    followers: number;
    avatar?: string;
  };
}

// Ensure all data is serializable
const ensureSerializable = (obj: any): any => {
  if (obj === null || obj === undefined) return null;
  if (typeof obj === 'symbol') return obj.toString();
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(ensureSerializable);
  
  const result: Record<string, any> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if (typeof value === 'symbol') {
        result[key] = value.toString();
      } else if (typeof value === 'object' && value !== null) {
        result[key] = ensureSerializable(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
};

const newsCache: Record<string, { data: NewsItem[]; timestamp: number }> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const fetchCryptoNews = async (coinId: string): Promise<NewsItem[]> => {
  const cached = newsCache[coinId];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    // Fetch Twitter metrics
    const twitterMetrics = await fetchTwitterMetrics(coinId);

    // Create Twitter news items from influencer tweets
    const twitterNews = twitterMetrics.influencers.map(influencer => ({
      id: `twitter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: `${influencer.name} on ${coinId.toUpperCase()}`,
      content: influencer.recentTweet.text,
      source: 'Twitter',
      date: influencer.recentTweet.date,
      url: `https://twitter.com/${influencer.username}`,
      urlToImage: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=400&auto=format&fit=crop&q=60',
      sentiment: getSentimentFromEngagement(influencer.recentTweet.engagement),
      twitterMetrics: {
        followers: influencer.followers,
        engagement: influencer.recentTweet.engagement
      },
      author: {
        name: influencer.name,
        username: influencer.username,
        followers: influencer.followers,
        avatar: `https://unavatar.io/twitter/${influencer.username}`
      }
    }));

    // Sort by engagement score
    const sortedNews = twitterNews.sort((a, b) => {
      const aEngagement = calculateEngagementScore(a.twitterMetrics?.engagement);
      const bEngagement = calculateEngagementScore(b.twitterMetrics?.engagement);
      return bEngagement - aEngagement;
    });

    // Ensure all data is serializable before caching
    const serializableNews = ensureSerializable(sortedNews);

    // Cache the results
    newsCache[coinId] = {
      data: serializableNews,
      timestamp: Date.now()
    };

    return serializableNews;
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
};

const calculateEngagementScore = (engagement?: { likes: number; retweets: number; replies: number }): number => {
  if (!engagement) return 0;
  return (
    engagement.likes + 
    (engagement.retweets * 2) + 
    (engagement.replies * 1.5)
  );
};

const getSentimentFromEngagement = (engagement: { likes: number; retweets: number; replies: number }): 'positive' | 'negative' | 'neutral' => {
  const score = calculateEngagementScore(engagement);
  if (score > 1000) return 'positive';
  if (score < 100) return 'negative';
  return 'neutral';
};