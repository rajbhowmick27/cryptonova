import axios from 'axios';

const TWITTER_BEARER_TOKEN = import.meta.env.VITE_TWITTER_BEARER_TOKEN;

export interface TwitterMetrics {
  tweetCount: number;
  sentiment: number;
  influencers: Array<{
    name: string;
    username: string;
    followers: number;
    recentTweet: {
      text: string;
      date: string;
      engagement: {
        likes: number;
        retweets: number;
        replies: number;
      };
    };
  }>;
  trending: boolean;
  engagement: {
    total: number;
    likes: number;
    retweets: number;
    replies: number;
  };
}

// Cache implementation
const twitterCache: Record<string, { data: TwitterMetrics; timestamp: number }> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequests: 450, // Twitter's standard rate limit
  windowMs: 15 * 60 * 1000, // 15 minutes
  requests: [] as number[]
};

const isRateLimited = (): boolean => {
  const now = Date.now();
  // Remove expired timestamps
  RATE_LIMIT.requests = RATE_LIMIT.requests.filter(timestamp => 
    now - timestamp < RATE_LIMIT.windowMs
  );
  return RATE_LIMIT.requests.length >= RATE_LIMIT.maxRequests;
};

const trackRequest = () => {
  RATE_LIMIT.requests.push(Date.now());
};

const fetchTwitterData = async (coinSymbol: string): Promise<TwitterMetrics> => {
  if (!TWITTER_BEARER_TOKEN) {
    console.warn('Twitter Bearer Token not found, using mock data');
    return generateMockData(coinSymbol);
  }

  if (isRateLimited()) {
    console.warn('Rate limit reached, using mock data');
    return generateMockData(coinSymbol);
  }

  try {
    const searchQuery = encodeURIComponent(`${coinSymbol} crypto OR ${coinSymbol} token lang:en -is:retweet -is:reply`);
    
    trackRequest();
    
    const response = await axios.get(`/twitter-api/tweets/search/recent`, {
      params: {
        'query': searchQuery,
        'tweet.fields': 'public_metrics,created_at,author_id',
        'user.fields': 'public_metrics,username,name,profile_image_url',
        'expansions': 'author_id',
        'max_results': 100
      },
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000,
      validateStatus: (status) => status === 200
    });

    if (!response.data || !response.data.data || !response.data.includes?.users) {
      console.warn('Invalid response format from Twitter API');
      return generateMockData(coinSymbol);
    }

    const { data, includes, meta } = response.data;
    const users = includes.users;
    const userMap = new Map(users.map((user: any) => [user.id, user]));

    const processedTweets = data
      .map((tweet: any) => {
        const author = userMap.get(tweet.author_id);
        if (!author) return null;

        return {
          id: tweet.id,
          text: tweet.text,
          date: tweet.created_at,
          author: {
            name: author.name,
            username: author.username,
            followers: author.public_metrics?.followers_count || 0,
            profileImageUrl: author.profile_image_url
          },
          metrics: {
            likes: tweet.public_metrics?.like_count || 0,
            retweets: tweet.public_metrics?.retweet_count || 0,
            replies: tweet.public_metrics?.reply_count || 0
          }
        };
      })
      .filter(Boolean);

    if (processedTweets.length === 0) {
      return generateMockData(coinSymbol);
    }

    // Sort by engagement
    processedTweets.sort((a, b) => {
      const aEngagement = a.metrics.likes + a.metrics.retweets * 2 + a.metrics.replies * 1.5;
      const bEngagement = b.metrics.likes + b.metrics.retweets * 2 + b.metrics.replies * 1.5;
      return bEngagement - aEngagement;
    });

    const totalEngagement = processedTweets.reduce((sum, tweet) => 
      sum + tweet.metrics.likes + tweet.metrics.retweets + tweet.metrics.replies, 0
    );

    return {
      tweetCount: meta?.result_count || processedTweets.length,
      sentiment: calculateSentiment(processedTweets),
      influencers: processedTweets.slice(0, 5).map(tweet => ({
        name: tweet.author.name,
        username: tweet.author.username,
        followers: tweet.author.followers,
        recentTweet: {
          text: tweet.text,
          date: tweet.date,
          engagement: tweet.metrics
        }
      })),
      trending: totalEngagement > 1000,
      engagement: {
        total: totalEngagement,
        likes: processedTweets.reduce((sum, tweet) => sum + tweet.metrics.likes, 0),
        retweets: processedTweets.reduce((sum, tweet) => sum + tweet.metrics.retweets, 0),
        replies: processedTweets.reduce((sum, tweet) => sum + tweet.metrics.replies, 0)
      }
    };
  } catch (error: any) {
    console.error('Twitter API error:', error.message);
    
    if (error.response?.status === 401) {
      console.error('Invalid Twitter Bearer Token');
    } else if (error.response?.status === 429) {
      console.error('Rate limit exceeded');
    }
    
    return generateMockData(coinSymbol);
  }
};

const calculateSentiment = (tweets: any[]): number => {
  if (tweets.length === 0) return 50;

  const weights = {
    likes: 0.4,
    retweets: 0.4,
    followers: 0.2
  };

  const score = tweets.reduce((sum, tweet) => {
    const likeScore = Math.min(100, (tweet.metrics.likes / 1000) * 100);
    const retweetScore = Math.min(100, (tweet.metrics.retweets / 500) * 100);
    const followerScore = Math.min(100, (tweet.author.followers / 100000) * 100);

    return sum + (
      likeScore * weights.likes +
      retweetScore * weights.retweets +
      followerScore * weights.followers
    );
  }, 0) / tweets.length;

  return Math.round(score);
};

const generateMockData = (coinSymbol: string): TwitterMetrics => {
  const mockInfluencers = [
    {
      name: 'Crypto Analyst',
      username: 'cryptoanalyst',
      followers: 125000,
      recentTweet: {
        text: `${coinSymbol} showing strong momentum with increasing social engagement. Watch this space! 🚀`,
        date: new Date().toISOString(),
        engagement: { likes: 1200, retweets: 300, replies: 150 }
      }
    },
    {
      name: 'Meme Coin Tracker',
      username: 'memecointracker',
      followers: 85000,
      recentTweet: {
        text: `Breaking: ${coinSymbol} community growing rapidly. New developments coming soon! 📈`,
        date: new Date().toISOString(),
        engagement: { likes: 800, retweets: 200, replies: 100 }
      }
    }
  ];

  return {
    tweetCount: 75,
    sentiment: 65,
    influencers: mockInfluencers,
    trending: true,
    engagement: {
      total: 5000,
      likes: 3000,
      retweets: 1500,
      replies: 500
    }
  };
};

export const fetchTwitterMetrics = async (coinSymbol: string): Promise<TwitterMetrics> => {
  const cacheKey = coinSymbol.toLowerCase();
  const cached = twitterCache[cacheKey];

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const metrics = await fetchTwitterData(coinSymbol);
    
    twitterCache[cacheKey] = {
      data: metrics,
      timestamp: Date.now()
    };
    
    return metrics;
  } catch (error) {
    console.error('Error in fetchTwitterMetrics:', error);
    return generateMockData(coinSymbol);
  }
};