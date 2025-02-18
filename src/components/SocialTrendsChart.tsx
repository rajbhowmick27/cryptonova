import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
  Bar,
  Scatter
} from 'recharts';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { ChevronLeft, ChevronRight, X, Info, Maximize2, Minimize2, Filter } from 'lucide-react';
import { NewsDetail } from './NewsDetail';
import { TwitterFeed } from './TwitterFeed';
import type { NewsItem } from '../lib/news';
import type { SocialMetrics } from '../lib/social-metrics';

interface SocialTrendsChartProps {
  data: SocialMetrics[];
  selectedCoin?: string | null;
  news: NewsItem[];
  loading: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 p-3 rounded-lg shadow-lg">
        <p className="text-gray-300 text-sm mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-300 text-sm">
              {entry.name}: {entry.value.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const SocialTrendsChart: React.FC<SocialTrendsChartProps> = ({ 
  data, 
  selectedCoin,
  news,
  loading
}) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [expandedChart, setExpandedChart] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['political', 'twitter', 'memes', 'celebrity']);
  const [chartType, setChartType] = useState<'area' | 'line' | 'composed'>('composed');

  const toggleMetric = (metric: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metric) 
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    );
  };

  const chartTypes = [
    { value: 'area', label: 'Area Chart' },
    { value: 'line', label: 'Line Chart' },
    { value: 'composed', label: 'Composed Chart' }
  ];

  const metricOptions = [
    { key: 'political', label: 'Political Influence', color: '#c084fc' },
    { key: 'twitter', label: 'Twitter Activity', color: '#38bdf8' },
    { key: 'memes', label: 'Meme Trends', color: '#fb923c' },
    { key: 'celebrity', label: 'Celebrity Impact', color: '#f472b6' }
  ];

  const renderChart = () => {
    const chartProps = {
      data,
      margin: { top: 10, right: 30, left: 0, bottom: 0 },
      className: "text-xs sm:text-sm"
    };

    const commonProps = {
      strokeWidth: 2,
      dot: { strokeWidth: 2, r: 4 }
    };

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="date" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {selectedMetrics.includes('political') && (
              <Area type="monotone" dataKey="political" stroke="#c084fc" fill="#c084fc" fillOpacity={0.1} name="Political" {...commonProps} />
            )}
            {selectedMetrics.includes('twitter') && (
              <Area type="monotone" dataKey="twitter" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.1} name="Twitter" {...commonProps} />
            )}
            {selectedMetrics.includes('memes') && (
              <Area type="monotone" dataKey="memes" stroke="#fb923c" fill="#fb923c" fillOpacity={0.1} name="Memes" {...commonProps} />
            )}
            {selectedMetrics.includes('celebrity') && (
              <Area type="monotone" dataKey="celebrity" stroke="#f472b6" fill="#f472b6" fillOpacity={0.1} name="Celebrity" {...commonProps} />
            )}
          </AreaChart>
        );

      case 'line':
        return (
          <LineChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="date" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {selectedMetrics.includes('political') && (
              <Line type="monotone" dataKey="political" stroke="#c084fc" name="Political" {...commonProps} />
            )}
            {selectedMetrics.includes('twitter') && (
              <Line type="monotone" dataKey="twitter" stroke="#38bdf8" name="Twitter" {...commonProps} />
            )}
            {selectedMetrics.includes('memes') && (
              <Line type="monotone" dataKey="memes" stroke="#fb923c" name="Memes" {...commonProps} />
            )}
            {selectedMetrics.includes('celebrity') && (
              <Line type="monotone" dataKey="celebrity" stroke="#f472b6" name="Celebrity" {...commonProps} />
            )}
          </LineChart>
        );

      default:
        return (
          <ComposedChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="date" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {selectedMetrics.includes('political') && (
              <Area type="monotone" dataKey="political" stroke="#c084fc" fill="#c084fc" fillOpacity={0.1} name="Political" {...commonProps} />
            )}
            {selectedMetrics.includes('twitter') && (
              <Area type="monotone" dataKey="twitter" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.1} name="Twitter" {...commonProps} />
            )}
            {selectedMetrics.includes('memes') && (
              <Line type="monotone" dataKey="memes" stroke="#fb923c" name="Memes" {...commonProps} />
            )}
            {selectedMetrics.includes('celebrity') && (
              <Scatter dataKey="celebrity" fill="#f472b6" name="Celebrity" />
            )}
          </ComposedChart>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* News Section */}
      <div className="bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-gray-900/50 backdrop-blur-md p-4 sm:p-6 rounded-xl shadow-2xl">
        <h3 className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-purple-200 mb-4">Latest Tweets</h3>
        <TwitterFeed
          news={news}
          loading={loading}
          onSelectNews={setSelectedNews}
        />
      </div>

      {/* Charts Section */}
      <div className={`bg-gradient-to-br from-gray-900/50 via-indigo-900/50 to-purple-900/50 backdrop-blur-md p-4 sm:p-6 rounded-xl shadow-2xl transition-all duration-300 ${
        expandedChart ? 'fixed inset-4 z-50 overflow-auto' : 'relative'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <h3 className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-purple-200">
              Social Influence Analysis
            </h3>
            <button
              onClick={() => setExpandedChart(!expandedChart)}
              className="ml-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              {expandedChart ? (
                <Minimize2 className="w-5 h-5 text-gray-300" />
              ) : (
                <Maximize2 className="w-5 h-5 text-gray-300" />
              )}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-300" />
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value as any)}
                className="rounded-lg border border-gray-600 bg-gray-800 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {chartTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-2">
              {metricOptions.map(({ key, label, color }) => (
                <button
                  key={key}
                  onClick={() => toggleMetric(key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedMetrics.includes(key)
                      ? 'bg-white/20 text-white'
                      : 'bg-white/5 text-gray-400'
                  }`}
                  style={{
                    borderColor: selectedMetrics.includes(key) ? color : 'transparent',
                    borderWidth: '1px'
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={`h-[400px] ${expandedChart ? 'sm:h-[600px]' : 'sm:h-[500px]'}`}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </div>

      {/* News Detail Modal */}
      {selectedNews && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-xl">
            <div className="relative">
              <button
                onClick={() => setSelectedNews(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-white/10 backdrop-blur-sm rounded-full shadow-lg hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <NewsDetail
                news={selectedNews}
                coinMetrics={{
                  socialMetrics: {
                    twitter: {
                      mentions: data[data.length - 1].twitter * 1000,
                      sentiment: data[data.length - 1].twitter,
                      trending: data[data.length - 1].twitter > 80
                    },
                    reddit: {
                      mentions: data[data.length - 1].memes * 500,
                      sentiment: data[data.length - 1].memes,
                      trending: data[data.length - 1].memes > 80
                    },
                    telegram: {
                      mentions: data[data.length - 1].political * 200,
                      sentiment: data[data.length - 1].political,
                      trending: data[data.length - 1].political > 80
                    }
                  },
                  celebrityInfluence: {
                    recent: [
                      {
                        name: "Elon Musk",
                        platform: "Twitter",
                        reach: 128500000,
                        sentiment: data[data.length - 1].celebrity,
                        date: "2h ago"
                      }
                    ],
                    impact: data[data.length - 1].celebrity
                  },
                  marketMetrics: {
                    volume24h: 1234567890,
                    volumeChange: 25.5,
                    correlation: {
                      btc: 0.75,
                      eth: 0.82
                    },
                    volatility: 85
                  },
                  memeMetrics: {
                    viralScore: data[data.length - 1].memes,
                    platforms: [
                      {
                        name: "TikTok",
                        score: Math.min(100, data[data.length - 1].memes * 1.2),
                        trending: data[data.length - 1].memes > 80
                      },
                      {
                        name: "Instagram",
                        score: Math.min(100, data[data.length - 1].memes * 1.1),
                        trending: data[data.length - 1].memes > 75
                      },
                      {
                        name: "9GAG",
                        score: Math.min(100, data[data.length - 1].memes * 0.9),
                        trending: data[data.length - 1].memes > 85
                      }
                    ],
                    sentiment: data[data.length - 1].memes
                  }
                }}
                onClose={() => setSelectedNews(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};