import type { CoinData } from '../types';

export interface PredictionData {
  period: string;
  predictedGain: number;
  confidence: number;
  factors: {
    technical: number;
    social: number;
    fundamental: number;
  };
  supportingData: {
    historicalTrend: number;
    socialSentiment: number;
    marketCorrelation: number;
    volatilityIndex: number;
  };
}

export interface CoinPredictions {
  tenDays: PredictionData;
  thirtyDays: PredictionData;
  threeMonths: PredictionData;
}

const calculateConfidence = (factors: number[]): number => {
  return Math.round(factors.reduce((a, b) => a + b, 0) / factors.length);
};

const calculatePredictedGain = (
  historicalChange: number,
  socialScore: number,
  marketCap: number,
  volatility: number
): number => {
  const baseGain = historicalChange * (1 + (socialScore / 100));
  const marketCapFactor = Math.log10(marketCap) / 10;
  const volatilityFactor = volatility / 100;
  
  return Math.round(baseGain * (1 + marketCapFactor) * (1 + volatilityFactor));
};

export const generatePredictions = (coin: CoinData): CoinPredictions => {
  // Simulate different time period factors
  const periods = {
    tenDays: { volatility: 0.8, confidence: 1.2 },
    thirtyDays: { volatility: 1, confidence: 1 },
    threeMonths: { volatility: 1.2, confidence: 0.8 }
  };

  const basePrediction = {
    historicalTrend: coin.change24h,
    socialSentiment: coin.socialScore,
    marketCorrelation: 0.75 + (Math.random() * 0.2),
    volatilityIndex: 30 + (Math.random() * 40)
  };

  const generatePeriodPrediction = (periodFactors: typeof periods.tenDays): PredictionData => {
    const technical = Math.round(50 + (Math.random() * 30));
    const social = Math.round(coin.socialScore * periodFactors.confidence);
    const fundamental = Math.round(40 + (Math.random() * 40));

    const predictedGain = calculatePredictedGain(
      basePrediction.historicalTrend,
      social,
      coin.marketCap,
      basePrediction.volatilityIndex * periodFactors.volatility
    );

    return {
      period: '',
      predictedGain,
      confidence: calculateConfidence([technical, social, fundamental]),
      factors: {
        technical,
        social,
        fundamental
      },
      supportingData: {
        historicalTrend: basePrediction.historicalTrend,
        socialSentiment: social,
        marketCorrelation: basePrediction.marketCorrelation,
        volatilityIndex: Math.round(basePrediction.volatilityIndex * periodFactors.volatility)
      }
    };
  };

  return {
    tenDays: generatePeriodPrediction(periods.tenDays),
    thirtyDays: generatePeriodPrediction(periods.thirtyDays),
    threeMonths: generatePeriodPrediction(periods.threeMonths)
  };
};