import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Globe, Shield, Sparkles, Cpu } from 'lucide-react';
import { marketApi } from '../services/api';
import { StockQuote } from '../types';

interface NavbarProps {
  currentMarket: 'IN' | 'US';
  onMarketChange: (m: 'IN' | 'US') => void;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMarket,
  onMarketChange,
  isDemoMode,
  onToggleDemoMode,
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StockQuote[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);

    if (q.trim().length > 0) {
      setIsSearching(true);
      setShowDropdown(true);
      try {
        const results = await marketApi.searchStocks(q, currentMarket);
        setSearchResults(results);
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  const handleSelectStock = (symbol: string) => {
    setShowDropdown(false);
    setSearchQuery('');
    navigate(`/stocks/${symbol}`);
  };

  return (
    <header className="h-16 bg-navy-900 border-b border-navy-800 px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md bg-opacity-90">
      {/* Search Bar */}
      <div className="relative w-80 md:w-96">
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search stocks (e.g. RELIANCE, TCS, AAPL, NVDA)..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => searchQuery && setShowDropdown(true)}
            className="w-full bg-navy-950 border border-navy-700/80 rounded-lg pl-9 pr-4 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
          />
        </div>

        {/* Autocomplete Dropdown */}
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute top-11 left-0 w-full bg-navy-900 border border-navy-700 rounded-lg shadow-2xl overflow-hidden z-50">
            {searchResults.map((stock) => (
              <div
                key={stock.symbol}
                onClick={() => handleSelectStock(stock.symbol)}
                className="px-4 py-2.5 hover:bg-navy-800 cursor-pointer flex items-center justify-between border-b border-navy-800/60 last:border-none transition-colors"
              >
                <div>
                  <span className="font-semibold text-white text-sm">{stock.symbol}</span>
                  <p className="text-xs text-slate-400 truncate max-w-[200px]">{stock.name}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-mono text-slate-200">
                    {stock.currency === 'INR' ? '₹' : '$'}{stock.price.toFixed(2)}
                  </span>
                  <span
                    className={`block text-xs font-mono font-medium ${
                      stock.change_pct >= 0 ? 'text-gain' : 'text-loss'
                    }`}
                  >
                    {stock.change_pct >= 0 ? '+' : ''}{stock.change_pct.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Market Switcher */}
        <div className="flex items-center bg-navy-950 p-1 rounded-lg border border-navy-800">
          <button
            onClick={() => onMarketChange('IN')}
            className={`text-xs px-3 py-1 rounded font-medium flex items-center gap-1.5 transition-all ${
              currentMarket === 'IN'
                ? 'bg-brand-blue text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🇮🇳</span>
            <span>Indian (NSE/BSE)</span>
          </button>
          <button
            onClick={() => onMarketChange('US')}
            className={`text-xs px-3 py-1 rounded font-medium flex items-center gap-1.5 transition-all ${
              currentMarket === 'US'
                ? 'bg-brand-blue text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🇺🇸</span>
            <span>US (NASDAQ/NYSE)</span>
          </button>
        </div>

        {/* Mode Indicator Pill */}
        <button
          onClick={onToggleDemoMode}
          title="Click to toggle between Demo Mode and Real Data Provider"
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-mono font-medium border transition-all ${
            isDemoMode
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full animate-pulse ${
              isDemoMode ? 'bg-amber-400' : 'bg-emerald-400'
            }`}
          />
          {isDemoMode ? 'DEMO MODE' : 'LIVE PROVIDER'}
        </button>

        {/* AI Quick Assistant Trigger */}
        <button
          onClick={() => navigate('/assistant')}
          className="p-2 rounded-lg bg-navy-800 text-brand-cyan hover:bg-navy-700 hover:text-white transition-colors border border-navy-700/60"
          title="Open AI Financial Assistant"
        >
          <Sparkles className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
