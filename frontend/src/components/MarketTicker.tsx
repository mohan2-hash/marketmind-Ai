import React from 'react';
import { MarketIndexItem } from '../types';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MarketTickerProps {
  indices: MarketIndexItem[];
}

export const MarketTicker: React.FC<MarketTickerProps> = ({ indices }) => {
  if (!indices || indices.length === 0) return null;

  return (
    <div className="bg-navy-950 border-b border-navy-800/80 px-6 py-2 overflow-x-auto whitespace-nowrap flex items-center gap-6 text-xs font-mono scrollbar-none">
      <span className="text-[10px] text-slate-500 font-sans uppercase font-bold tracking-wider shrink-0">
        MARKET PULSE
      </span>

      {indices.map((idx) => {
        const isUp = idx.change >= 0;
        return (
          <div key={idx.symbol} className="flex items-center gap-2 shrink-0">
            <span className="text-slate-300 font-semibold">{idx.symbol}</span>
            <span className="text-white font-medium">{idx.value.toLocaleString()}</span>
            <div
              className={`flex items-center text-[11px] font-semibold ${
                isUp ? 'text-gain' : 'text-loss'
              }`}
            >
              {isUp ? (
                <TrendingUp className="w-3 h-3 mr-0.5 inline" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-0.5 inline" />
              )}
              <span>
                {isUp ? '+' : ''}{idx.change.toFixed(2)} ({isUp ? '+' : ''}{idx.change_pct.toFixed(2)}%)
              </span>
            </div>
            <span className="text-slate-700">|</span>
          </div>
        );
      })}
    </div>
  );
};
