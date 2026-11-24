import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { marketApi } from '../services/api';
import { StockQuote } from '../types';
import { Search, Compass, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

export const StockExplorerPage: React.FC = () => {
  const { currentMarket } = useOutletContext<{ currentMarket: 'IN' | 'US' }>();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<'ALL' | 'IN' | 'US'>('ALL');

  useEffect(() => {
    // Initial fetch of default stocks
    const loadDefaultStocks = async () => {
      setLoading(true);
      try {
        const results = await marketApi.searchStocks('');
        setStocks(results);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadDefaultStocks();
  }, []);

  const handleSearch = async (q: string) => {
    setQuery(q);
    setLoading(true);
    try {
      const marketParam = selectedMarket === 'ALL' ? undefined : selectedMarket;
      const results = await marketApi.searchStocks(q, marketParam);
      setStocks(results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStocks = stocks.filter((s) => {
    if (selectedMarket !== 'ALL' && s.market !== selectedMarket) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Compass className="w-6 h-6 text-brand-cyan" />
          <span>Stock Explorer &amp; Discovery</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Search, filter, and inspect securities across Indian (NSE/BSE) and US (NASDAQ/NYSE) exchanges
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-4 bg-navy-900 p-4 rounded-xl border border-navy-800">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by symbol or company name (e.g. TCS, RELIANCE, NVDA, AAPL)..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-navy-950 border border-navy-700/80 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-blue"
          />
        </div>

        {/* Market Filter Buttons */}
        <div className="flex items-center gap-1 bg-navy-950 p-1 rounded-lg border border-navy-800">
          {(['ALL', 'IN', 'US'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMarket(m)}
              className={`text-xs px-3 py-1.5 rounded font-medium transition-all ${
                selectedMarket === m
                  ? 'bg-brand-blue text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {m === 'ALL' ? 'All Markets' : m === 'IN' ? '🇮🇳 India' : '🇺🇸 United States'}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Cards Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <span className="text-xs text-slate-400 font-mono">Searching listed securities...</span>
        </div>
      ) : filteredStocks.length === 0 ? (
        <div className="py-16 text-center bg-navy-900 border border-navy-800 rounded-xl">
          <p className="text-sm text-slate-400">No matching stocks found for "{query}".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStocks.map((stock) => {
            const isUp = stock.change_pct >= 0;
            return (
              <div
                key={stock.symbol}
                onClick={() => navigate(`/stocks/${stock.symbol}`)}
                className="bg-navy-900 border border-navy-800/80 rounded-xl p-5 hover:border-brand-blue/50 cursor-pointer transition-all shadow-md group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="font-extrabold text-white text-base block group-hover:text-brand-cyan transition-colors">
                        {stock.symbol}
                      </span>
                      <span className="text-xs text-slate-400 block line-clamp-1">{stock.name}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-navy-950 font-mono text-slate-400 border border-navy-800 shrink-0">
                      {stock.exchange}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 font-mono my-3 space-y-1">
                    <div className="flex justify-between">
                      <span>Sector:</span>
                      <span className="text-slate-300 font-sans">{stock.sector || 'Diversified'}</span>
                    </div>
                    {stock.market_cap && (
                      <div className="flex justify-between">
                        <span>Market Cap:</span>
                        <span className="text-slate-300">
                          {stock.currency === 'INR' ? '₹' : '$'}
                          {(stock.market_cap / 1000).toFixed(1)}k Cr
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-navy-800/80 flex items-center justify-between">
                  <span className="text-lg font-bold font-mono text-white">
                    {stock.currency === 'INR' ? '₹' : '$'}{stock.price.toFixed(2)}
                  </span>
                  <div
                    className={`flex items-center text-xs font-mono font-semibold ${
                      isUp ? 'text-gain' : 'text-loss'
                    }`}
                  >
                    {isUp ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
                    <span>
                      {isUp ? '+' : ''}{stock.change_pct.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
