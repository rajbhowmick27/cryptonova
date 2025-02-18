import React from 'react';
import { 
  TrendingUp, 
  Calendar, 
  AlertTriangle,
  BarChart4,
  ArrowRight,
  Target,
  Sparkles
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface PredictionData {
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

interface FuturePredictionsProps {
  coinId: string;
  predictions: {
    tenDays: PredictionData;
    thirtyDays: PredictionData;
    threeMonths: PredictionData;
  };
}

const PredictionCard: React.FC<{ data: PredictionData; period: string }> = ({ data, period }) => {
  const chartData = Array.from({ length: 10 }, (_, i) => ({
    day: i + 1,
    value: data.supportingData.historicalTrend * (1 + (Math.random() * 0.2 - 0.1))
  }));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{period}</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          data.confidence >= 70 ? 'bg-green-100 text-green-800' :
          data.confidence >= 50 ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {data.confidence}% Confidence
        </div>
      </div>

      <div className="flex items-center space-x-2 mb-6">
        <TrendingUp className={`w-5 h-5 ${
          data.predictedGain >= 0 ? 'text-green-500' : 'text-red-500'
        }`} />
        <span className="text-2xl font-bold">
          {data.predictedGain >= 0 ? '+' : ''}{data.predictedGain}%
        </span>
      </div>

      <div className="h-32 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`gradient-${period}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="day" stroke="#6B7280" />
            <YAxis stroke="#6B7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '0.5rem',
                color: '#fff'
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#4F46E5"
              fill={`url(#gradient-${period})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Technical Analysis</span>
          <div className="w-32 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full" 
              style={{ width: `${data.factors.technical}%` }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Social Sentiment</span>
          <div className="w-32 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full" 
              style={{ width: `${data.factors.social}%` }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Fundamentals</span>
          <div className="w-32 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full" 
              style={{ width: `${data.factors.fundamental}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Key Indicators</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center space-x-1">
            <Target className="w-4 h-4 text-blue-500" />
            <span>Trend: {data.supportingData.historicalTrend}%</span>
          </div>
          <div className="flex items-center space-x-1">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>Sentiment: {data.supportingData.socialSentiment}%</span>
          </div>
          <div className="flex items-center space-x-1">
            <BarChart4 className="w-4 h-4 text-green-500" />
            <span>Correlation: {data.supportingData.marketCorrelation}</span>
          </div>
          <div className="flex items-center space-x-1">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <span>Volatility: {data.supportingData.volatilityIndex}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const FuturePredictions: React.FC<FuturePredictionsProps> = ({ predictions }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Future Price Predictions</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>Updated {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PredictionCard data={predictions.tenDays} period="Next 10 Days" />
        <PredictionCard data={predictions.thirtyDays} period="Next 30 Days" />
        <PredictionCard data={predictions.threeMonths} period="Next 3 Months" />
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800">Disclaimer</h4>
            <p className="mt-1 text-sm text-yellow-700">
              These predictions are based on historical data, social sentiment, and market analysis. 
              Cryptocurrency markets are highly volatile and past performance does not guarantee future results. 
              Always conduct your own research before making investment decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};