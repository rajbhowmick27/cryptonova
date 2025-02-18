import type { TimeHorizon } from './lib/social-metrics';

export interface CoinData {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  marketCap: number;
  socialScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  recommendation: 'Buy' | 'Hold' | 'Sell';
  strategyConfidence: number;
  predictions: {
    tenDays: PredictionData;
    thirtyDays: PredictionData;
    threeMonths: PredictionData;
  } | null;
  image: string;
  horizonMetrics?: Array<{
    horizon: TimeHorizon;
    socialScore: number;
    riskLevel: 'Low' | 'Medium' | 'High';
    recommendation: 'Buy' | 'Hold' | 'Sell';
  }>;
}

export interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  icon: React.ComponentType;
}