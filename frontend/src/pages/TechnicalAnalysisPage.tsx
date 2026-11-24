import React, { useState, useEffect } from 'react';
import { analyticsApi, marketApi } from '../services/api';
import { TechnicalAnalysis, HistoricalData } from '../types';
import { LineChart, Activity, TrendingUp, TrendingDown, Layers } from 'lucide-react';
import { TradingViewChart } from '../components/TradingViewChart';

export const TechnicalAnalysisPage: React.FC = () => {
  const [symbol, setSymbol] = useState<string>('TCS');
  const [data, setData] = useState<TechnicalAnalysis | null>(null);
  const [history, setHistory] = useState<HistoricalData | null>(null);
  const [timeframe, setTimeframe] = useState<string>('1Y');
  const [loading, setLoading] = useState<boolean>(true);

  const supportedSymbols = ['TCS', 'RELIANCE', 'INFY', 'HDFCBANK', 'AAPL', 'MSFT', 'NVDA', 'TSLA'];

  useEffect(() => {
    const loadTechnical = async () => {
      setLoading(true);
      try {
        const [tech, hist] = await Promise.all([
          analyticsApi.getTechnicalIndicators(symbol),
          marketApi.getStockHistory(symbol, timeframe),
        ]);
        setData(tech);
        setHistory(hist);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadTechnical();
  }, [symbol, timeframe]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <LineChart className="w-6 h-6 text-brand-cyan" />
            <span>Technical Analysis Studio</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Mathematical Momentum Oscillators, Moving Average Envelopes, and Candlestick Pattern Recognition
          </p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto bg-navy-900 p-1.5 rounded-xl border border-navy-800">
          {supportedSymbols.map((s) => (
            <button
              key={s}
              onClick={() => setSymbol(s)}
              className={`text-xs px-3 py-1.5 rounded-lg font-mono font-medium transition-all ${
                symbol === s
                  ? 'bg-brand-blue text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-navy-800'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <span className="text-xs text-slate-400 font-mono">Computing Technical Indicators...</span>
        </div>
      ) : data && history ? (
        <>
          {/* Chart Display */}
          <TradingViewChart
            candles={history.candles}
            symbol={symbol}
            currency={history.currency}
            timeframe={timeframe}
            onTimeframeChange={setTimeframe}
          />

          {/* Indicators Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-navy-900 border border-navy-800 rounded-xl p-5 font-mono">
              <span className="text-xs text-slate-400 block">14-DAY RSI</span>
              <span className="text-2xl font-bold text-white mt-1 block">{data.rsi_14}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold mt-2 inline-block ${data.rsi_signal === 'OVERSOLD' ? 'bg-gain/20 text-gain' : data.rsi_signal === 'OVERBOUGHT' ? 'bg-loss/20 text-loss' : 'bg-navy-800 text-slate-300'}`}>
                {data.rsi_signal}
              </span>
            </div>

            <div className="bg-navy-900 border border-navy-800 rounded-xl p-5 font-mono">
              <span className="text-xs text-slate-400 block">MACD HISTOGRAM</span>
              <span className={`text-2xl font-bold mt-1 block ${data.macd_histogram >= 0 ? 'text-gain' : 'text-loss'}`}>
                {data.macd_histogram}
              </span>
              <span className="text-[10px] text-brand-cyan block mt-2">{data.macd_trend}</span>
            </div>

            <div className="bg-navy-900 border border-navy-800 rounded-xl p-5 font-mono">
              <span className="text-xs text-slate-400 block">50-DAY SMA</span>
              <span className="text-2xl font-bold text-white mt-1 block">{data.sma_50}</span>
              <span className="text-[10px] text-slate-400 block mt-2">200-SMA: {data.sma_200}</span>
            </div>

            <div className="bg-navy-900 border border-navy-800 rounded-xl p-5 font-mono">
              <span className="text-xs text-slate-400 block">TECHNICAL CONSENSUS</span>
              <span className={`text-xl font-bold mt-1 block ${data.overall_sentiment.includes('BUY') ? 'text-gain' : data.overall_sentiment.includes('SELL') ? 'text-loss' : 'text-amber-400'}`}>
                {data.overall_sentiment.replace('_', ' ')}
              </span>
              <span className="text-[10px] text-slate-400 block mt-2">ATR Volatility: {data.atr_14}</span>
            </div>
          </div>

          {/* Support / Resistance & Patterns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-navy-900 border border-navy-800 rounded-xl p-5">
              <h3 className="text-sm font-bold text-white mb-3">Dynamic Pivot Levels (Support &amp; Resistance)</h3>
              <div className="space-y-2 font-mono text-xs">
                {data.support_resistance.map((lvl, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2.5 rounded bg-navy-950 border border-navy-800/80">
                    <span className={lvl.type === 'RESISTANCE' ? 'text-loss font-semibold' : 'text-gain font-semibold'}>
                      {lvl.type}
                    </span>
                    <span className="text-white font-bold">{lvl.price}</span>
                    <span className="text-slate-400 text-[10px]">Tested: {lvl.tested_count}x</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-navy-900 border border-navy-800 rounded-xl p-5">
              <h3 className="text-sm font-bold text-white mb-3">Detected Candlestick Patterns</h3>
              {data.detected_patterns.length === 0 ? (
                <p className="text-xs text-slate-400">No classic patterns detected in the immediate sessions.</p>
              ) : (
                <div className="space-y-2.5">
                  {data.detected_patterns.map((p, idx) => (
                    <div key={idx} className="p-3 rounded bg-navy-950 border border-navy-800/80">
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-white">{p.name}</span>
                        <span className={p.type === 'BULLISH' ? 'text-gain' : 'text-loss'}>{p.type}</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{p.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
