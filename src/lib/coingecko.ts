import axios from 'axios';
import { fetchSocialMetrics, calculateStrategyScore, calculateRiskLevel, getRecommendation } from './social-metrics';
import type { CoinData } from '../types';
import type { TimeHorizon } from '../lib/social-metrics';

const BASE_URL = 'https://api.coingecko.com/api/v3';

export interface CoinGeckoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
  image: string;
}

// Use a plain object for caching
const coinCache: Record<string, { data: CoinData[]; timestamp: number }> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Ensure all values are serializable
const sanitizeValue = (value: any): any => {
  if (value === undefined || value === null) return null;
  if (typeof value === 'number' && !Number.isFinite(value)) return 0;
  if (typeof value === 'symbol') return value.toString();
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (typeof value === 'object' && value !== null) {
    const sanitized: Record<string, any> = {};
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        sanitized[key] = sanitizeValue(value[key]);
      }
    }
    return sanitized;
  }
  return value;
};

const fetchCoinsFromAPI = async (page: number, perPage: number): Promise<CoinGeckoData[]> => {
  let retries = 0;
  while (retries < MAX_RETRIES) {
    try {
      const response = await axios.get(`${BASE_URL}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          category: 'meme-token',
          order: 'market_cap_desc',
          per_page: perPage,
          page,
          sparkline: false
        }
      });
      return sanitizeValue(response.data);
    } catch (error) {
      retries++;
      if (retries === MAX_RETRIES) throw error;
      await delay(RETRY_DELAY * retries);
    }
  }
  throw new Error('Failed to fetch data after retries');
};

const processCoin = async (coin: CoinGeckoData): Promise<CoinData | null> => {
  try {
    const timeHorizons: TimeHorizon[] = ['24h', '7d', '30d', '90d'];
    const horizonMetrics = await Promise.all(
      timeHorizons.map(async horizon => {
        const metrics = await fetchSocialMetrics(coin.id, horizon);
        const latest = metrics[metrics.length - 1];
        
        return sanitizeValue({
          horizon,
          socialScore: Math.round(calculateStrategyScore(latest, horizon)),
          riskLevel: calculateRiskLevel(latest, Number(coin.price_change_percentage_24h) || 0, horizon),
          recommendation: getRecommendation(latest, Number(coin.price_change_percentage_24h) || 0, horizon)
        });
      })
    );

    const defaultMetrics = horizonMetrics.find(m => m.horizon === '7d')!;
    const processedCoin: CoinData = sanitizeValue({
      id: String(coin.id),
      name: String(coin.name),
      symbol: String(coin.symbol).toUpperCase(),
      price: Number(coin.current_price) || 0,
      change24h: Number(coin.price_change_percentage_24h) || 0,
      marketCap: Number(coin.market_cap) || 0,
      socialScore: Math.round(defaultMetrics.socialScore),
      riskLevel: defaultMetrics.riskLevel,
      recommendation: defaultMetrics.recommendation,
      strategyConfidence: Math.round(defaultMetrics.socialScore),
      predictions: null,
      image: String(coin.image),
      horizonMetrics
    });

    // Verify the object is serializable
    JSON.stringify(processedCoin);
    return processedCoin;
  } catch (error) {
    console.error(`Error processing coin ${coin.id}:`, error);
    return null;
  }
};

export const fetchMemeCoins = async (page: number = 1, perPage: number = 20): Promise<{ coins: CoinData[]; hasMore: boolean }> => {
  const cacheKey = `memecoins-${page}-${perPage}`;
  const cached = coinCache[cacheKey];
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return { coins: sanitizeValue(cached.data), hasMore: cached.data.length === perPage };
  }

  try {
    const data = await fetchCoinsFromAPI(page, perPage);
    const processedCoins = (await Promise.all(data.map(processCoin))).filter((coin): coin is CoinData => coin !== null);

    // Cache the results
    coinCache[cacheKey] = {
      data: processedCoins,
      timestamp: Date.now()
    };

    return {
      coins: sanitizeValue(processedCoins),
      hasMore: data.length === perPage
    };
  } catch (error) {
    console.error('Error fetching meme coins:', error);
    return { coins: [], hasMore: false };
  }
};

export const fetchAllMemeCoinsForPredictions = async (): Promise<CoinData[]> => {
  const cacheKey = 'all-memecoins-predictions';
  const cached = coinCache[cacheKey];
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return sanitizeValue(cached.data);
  }

  try {
    const data = await fetchCoinsFromAPI(1, 100);
    const processedCoins = (await Promise.all(data.map(processCoin))).filter((coin): coin is CoinData => coin !== null);

    // Cache the results
    coinCache[cacheKey] = {
      data: processedCoins,
      timestamp: Date.now()
    };

    return sanitizeValue(processedCoins);
  } catch (error) {
    console.error('Error fetching all meme coins:', error);
    return [];
  }
};