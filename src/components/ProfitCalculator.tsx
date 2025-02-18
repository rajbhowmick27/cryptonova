import React, { useState, useEffect } from 'react';
import { DollarSign, Calculator, AlertTriangle, TrendingUp, Wallet, Calendar } from 'lucide-react';

interface ProfitCalculatorProps {
  coinName: string;
  currentPrice: number;
  predictedPrice: number;
  predictedChange: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  timeHorizon: '7d' | '30d' | '90d';
  onClose: () => void;
}

export const ProfitCalculator: React.FC<ProfitCalculatorProps> = ({
  coinName,
  currentPrice,
  predictedPrice,
  predictedChange,
  riskLevel,
  timeHorizon,
  onClose
}) => {
  const [investment, setInvestment] = useState<string>('100');
  const [showRiskWarning, setShowRiskWarning] = useState(false);
  const [customPeriod, setCustomPeriod] = useState<string>('');
  const [useCustomPeriod, setUseCustomPeriod] = useState(false);

  const timeHorizonText = useCustomPeriod 
    ? `${customPeriod} days`
    : {
        '7d': '7 days',
        '30d': '30 days',
        '90d': '90 days'
      }[timeHorizon];

  const timeHorizonDays = useCustomPeriod 
    ? parseInt(customPeriod) 
    : {
        '7d': 7,
        '30d': 30,
        '90d': 90
      }[timeHorizon];

  useEffect(() => {
    // Show risk warning for high-risk investments over $1000
    setShowRiskWarning(
      riskLevel === 'High' && parseFloat(investment) > 1000
    );
  }, [investment, riskLevel]);

  const calculatePotentialProfit = () => {
    const investmentAmount = parseFloat(investment) || 0;
    const numberOfCoins = investmentAmount / currentPrice;
    
    // Adjust predicted price based on custom period
    const standardPeriodDays = {
      '7d': 7,
      '30d': 30,
      '90d': 90
    }[timeHorizon];

    const periodAdjustment = useCustomPeriod 
      ? timeHorizonDays / standardPeriodDays
      : 1;

    const adjustedPredictedPrice = currentPrice + ((predictedPrice - currentPrice) * periodAdjustment);
    const futureValue = numberOfCoins * adjustedPredictedPrice;
    const profit = futureValue - investmentAmount;
    
    return {
      coins: numberOfCoins,
      futureValue,
      profit,
      roi: (profit / investmentAmount) * 100
    };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const handleCustomPeriodChange = (value: string) => {
    const period = parseInt(value);
    if (!isNaN(period) && period > 0) {
      setCustomPeriod(value);
      setUseCustomPeriod(true);
    } else if (value === '') {
      setCustomPeriod('');
      setUseCustomPeriod(false);
    }
  };

  const results = calculatePotentialProfit();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Profit Calculator</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            {/* Investment Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investment Amount (USD)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  value={investment}
                  onChange={(e) => setInvestment(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter amount"
                  min="0"
                />
              </div>
            </div>

            {/* Custom Period Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Investment Period (Days)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  value={customPeriod}
                  onChange={(e) => handleCustomPeriodChange(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={`Default: ${timeHorizonText}`}
                  min="1"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Leave empty to use the default period ({timeHorizonText})
              </p>
            </div>

            {/* Investment Details */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Current Price:</span>
                <span className="font-medium">{formatCurrency(currentPrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Predicted Price:</span>
                <span className="font-medium">{formatCurrency(predictedPrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Time Horizon:</span>
                <span className="font-medium">{timeHorizonText}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Risk Level:</span>
                <span className={`font-medium ${
                  riskLevel === 'Low' ? 'text-green-600' :
                  riskLevel === 'Medium' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>{riskLevel}</span>
              </div>
            </div>

            {/* Profit Projection */}
            <div className="bg-indigo-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-indigo-900 mb-3">Projected Returns</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-indigo-700">Coins You'll Get:</span>
                  <span className="font-medium">{results.coins.toFixed(8)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-indigo-700">Future Value:</span>
                  <span className="font-medium">{formatCurrency(results.futureValue)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-indigo-700">Potential Profit:</span>
                  <span className={`font-medium ${results.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(results.profit)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-indigo-700">ROI:</span>
                  <span className={`font-medium ${results.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {results.roi.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Risk Warning */}
            {showRiskWarning && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800">High Risk Investment Warning</h4>
                    <p className="mt-1 text-sm text-red-700">
                      This is a high-risk investment. Consider reducing your investment amount or choosing a lower-risk option.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="text-xs text-gray-500">
              <p>
                Disclaimer: These projections are based on historical data and market analysis. 
                Cryptocurrency investments are highly volatile and past performance does not guarantee future results. 
                Always conduct your own research and never invest more than you can afford to lose.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};