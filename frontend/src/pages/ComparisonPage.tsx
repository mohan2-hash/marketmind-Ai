import React, { useState, useEffect } from 'react';
import { marketApi, analyticsApi, predictionApi } from '../services/api';
import { StockQuote, TechnicalAnalysis, FundamentalAnalysis, PredictionData } from '../types';
import { Scale, Plus, X, TrendingUp, TrendingDown, Check } from 'lucide-react';

interface ComparedStock {
  quote: StockQuote;
  tech: TechnicalAnalysis;
  fund: FundamentalAnalysis;
  pred: PredictionData;
}

export const ComparisonPage: React.FC = () => {
  const [symbols, setSymbols] = useState<string[]>(['TCS', 'INFY', 'RELIANCE']);
  const [candidates, setCandidates] = useState<ComparedStock[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newSymbolInput, setNewSymbolInput] = useState<string>('');

  useEffect(() => {
    loadComparisonData();
  }, [symbols]);

  const loadComparisonData = async () => {
    setLoading(true);
    try {
      const results: ComparedStock[] = [];
      for (const sym of symbols) {
        const [quote, tech, fund, pred] = await Promise.all([
          marketApi.getStockQuote(sym),
          analyticsApi.getTechnicalIndicators(sym),
          analyticsApi.getFundamentals(sym),
          predictionApi.getPredictions(sym),
        ]);
        results.push({ quote, tech, fund, pred });
      }
      setCandidates(results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSymbol = () => {
    const sym = newSymbolInput.trim().toUpperCase();
    if (sym && !symbols.includes(sym) && symbols.length < 4) {
      setSymbols([...symbols, sym]);
      setNewSymbolInput('');
    }
  };

  const handleRemoveSymbol = (sym: string) => {
    if (symbols.length > 1) {
      setSymbols(symbols.filter((s) => s !== sym));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Scale className="w-6 h-6 text-brand-cyan" />
            <span>Multi-Asset Comparative Matrix</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Compare Valuation Multiples, Balance Sheet Health, Technical Momentum, and ML Forecasts across up to 4 Companies
          </p>
        </div>

        {/* Add Symbol Input */}
        {symbols.length < 4 && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Add symbol (e.g. AAPL)..."
              value={newSymbolInput}
              onChange={(e) => setNewSymbolInput(e.target.value)}
              className="bg-navy-900 border border-navy-700 rounded-lg px-3 py-1.5 text-xs text-white uppercase font-mono focus:outline-none focus:border-brand-blue"
            />
            <button
              onClick={handleAddSymbol}
              className="bg-brand-blue hover:bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <span className="text-xs text-slate-400 font-mono">Synchronizing Cross-Asset Ratios...</span>
        </div>
      ) : (
        <div className="bg-navy-900 border border-navy-800 rounded-2xl shadow-xl overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-navy-800 bg-navy-950/60">
                <th className="p-4 text-slate-400 w-48 font-bold">METRIC / ATTRIBUTE</th>
                {candidates.map((c) => (
                  <th key={c.quote.symbol} className="p-4 text-white min-w-[200px]">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-black block">{c.quote.symbol}</span>
                        <span className="text-[10px] text-slate-400 font-sans block truncate max-w-[140px]">
                          {c.quote.name}
                        </span>
                      </div>
                      {symbols.length > 1 && (
                        <button
                          onClick={() => handleRemoveSymbol(c.quote.symbol)}
                          className="p-1 rounded hover:bg-navy-800 text-slate-400 hover:text-loss transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-navy-800 text-slate-300">
              {/* Price & Change */}
              <tr className="hover:bg-navy-850/50">
                <td className="p-3 text-slate-400 font-bold">Latest Price</td>
                {candidates.map((c) => (
                  <td key={c.quote.symbol} className="p-3 font-bold text-white text-sm">
                    {c.quote.currency === 'INR' ? '₹' : '$'}{c.quote.price.toFixed(2)}
                    <span className={`ml-2 text-xs font-semibold ${c.quote.change_pct >= 0 ? 'text-gain' : 'text-loss'}`}>
                      {c.quote.change_pct >= 0 ? '+' : ''}{c.quote.change_pct.toFixed(2)}%
                    </span>
                  </td>
                ))}
              </tr>

              {/* Health Score */}
              <tr className="hover:bg-navy-850/50">
                <td className="p-3 text-slate-400 font-bold">MarketMind Health</td>
                {candidates.map((c) => (
                  <td key={c.quote.symbol} className="p-3">
                    <span className="text-sm font-bold text-white mr-2">{c.fund.health_score}/100</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                      {c.fund.health_rating}
                    </span>
                  </td>
                ))}
              </tr>

              {/* P/E Ratio */}
              <tr className="hover:bg-navy-850/50">
                <td className="p-3 text-slate-400 font-bold">P/E Ratio</td>
                {candidates.map((c) => (
                  <td key={c.quote.symbol} className="p-3 text-brand-cyan font-bold">
                    {c.quote.pe_ratio ? `${c.quote.pe_ratio}x` : 'N/A'}
                  </td>
                ))}
              </tr>

              {/* ROE */}
              <tr className="hover:bg-navy-850/50">
                <td className="p-3 text-slate-400 font-bold">Return on Equity</td>
                {candidates.map((c) => (
                  <td key={c.quote.symbol} className="p-3 text-gain font-bold">
                    {c.fund.metrics.roe}%
                  </td>
                ))}
              </tr>

              {/* Operating Margin */}
              <tr className="hover:bg-navy-850/50">
                <td className="p-3 text-slate-400 font-bold">Operating Margin</td>
                {candidates.map((c) => (
                  <td key={c.quote.symbol} className="p-3">
                    {c.fund.metrics.operating_margin}%
                  </td>
                ))}
              </tr>

              {/* Debt to Equity */}
              <tr className="hover:bg-navy-850/50">
                <td className="p-3 text-slate-400 font-bold">Debt to Equity</td>
                {candidates.map((c) => (
                  <td key={c.quote.symbol} className="p-3">
                    {c.fund.metrics.debt_to_equity}
                  </td>
                ))}
              </tr>

              {/* 14-Day RSI */}
              <tr className="hover:bg-navy-850/50">
                <td className="p-3 text-slate-400 font-bold">14-Day RSI</td>
                {candidates.map((c) => (
                  <td key={c.quote.symbol} className="p-3">
                    <span>{c.tech.rsi_14}</span>
                    <span className="text-[10px] text-slate-400 ml-1.5">({c.tech.rsi_signal})</span>
                  </td>
                ))}
              </tr>

              {/* Technical Sentiment */}
              <tr className="hover:bg-navy-850/50">
                <td className="p-3 text-slate-400 font-bold">Technical Consensus</td>
                {candidates.map((c) => (
                  <td key={c.quote.symbol} className="p-3 font-bold">
                    <span className={c.tech.overall_sentiment.includes('BUY') ? 'text-gain' : 'text-loss'}>
                      {c.tech.overall_sentiment.replace('_', ' ')}
                    </span>
                  </td>
                ))}
              </tr>

              {/* 5-Day ML Forecast */}
              <tr className="hover:bg-navy-850/50 bg-brand-blue/5">
                <td className="p-3 text-slate-400 font-bold">5-Day ML Forecast Return</td>
                {candidates.map((c) => {
                  const f5 = c.pred.forecasts.find((f) => f.horizon === '5D');
                  return (
                    <td key={c.quote.symbol} className="p-3 font-bold">
                      <span className={f5 && f5.expected_change_pct >= 0 ? 'text-gain' : 'text-loss'}>
                        {f5 ? `${f5.expected_change_pct > 0 ? '+' : ''}${f5.expected_change_pct}%` : 'N/A'}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5 font-normal">
                        Target: {c.quote.currency === 'INR' ? '₹' : '$'}{f5?.target_price}
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* 30-Day ML Forecast */}
              <tr className="hover:bg-navy-850/50 bg-brand-blue/5">
                <td className="p-3 text-slate-400 font-bold">30-Day ML Forecast Return</td>
                {candidates.map((c) => {
                  const f30 = c.pred.forecasts.find((f) => f.horizon === '30D');
                  return (
                    <td key={c.quote.symbol} className="p-3 font-bold">
                      <span className={f30 && f30.expected_change_pct >= 0 ? 'text-gain' : 'text-loss'}>
                        {f30 ? `${f30.expected_change_pct > 0 ? '+' : ''}${f30.expected_change_pct}%` : 'N/A'}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5 font-normal">
                        Target: {c.quote.currency === 'INR' ? '₹' : '$'}{f30?.target_price}
                      </span>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
