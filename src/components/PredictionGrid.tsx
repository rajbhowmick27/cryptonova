import React, { useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, BarChart3, Target, Clock, Filter, Calculator } from 'lucide-react';
import type { CoinData } from '../types';
import { ProfitCalculator } from './ProfitCalculator';

interface PredictionGridProps {
  coins: CoinData[];
}

type RiskLevel = 'All' | 'Low' | 'Medium' | 'High';

export const PredictionGrid: React.FC<PredictionGridProps> = ({ coins }) => {
  const [selectedHorizon, setSelectedHorizon] = useState<'7d' | '30d' | '90d'>('7d');
  const [selectedRisk, setSelectedRisk] = useState<RiskLevel>('All');
  const [selectedCoin, setSelectedCoin] = useState<{
    name: string;
    currentPrice: number;
    predictedPrice: number;
    predictedChange: number;
    riskLevel: 'Low' | 'Medium' | 'High';
  } | null>(null);

  const calculateRiskLevel = (priceChange: number): 'Low' | 'Medium' | 'High' => {
    const absChange = Math.abs(priceChange);
    if (absChange > 80) return 'High';
    if (absChange > 30) return 'Medium';
    return 'Low';
  };

  const calculatePredictedPrice = (coin: CoinData, horizon: '7d' | '30d' | '90d') => {
    const metrics = coin.horizonMetrics?.find(m => m.horizon === horizon);
    
    if (!metrics) return { price: coin.price, change: 0 };

    // Base multipliers for different time horizons
    const horizonMultiplier = {
      '7d': 1,
      '30d': 1.5,
      '90d': 2
    }[horizon];

    // Calculate base growth potential based on social score and market factors
    const socialImpact = (metrics.socialScore - 50) / 100;
    const baseGrowth = (metrics.socialScore / 100) * horizonMultiplier;
    
    // Calculate predicted change percentage
    const predictedChange = baseGrowth * (1 + socialImpact) * 100; // Convert to percentage
    
    // Calculate predicted price
    const predictedPrice = coin.price * (1 + (predictedChange / 100));
    
    return {
      price: predictedPrice,
      change: predictedChange
    };
  };

  const processedCoins = coins.map(coin => {
    const prediction = calculatePredictedPrice(coin, selectedHorizon);
    const riskLevel = calculateRiskLevel(prediction.change);
    return {
      ...coin,
      prediction,
      calculatedRisk: riskLevel
    };
  });

  const filteredCoins = processedCoins.filter(coin => {
    if (selectedRisk === 'All') return true;
    return coin.calculatedRisk === selectedRisk;
  });

  const sortedCoins = [...filteredCoins].sort((a, b) => {
    return b.prediction.change - a.prediction.change;
  });

  const topCoins = sortedCoins.slice(0, 6);

  return (
    <div className="mt-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 space-y-4 sm:space-y-0">
        <h2 className="text-lg font-semibold text-white">Top Meme Coin Predictions</h2>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-300" />
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value as RiskLevel)}
              className="rounded-lg border border-gray-600 bg-gray-800 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Risk Levels</option>
              <option value="Low">Low Risk (0-30%)</option>
              <option value="Medium">Medium Risk (31-80%)</option>
              <option value="High">High Risk (81%+)</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-300" />
            <select
              value={selectedHorizon}
              onChange={(e) => setSelectedHorizon(e.target.value as '7d' | '30d' | '90d')}
              className="rounded-lg border border-gray-600 bg-gray-800 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="7d">Next 7 Days</option>
              <option value="30d">Next 30 Days</option>
              <option value="90d">Next 90 Days</option>
            </select>
          </div>
        </div>
      </div>

      {topCoins.length === 0 ? (
        <div className="bg-yellow-900/50 border border-yellow-700 rounded-lg p-4 text-yellow-200">
          No coins found matching the selected risk level.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topCoins.map((coin) => {
            const metrics = coin.horizonMetrics?.find(m => m.horizon === selectedHorizon);

            return (
              <div key={coin.id} className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={coin.image}
                      alt={coin.name}
                      className="w-10 h-10 rounded-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png';
                        target.onerror = null;
                      }}
                    />
                    <div>
                      <h3 className="font-medium text-white">{coin.name}</h3>
                      <p className="text-sm text-gray-400">{coin.symbol}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    coin.calculatedRisk === 'Low' ? 'bg-green-500/20 text-green-300' :
                    coin.calculatedRisk === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                    {coin.calculatedRisk} Risk
                  </div>
                </div>

                <div className="bg-black/20 rounded-lg p-3">
                  <div className="text-sm text-gray-400 mb-1">Predicted Price</div>
                  <div className="font-mono text-sm text-white">${coin.prediction.price.toFixed(12)}</div>
                  <div className={`flex items-center text-sm ${
                    coin.prediction.change >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {coin.prediction.change >= 0 ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    )}
                    {Math.abs(coin.prediction.change).toFixed(2)}%
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-400">
                      <Target className="w-4 h-4 mr-1" />
                      Social Score
                    </div>
                    <div className="font-medium text-white">{metrics?.socialScore}%</div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-400">
                      <BarChart3 className="w-4 h-4 mr-1" />
                      Strategy Confidence
                    </div>
                    <div className="font-medium text-white">{coin.strategyConfidence}%</div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-400">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      Predicted Growth
                    </div>
                    <div className={`font-medium ${
                      coin.calculatedRisk === 'Low' ? 'text-green-400' :
                      coin.calculatedRisk === 'Medium' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {coin.prediction.change.toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <div className={`p-2 rounded-lg text-center text-sm font-medium ${
                    metrics?.recommendation === 'Buy' ? 'bg-green-500/20 text-green-300' :
                    metrics?.recommendation === 'Hold' ? 'bg-blue-500/20 text-blue-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                    Recommended Action: {metrics?.recommendation}
                  </div>

                  <button
                    onClick={() => setSelectedCoin({
                      name: coin.name,
                      currentPrice: coin.price,
                      predictedPrice: coin.prediction.price,
                      predictedChange: coin.prediction.change,
                      riskLevel: coin.calculatedRisk
                    })}
                    className="flex items-center justify-center space-x-2 w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Calculator className="w-4 h-4" />
                    <span>Calculate Profit</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedCoin && (
        <ProfitCalculator
          coinName={selectedCoin.name}
          currentPrice={selectedCoin.currentPrice}
          predictedPrice={selectedCoin.predictedPrice}
          predictedChange={selectedCoin.predictedChange}
          riskLevel={selectedCoin.riskLevel}
          timeHorizon={selectedHorizon}
          onClose={() => setSelectedCoin(null)}
        />
      )}
    </div>
  );
};