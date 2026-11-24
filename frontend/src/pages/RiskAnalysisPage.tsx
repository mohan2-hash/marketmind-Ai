import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../services/api';
import { RiskMetrics } from '../types';
import { ShieldAlert, AlertCircle, BarChart3, TrendingDown, Layers } from 'lucide-react';

export const RiskAnalysisPage: React.FC = () => {
  const [symbol, setSymbol] = useState<string>('NVDA');
  const [risk, setRisk] = useState<RiskMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const supportedSymbols = ['NVDA', 'TSLA', 'AAPL', 'MSFT', 'RELIANCE', 'TCS', 'HDFCBANK', 'SBIN'];

  useEffect(() => {
    const loadRisk = async () => {
      setLoading(true);
      try {
        const data = await analyticsApi.getRiskMetrics(symbol);
        setRisk(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadRisk();
  }, [symbol]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-500" />
            <span>Quantitative Risk Management Studio</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Value at Risk (VaR 95%), Expected Shortfall (CVaR), Beta Sensitivity, and Drawdown Analytics
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
          <span className="text-xs text-slate-400 font-mono">Simulating Risk Distributions...</span>
        </div>
      ) : risk ? (
        <>
          {/* Main Risk Overview Banner */}
          <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-6">
            <div>
              <span className="text-xs font-mono text-slate-400">RISK PROFILE ASSESSMENT</span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-3xl font-black text-white font-mono">{risk.symbol}</span>
                <span className={`text-xs px-3 py-1 rounded-full font-mono font-bold ${
                  risk.risk_level === 'LOW'
                    ? 'bg-gain/20 text-gain'
                    : risk.risk_level === 'MODERATE'
                    ? 'bg-blue-500/20 text-brand-cyan'
                    : risk.risk_level === 'HIGH'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-loss/20 text-loss'
                }`}>
                  {risk.risk_level} RISK LEVEL
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2 max-w-xl">
                Benchmarked against <span className="font-mono text-brand-cyan">{risk.benchmark_symbol}</span> with annualized standard deviation and downside deviation modeling.
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="bg-navy-950 p-3 rounded-xl border border-navy-800">
                <span className="text-slate-400 block text-[10px]">1-DAY 95% VaR</span>
                <span className="text-rose-400 font-bold text-lg block mt-0.5">-{risk.var_95}%</span>
                <span className="text-slate-500 text-[10px] block">CVaR: -{risk.cvar_95}%</span>
              </div>

              <div className="bg-navy-950 p-3 rounded-xl border border-navy-800">
                <span className="text-slate-400 block text-[10px]">SHARPE RATIO</span>
                <span className="text-white font-bold text-lg block mt-0.5">{risk.sharpe_ratio}</span>
                <span className="text-slate-500 text-[10px] block">Sortino: {risk.sortino_ratio}</span>
              </div>
            </div>
          </div>

          {/* Risk Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-navy-900 border border-navy-800 rounded-xl p-5 font-mono">
              <span className="text-xs text-slate-400 block">ANNUALIZED VOLATILITY</span>
              <span className="text-2xl font-bold text-white mt-1 block">{risk.annualized_volatility}%</span>
              <span className="text-[10px] text-slate-500 mt-1 block">Benchmark: {risk.benchmark_volatility}%</span>
            </div>

            <div className="bg-navy-900 border border-navy-800 rounded-xl p-5 font-mono">
              <span className="text-xs text-slate-400 block">BETA COEFFICIENT</span>
              <span className="text-2xl font-bold text-brand-cyan mt-1 block">{risk.beta}</span>
              <span className="text-[10px] text-slate-500 mt-1 block">Covariance / Benchmark Var</span>
            </div>

            <div className="bg-navy-900 border border-navy-800 rounded-xl p-5 font-mono">
              <span className="text-xs text-slate-400 block">HISTORICAL MAX DRAWDOWN</span>
              <span className="text-2xl font-bold text-loss mt-1 block">-{risk.max_drawdown_pct}%</span>
              <span className="text-[10px] text-slate-500 mt-1 block">Peak-to-Trough Decline</span>
            </div>

            <div className="bg-navy-900 border border-navy-800 rounded-xl p-5 font-mono">
              <span className="text-xs text-slate-400 block">DOWNSIDE DEVIATION</span>
              <span className="text-2xl font-bold text-white mt-1 block">{risk.downside_deviation}%</span>
              <span className="text-[10px] text-slate-500 mt-1 block">Semivariance of Negative Returns</span>
            </div>
          </div>

          {/* Return Distribution Histogram & Drawdowns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Return Distribution */}
            <div className="bg-navy-900 border border-navy-800 rounded-xl p-5 shadow-lg">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-white">Daily Return Frequency Distribution</h3>
                <span className="text-xs font-mono text-slate-400">
                  Skew: {risk.return_distribution.skewness} | Kurt: {risk.return_distribution.kurtosis}
                </span>
              </div>

              <div className="space-y-2 mt-4 font-mono text-xs">
                {risk.return_distribution.bins.map((b, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="w-28 text-slate-400 text-[11px] truncate shrink-0">{b.bin}</span>
                    <div className="flex-1 h-3 bg-navy-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-blue rounded-full"
                        style={{ width: `${Math.min(100, b.count * 4)}%` }}
                      ></div>
                    </div>
                    <span className="w-8 text-right text-slate-300 font-bold text-[11px]">{b.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Officer Warnings */}
            <div className="bg-navy-900 border border-navy-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>Risk Officer Disclosures &amp; Prudence Notes</span>
                </h3>
                <ul className="space-y-3 text-xs text-slate-300">
                  {risk.warnings.map((w, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-navy-950/60 p-3 rounded-lg border border-navy-800/80">
                      <span className="text-amber-400 font-bold shrink-0">•</span>
                      <span className="leading-relaxed">{w}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-navy-950 text-[11px] text-slate-500 font-mono">
                Statistical measurements reflect historical empirical returns. Tail risk events (black swans) exceed 95% and 99% simulation thresholds.
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
