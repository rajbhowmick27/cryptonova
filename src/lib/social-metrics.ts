import { format, subDays } from 'date-fns';

export interface SocialMetrics {
  political: number;
  twitter: number;
  memes: number;
  celebrity: number;
  date: string;
}

export type TimeHorizon = '24h' | '7d' | '30d' | '90d';

// Use a plain object for caching
const metricsCache: Record<string, { data: SocialMetrics[]; timestamp: number }> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Ensure all metrics are serializable numbers
const sanitizeMetric = (value: number): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0;
  }
  return Math.min(100, Math.max(0, Math.round(value * 100) / 100));
};

// Create a serializable metrics object
const createSerializableMetrics = (metrics: SocialMetrics): SocialMetrics => {
  return {
    political: sanitizeMetric(metrics.political),
    twitter: sanitizeMetric(metrics.twitter),
    memes: sanitizeMetric(metrics.memes),
    celebrity: sanitizeMetric(metrics.celebrity),
    date: String(metrics.date)
  };
};

const generateMetric = (baseValue: number, day: number, volatility: number, horizon: TimeHorizon): number => {
  const horizonMultiplier = {
    '24h': 1.5,
    '7d': 1.2,
    '30d': 0.8,
    '90d': 0.5
  }[horizon];

  const adjustedVolatility = volatility * horizonMultiplier;
  const trendPeriod = {
    '24h': 1,
    '7d': 7,
    '30d': 30,
    '90d': 90
  }[horizon];

  const trend = Math.sin(day / trendPeriod * Math.PI) * (10 / Math.sqrt(trendPeriod));
  const noise = (Math.random() - 0.5) * adjustedVolatility;
  
  return sanitizeMetric(baseValue + trend + noise);
};

export const fetchSocialMetrics = async (coin: string, horizon: TimeHorizon = '7d'): Promise<SocialMetrics[]> => {
  const days = {
    '24h': 1,
    '7d': 7,
    '30d': 30,
    '90d': 90
  }[horizon];

  const cacheKey = `${coin}-${horizon}`;
  const cached = metricsCache[cacheKey];
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data.map(createSerializableMetrics);
  }

  const baseValues = {
    political: sanitizeMetric(65),
    twitter: sanitizeMetric(75),
    memes: sanitizeMetric(70),
    celebrity: sanitizeMetric(60)
  };

  const metrics: SocialMetrics[] = [];

  for (let i = days; i >= 0; i--) {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
    const metric: SocialMetrics = {
      date,
      political: generateMetric(baseValues.political, i, 10, horizon),
      twitter: generateMetric(baseValues.twitter, i, 15, horizon),
      memes: generateMetric(baseValues.memes, i, 20, horizon),
      celebrity: generateMetric(baseValues.celebrity, i, 12, horizon)
    };
    metrics.push(createSerializableMetrics(metric));
  }

  metricsCache[cacheKey] = {
    data: metrics,
    timestamp: Date.now()
  };

  return metrics;
};

export const calculateStrategyScore = (metrics: SocialMetrics, horizon: TimeHorizon = '7d'): number => {
  if (!metrics) return 50;

  const weights = {
    '24h': { political: 0.1, twitter: 0.4, memes: 0.4, celebrity: 0.1 },
    '7d': { political: 0.2, twitter: 0.3, memes: 0.3, celebrity: 0.2 },
    '30d': { political: 0.3, twitter: 0.25, memes: 0.25, celebrity: 0.2 },
    '90d': { political: 0.4, twitter: 0.2, memes: 0.2, celebrity: 0.2 }
  }[horizon];

  const score = sanitizeMetric(
    metrics.political * weights.political +
    metrics.twitter * weights.twitter +
    metrics.memes * weights.memes +
    metrics.celebrity * weights.celebrity
  );

  return Math.round(score);
};

export const calculateRiskLevel = (
  metrics: SocialMetrics,
  priceChange: number,
  horizon: TimeHorizon
): 'Low' | 'Medium' | 'High' => {
  const thresholds = {
    '24h': { high: 80, medium: 30 },
    '7d': { high: 80, medium: 30 },
    '30d': { high: 80, medium: 30 },
    '90d': { high: 80, medium: 30 }
  }[horizon];

  const volatility = Math.abs(sanitizeMetric(priceChange));
  const socialVolatility = calculateSocialVolatility(metrics);

  if (volatility > thresholds.high || socialVolatility > 80) return 'High';
  if (volatility > thresholds.medium || socialVolatility > 30) return 'Medium';
  return 'Low';
};

const calculateSocialVolatility = (metrics: SocialMetrics): number => {
  const values = [
    metrics.political,
    metrics.twitter,
    metrics.memes,
    metrics.celebrity
  ].map(sanitizeMetric);
  
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  
  return Math.round(Math.sqrt(variance));
};

export const getRecommendation = (
  metrics: SocialMetrics,
  priceChange: number,
  horizon: TimeHorizon
): 'Buy' | 'Hold' | 'Sell' => {
  const strategyScore = calculateStrategyScore(metrics, horizon);
  const riskLevel = calculateRiskLevel(metrics, priceChange, horizon);

  const thresholds = {
    '24h': { buy: 75, sell: 35 },
    '7d': { buy: 80, sell: 40 },
    '30d': { buy: 85, sell: 45 },
    '90d': { buy: 90, sell: 50 }
  }[horizon];

  if (strategyScore > thresholds.buy && riskLevel !== 'High') return 'Buy';
  if (strategyScore < thresholds.sell || riskLevel === 'High') return 'Sell';
  return 'Hold';
};