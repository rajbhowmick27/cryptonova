import React, { useEffect, useState, useCallback } from 'react';
import { 
  TrendingUp, 
  Coins, 
  BarChart3, 
  Users, 
  GanttChartSquare,
  Search,
  Bell,
  UserCircle,
  LogOut,
  X
} from 'lucide-react';
import { MetricCard } from './components/MetricCard';
import { CoinTable } from './components/CoinTable';
import { SocialTrendsChart } from './components/SocialTrendsChart';
import { PredictionGrid } from './components/PredictionGrid';
import { AuthModal } from './components/AuthModal';
import { supabase, checkSupabaseConnection } from './lib/supabase';
import { fetchMemeCoins } from './lib/coingecko';
import { fetchSocialMetrics } from './lib/social-metrics';
import { fetchCryptoNews } from './lib/news';
import { useThrottledSearch } from './hooks/useThrottledSearch';
import type { CoinData } from './types';
import type { User } from '@supabase/supabase-js';
import type { NewsItem } from './lib/news';

interface NewsCache {
  [key: string]: {
    data: NewsItem[];
    timestamp: number;
  };
}

function App() {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCoin, setSelectedCoin] = useState<string | null>(null);
  const [socialData, setSocialData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingSocial, setLoadingSocial] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [newsCache, setNewsCache] = useState<NewsCache>({});
  const [currentNews, setCurrentNews] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const { searchTerm, setSearchTerm, throttledValue } = useThrottledSearch(300);

  useEffect(() => {
    const initializeApp = async () => {
      const isConnected = await checkSupabaseConnection();
      if (!isConnected) {
        console.warn('Running in offline mode');
      }

      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });

      return () => subscription.unsubscribe();
    };

    initializeApp();
  }, []);

  const loadCoins = useCallback(async () => {
    try {
      setError(null);
      const { coins: newCoins, hasMore: moreAvailable } = await fetchMemeCoins(page);
      
      if (page === 1) {
        setCoins(newCoins);
      } else {
        setCoins(prev => [...prev, ...newCoins]);
      }
      
      setHasMore(moreAvailable);
    } catch (error) {
      console.error('Error loading coins:', error);
      setError('Failed to load meme coins. Please try again later.');
    }
  }, [page]);

  useEffect(() => {
    loadCoins();
  }, [loadCoins]);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      setPage(prev => prev + 1);
      setLoadingMore(false);
    }
  };

  const loadSocialData = async (coinId: string) => {
    setLoadingSocial(true);
    try {
      const metrics = await fetchSocialMetrics(coinId);
      setSocialData(metrics);
    } catch (error) {
      console.error('Error loading social metrics:', error);
      setError('Failed to load social metrics. Please try again later.');
      setSocialData([]);
    } finally {
      setLoadingSocial(false);
    }
  };

  const loadNews = async (coinId: string) => {
    const cached = newsCache[coinId];
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      setCurrentNews(cached.data);
      return;
    }

    setLoadingNews(true);
    try {
      const newsData = await fetchCryptoNews(coinId);
      setCurrentNews(newsData);
      
      setNewsCache(prev => ({
        ...prev,
        [coinId]: {
          data: newsData,
          timestamp: Date.now()
        }
      }));
    } catch (error) {
      console.error('Error loading news:', error);
      setCurrentNews([]);
    } finally {
      setLoadingNews(false);
    }
  };

  const handleCoinSelect = (coin: CoinData) => {
    setSelectedCoin(coin.id);
    loadSocialData(coin.id);
    loadNews(coin.id);
    setShowAnalytics(true);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const closeAnalytics = () => {
    setShowAnalytics(false);
    setTimeout(() => {
      setSelectedCoin(null);
      setCurrentNews([]);
    }, 500);
  };

  const filteredCoins = Array.isArray(coins) ? coins.filter(coin => 
    throttledValue ? (
      coin.name.toLowerCase().includes(throttledValue.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(throttledValue.toLowerCase())
    ) : true
  ) : [];

  const totalMarketCap = Array.isArray(coins) ? coins.reduce((sum, coin) => {
    const marketCap = typeof coin.marketCap === 'number' ? coin.marketCap : 0;
    return sum + marketCap;
  }, 0) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-full h-[800px] top-0 left-0 bg-gradient-to-b from-blue-500/20 to-transparent rounded-[100%] animate-wave"></div>
        <div className="absolute w-full h-[600px] top-[20%] left-[10%] bg-gradient-to-b from-purple-500/20 to-transparent rounded-[100%] animate-wave-reverse"></div>
        <div className="absolute w-full h-[400px] bottom-0 right-0 bg-gradient-to-t from-indigo-500/20 to-transparent rounded-[100%] animate-wave-slow"></div>
      </div>

      <nav className="bg-white/10 backdrop-blur-md shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <GanttChartSquare className="h-8 w-8 text-indigo-300" />
              <span className="ml-2 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300 hidden sm:inline">CryptoNova</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="relative hidden sm:block">
                <input
                  type="text"
                  placeholder="Search coins..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48 md:w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500" />
              </button>
              {user ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700 hidden sm:inline">{user.email}</span>
                  <button 
                    onClick={handleSignOut}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <LogOut className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <UserCircle className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500" />
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {error && (
          <div className="mb-4 sm:mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="mb-4 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-300">
            Real-time meme coin insights powered by quantitative analysis and social metrics
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-8">
          <MetricCard
            title="Total Market Cap"
            value={`$${(totalMarketCap / 1e9).toFixed(2)}B`}
            change={2.5}
            icon={Coins}
          />
          <MetricCard
            title="Social Sentiment"
            value="87"
            change={5.8}
            icon={Users}
          />
          <MetricCard
            title="Trading Volume"
            value="$1.8B"
            change={-3.2}
            icon={BarChart3}
          />
          <MetricCard
            title="Momentum Score"
            value="92"
            change={4.1}
            icon={TrendingUp}
          />
        </div>

        <div className="space-y-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
              <h2 className="text-lg font-semibold text-white">Top Meme Coins</h2>
            </div>
            
            <CoinTable 
              coins={filteredCoins} 
              onSelectCoin={handleCoinSelect}
            />

            {hasMore && (
              <div className="mt-4 text-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {loadingMore ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </div>

          <PredictionGrid coins={coins} />
        </div>
      </main>

      <div 
        className={`fixed inset-y-0 right-0 w-full sm:w-[600px] lg:w-[800px] bg-gradient-to-br from-gray-900 to-black transform transition-transform duration-500 ease-in-out ${
          showAnalytics ? 'translate-x-0' : 'translate-x-full'
        } overflow-y-auto`}
        style={{ zIndex: 40 }}
      >
        <div className="sticky top-0 bg-gray-900/80 backdrop-blur-md p-4 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
            {selectedCoin && coins.find(c => c.id === selectedCoin)?.name} Analysis
          </h2>
          <button 
            onClick={closeAnalytics}
            className="p-2 rounded-full hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {loadingSocial ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-lg pointer-events-none"></div>
              <SocialTrendsChart 
                data={socialData}
                selectedCoin={selectedCoin}
                news={currentNews}
                loading={loadingNews}
              />
            </div>
          )}
        </div>
      </div>

      {showAnalytics && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500"
          style={{ zIndex: 30 }}
          onClick={closeAnalytics}
        />
      )}

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
}

export default App;