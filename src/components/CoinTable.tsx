import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Download, Clock } from 'lucide-react';
import type { CoinData } from '../types';
import type { TimeHorizon } from '../lib/social-metrics';
import { exportToExcel } from '../lib/excel';

interface CoinTableProps {
  coins: CoinData[];
  onSelectCoin?: (coin: CoinData) => void;
}

export const CoinTable: React.FC<CoinTableProps> = ({ coins, onSelectCoin }) => {
  const [selectedHorizon, setSelectedHorizon] = useState<TimeHorizon>('24h');
  
  const handleExport = () => {
    exportToExcel(coins);
  };

  const getMetricsForHorizon = (coin: CoinData, horizon: TimeHorizon) => {
    const metrics = coin.horizonMetrics?.find(m => m.horizon === horizon);
    if (!metrics) {
      return {
        socialScore: coin.socialScore,
        riskLevel: coin.riskLevel,
        recommendation: coin.recommendation,
        change: coin.change24h
      };
    }

    // Calculate change based on horizon
    let change = coin.change24h;
    switch (horizon) {
      case '7d':
        change = coin.change24h * 3;
        break;
      case '30d':
        change = coin.change24h * 8;
        break;
      case '90d':
        change = coin.change24h * 15;
        break;
    }

    return {
      socialScore: metrics.socialScore,
      riskLevel: metrics.riskLevel,
      recommendation: metrics.recommendation,
      change
    };
  };

  const formatPrice = (price: number) => {
    const priceStr = price.toFixed(12);
    const trimmed = priceStr.replace(/\.?0+$/, '');
    const parts = trimmed.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `$${parts.join('.')}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-300" />
          <select
            value={selectedHorizon}
            onChange={(e) => setSelectedHorizon(e.target.value as TimeHorizon)}
            className="rounded-lg border border-gray-600 bg-gray-800 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="24h">24 Hours</option>
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
            <option value="90d">90 Days</option>
          </select>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </button>
      </div>

      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Coin</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Price</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{selectedHorizon} Change</th>
                <th className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Market Cap</th>
                <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Social Score</th>
                <th className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Risk Level</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Strategy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {coins.map((coin) => {
                const horizonMetrics = getMetricsForHorizon(coin, selectedHorizon);
                return (
                  <tr 
                    key={coin.id}
                    className="hover:bg-gray-700/50 cursor-pointer transition-colors duration-150"
                    onClick={() => onSelectCoin?.(coin)}
                  >
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img 
                          src={coin.image}
                          alt={coin.name}
                          className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 rounded-full"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png';
                            target.onerror = null;
                          }}
                        />
                        <div>
                          <div className="text-sm font-medium text-white">{coin.name}</div>
                          <div className="text-xs sm:text-sm text-gray-400">{coin.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm text-white font-mono">{formatPrice(coin.price)}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center text-xs sm:text-sm ${horizonMetrics.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {horizonMetrics.change >= 0 ? <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> : <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />}
                        {horizonMetrics.change.toFixed(2)}%
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-300">
                      ${coin.marketCap.toLocaleString()}
                    </td>
                    <td className="hidden md:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-700 rounded-full h-1.5 sm:h-2.5">
                        <div 
                          className="bg-indigo-500 h-1.5 sm:h-2.5 rounded-full" 
                          style={{ width: `${horizonMetrics.socialScore}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">{horizonMetrics.socialScore}/100</div>
                    </td>
                    <td className="hidden lg:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${horizonMetrics.riskLevel === 'Low' ? 'bg-green-500/20 text-green-300' : 
                          horizonMetrics.riskLevel === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' : 
                          'bg-red-500/20 text-red-300'}`}>
                        {horizonMetrics.riskLevel}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${horizonMetrics.recommendation === 'Buy' ? 'bg-green-500/20 text-green-300' : 
                            horizonMetrics.recommendation === 'Hold' ? 'bg-blue-500/20 text-blue-300' : 
                            'bg-red-500/20 text-red-300'}`}>
                          {horizonMetrics.recommendation}
                        </span>
                        <span className="text-xs text-gray-400 mt-1 hidden sm:inline">
                          Confidence: {horizonMetrics.socialScore}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};