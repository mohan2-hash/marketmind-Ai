import React, { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { marketApi } from '../services/api';
import { MarketOverview, StockQuote } from '../types';
import { TrendingUp, TrendingDown, Activity, Clock, ShieldCheck, ChevronRight } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { currentMarket, isDemoMode } = useOutletContext<{ currentMarket: 'IN' | 'US'; isDemoMode: boolean }>();
  const navigate = useNavigate();

  const [data, setData] = useState<MarketOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOverview = async () => {
      setLoading(true);
      setError(null);
      try {
        const overview = await marketApi.getOverview(currentMarket, isDemoMode);
        setData(overview);
      } catch (err: any) {
        setError(err.message || 'Failed to load market overview');
      } finally {
        setLoading(false);
      }
    };
    loadOverview();
  }, [currentMarket, isDemoMode]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-mono text-slate-400">Loading Market Overview...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-loss/10 border border-loss/30 rounded-xl text-loss text-sm">
        Failed to load market overview: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>{currentMarket === 'IN' ? '🇮🇳 Indian Market Overview' : '🇺🇸 US Market Overview'}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            {currentMarket === 'IN' ? 'National Stock Exchange (NSE) & Bombay Stock Exchange (BSE)' : 'NASDAQ & New York Stock Exchange (NYSE)'}
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-navy-900 border border-navy-800">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{data.last_updated}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-navy-900 border border-navy-800 text-brand-cyan">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Mode: {data.data_mode}</span>
          </div>
        </div>
      </div>

      {/* Major Indices Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.indices.map((idx) => {
          const isUp = idx.change >= 0;
          return (
            <div
              key={idx.symbol}
              className="bg-navy-900 border border-navy-800/80 rounded-xl p-5 hover:border-navy-700 transition-all shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-300">{idx.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-navy-950 font-mono text-slate-400 border border-navy-800">
                  {idx.exchange}
                </span>
              </div>

              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-bold font-mono text-white tracking-tight">
                  {idx.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <div
                  className={`flex items-center font-mono font-semibold text-sm ${
                    isUp ? 'text-gain' : 'text-loss'
                  }`}
                >
                  {isUp ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                  <span>
                    {isUp ? '+' : ''}{idx.change.toFixed(2)} ({isUp ? '+' : ''}{idx.change_pct.toFixed(2)}%)
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Gainers, Losers, and Most Active */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Gainers */}
        <div className="bg-navy-900 border border-navy-800/80 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-navy-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gain" />
              <span>Top Gainers</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Day Performance</span>
          </div>

          <div className="space-y-3">
            {data.top_gainers.map((stock) => (
              <div
                key={stock.symbol}
                onClick={() => navigate(`/stocks/${stock.symbol}`)}
                className="flex items-center justify-between p-2.5 rounded-lg bg-navy-950/60 hover:bg-navy-800/80 cursor-pointer transition-colors border border-navy-800/40"
              >
                <div>
                  <span className="font-bold text-xs text-white block">{stock.symbol}</span>
                  <span className="text-[11px] text-slate-400 truncate max-w-[120px] block">{stock.name}</span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-xs text-slate-200 block">
                    {stock.currency === 'INR' ? '₹' : '$'}{stock.price.toFixed(2)}
                  </span>
                  <span className="text-xs text-gain font-semibold">
                    +{stock.change_pct.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div className="bg-navy-900 border border-navy-800/80 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-navy-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-loss" />
              <span>Top Losers</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Day Performance</span>
          </div>

          <div className="space-y-3">
            {data.top_losers.map((stock) => (
              <div
                key={stock.symbol}
                onClick={() => navigate(`/stocks/${stock.symbol}`)}
                className="flex items-center justify-between p-2.5 rounded-lg bg-navy-950/60 hover:bg-navy-800/80 cursor-pointer transition-colors border border-navy-800/40"
              >
                <div>
                  <span className="font-bold text-xs text-white block">{stock.symbol}</span>
                  <span className="text-[11px] text-slate-400 truncate max-w-[120px] block">{stock.name}</span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-xs text-slate-200 block">
                    {stock.currency === 'INR' ? '₹' : '$'}{stock.price.toFixed(2)}
                  </span>
                  <span className="text-xs text-loss font-semibold">
                    {stock.change_pct.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Active */}
        <div className="bg-navy-900 border border-navy-800/80 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-navy-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-cyan" />
              <span>Most Active</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">By Volume</span>
          </div>

          <div className="space-y-3">
            {data.most_active.map((stock) => (
              <div
                key={stock.symbol}
                onClick={() => navigate(`/stocks/${stock.symbol}`)}
                className="flex items-center justify-between p-2.5 rounded-lg bg-navy-950/60 hover:bg-navy-800/80 cursor-pointer transition-colors border border-navy-800/40"
              >
                <div>
                  <span className="font-bold text-xs text-white block">{stock.symbol}</span>
                  <span className="text-[11px] text-slate-400 truncate max-w-[120px] block">{stock.name}</span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-xs text-slate-200 block">
                    {stock.currency === 'INR' ? '₹' : '$'}{stock.price.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Vol: {(stock.volume / 1000000).toFixed(1)}M
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sector Performance */}
      <div className="bg-navy-900 border border-navy-800/80 rounded-xl p-6 shadow-lg">
        <h3 className="text-sm font-bold text-white mb-4">Sectoral Performance Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(data.sector_performance).map(([sec, val]) => {
            const isUp = val >= 0;
            return (
              <div key={sec} className="bg-navy-950 p-3 rounded-lg border border-navy-800/60">
                <span className="text-xs text-slate-400 block truncate">{sec}</span>
                <span className={`text-sm font-mono font-bold mt-1 block ${isUp ? 'text-gain' : 'text-loss'}`}>
                  {isUp ? '+' : ''}{val.toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
