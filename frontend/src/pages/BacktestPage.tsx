import React, { useState } from 'react';
import { analyticsApi } from '../services/api';
import { BacktestResult } from '../types';
import { History, Play, Sliders, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export const BacktestPage: React.FC = () => {
  const [symbol, setSymbol] = useState<string>('TCS');
  const [strategy, setStrategy] = useState<string>('SMA_CROSSOVER');
  const [initialCapital, setInitialCapital] = useState<number>(100000);
  const [commissionPct, setCommissionPct] = useState<number>(0.1);
  const [slippagePct, setSlippagePct] = useState<number>(0.05);

  // Strategy Specific Parameters
  const [fastPeriod, setFastPeriod] = useState<number>(10);
  const [slowPeriod, setSlowPeriod] = useState<number>(30);
  const [rsiOversold, setRsiOversold] = useState<number>(30);
  const [rsiOverbought, setRsiOverbought] = useState<number>(70);

  const [result, setResult] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleRunBacktest = async () => {
    setLoading(true);
    try {
      const parameters =
        strategy === 'SMA_CROSSOVER'
          ? { fast_period: fastPeriod, slow_period: slowPeriod }
          : strategy === 'RSI_MEAN_REVERSION'
          ? { oversold_threshold: rsiOversold, overbought_threshold: rsiOverbought }
          : {};

      const data = await analyticsApi.runBacktest({
        symbol,
        strategy,
        initial_capital: initialCapital,
        commission_pct: commissionPct,
        slippage_pct: slippagePct,
        parameters,
      });
      setResult(data);
    } catch (err: any) {
      alert(err.response?.data?.detail || err.message || 'Backtest failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-brand-cyan" />
            <span>Quantitative Backtesting Laboratory</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Simulate Algorithmic Execution, Friction Costs (Slippage &amp; Commissions), and Benchmark Alpha
          </p>
        </div>
      </div>

      {/* Strategy Control Panel */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-brand-blue" />
          <span>Strategy Parameters &amp; Execution Model</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <label className="text-slate-400 block mb-1">Target Symbol</label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              className="w-full bg-navy-950 border border-navy-700 rounded-lg p-2 text-white font-bold"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Strategy Architecture</label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              className="w-full bg-navy-950 border border-navy-700 rounded-lg p-2 text-white"
            >
              <option value="SMA_CROSSOVER">SMA Trend Crossover</option>
              <option value="RSI_MEAN_REVERSION">RSI Mean Reversion</option>
              <option value="BOLLINGER_BREAKOUT">Bollinger Band Breakout</option>
              <option value="BUY_AND_HOLD">Buy &amp; Hold Benchmark</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Initial Capital ($/₹)</label>
            <input
              type="number"
              value={initialCapital}
              onChange={(e) => setInitialCapital(Number(e.target.value))}
              className="w-full bg-navy-950 border border-navy-700 rounded-lg p-2 text-white"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Fee &amp; Slippage Friction (%)</label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                value={commissionPct}
                onChange={(e) => setCommissionPct(Number(e.target.value))}
                placeholder="Comm %"
                className="w-1/2 bg-navy-950 border border-navy-700 rounded-lg p-2 text-white"
              />
              <input
                type="number"
                step="0.01"
                value={slippagePct}
                onChange={(e) => setSlippagePct(Number(e.target.value))}
                placeholder="Slip %"
                className="w-1/2 bg-navy-950 border border-navy-700 rounded-lg p-2 text-white"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Parameter Settings */}
        {strategy === 'SMA_CROSSOVER' && (
          <div className="grid grid-cols-2 gap-4 mt-4 text-xs font-mono pt-4 border-t border-navy-800">
            <div>
              <label className="text-slate-400 block mb-1">Fast SMA Period (Days)</label>
              <input
                type="number"
                value={fastPeriod}
                onChange={(e) => setFastPeriod(Number(e.target.value))}
                className="w-full bg-navy-950 border border-navy-700 rounded-lg p-2 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Slow SMA Period (Days)</label>
              <input
                type="number"
                value={slowPeriod}
                onChange={(e) => setSlowPeriod(Number(e.target.value))}
                className="w-full bg-navy-950 border border-navy-700 rounded-lg p-2 text-white"
              />
            </div>
          </div>
        )}

        {strategy === 'RSI_MEAN_REVERSION' && (
          <div className="grid grid-cols-2 gap-4 mt-4 text-xs font-mono pt-4 border-t border-navy-800">
            <div>
              <label className="text-slate-400 block mb-1">Oversold Buy Threshold (RSI)</label>
              <input
                type="number"
                value={rsiOversold}
                onChange={(e) => setRsiOversold(Number(e.target.value))}
                className="w-full bg-navy-950 border border-navy-700 rounded-lg p-2 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Overbought Exit Threshold (RSI)</label>
              <input
                type="number"
                value={rsiOverbought}
                onChange={(e) => setRsiOverbought(Number(e.target.value))}
                className="w-full bg-navy-950 border border-navy-700 rounded-lg p-2 text-white"
              />
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleRunBacktest}
            disabled={loading}
            className="bg-gradient-to-r from-brand-blue to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-brand-blue/20 flex items-center gap-2 transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{loading ? 'Simulating Trades...' : 'Execute Historical Backtest'}</span>
          </button>
        </div>
      </div>

      {/* Backtest Results */}
      {result && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-navy-900 border border-navy-800 rounded-xl p-5 font-mono">
              <span className="text-xs text-slate-400 block">TOTAL STRATEGY RETURN</span>
              <span className={`text-2xl font-black mt-1 block ${result.total_return_pct >= 0 ? 'text-gain' : 'text-loss'}`}>
                {result.total_return_pct > 0 ? '+' : ''}{result.total_return_pct}%
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">Final: {result.final_equity.toLocaleString()}</span>
            </div>

            <div className="bg-navy-900 border border-navy-800 rounded-xl p-5 font-mono">
              <span className="text-xs text-slate-400 block">BENCHMARK RETURN &amp; ALPHA</span>
              <span className={`text-2xl font-black mt-1 block ${result.alpha >= 0 ? 'text-gain' : 'text-loss'}`}>
                {result.alpha > 0 ? '+' : ''}{result.alpha}%
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">Hold Return: {result.benchmark_return_pct}%</span>
            </div>

            <div className="bg-navy-900 border border-navy-800 rounded-xl p-5 font-mono">
              <span className="text-xs text-slate-400 block">WIN RATE &amp; TRADES</span>
              <span className="text-2xl font-bold text-white mt-1 block">{result.win_rate_pct}%</span>
              <span className="text-[10px] text-slate-500 mt-1 block">
                {result.winning_trades} Win / {result.losing_trades} Loss ({result.total_trades} Total)
              </span>
            </div>

            <div className="bg-navy-900 border border-navy-800 rounded-xl p-5 font-mono">
              <span className="text-xs text-slate-400 block">SHARPE &amp; MAX DRAWDOWN</span>
              <span className="text-2xl font-bold text-white mt-1 block">{result.sharpe_ratio}</span>
              <span className="text-[10px] text-loss mt-1 block">Max DD: -{result.max_drawdown_pct}%</span>
            </div>
          </div>

          {/* Trade Execution Ledger Table */}
          <div className="bg-navy-900 border border-navy-800 rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-white mb-3">Simulated Order Execution Ledger</h3>
            {result.trades.length === 0 ? (
              <p className="text-xs text-slate-400">No trades triggered under current parameter thresholds.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-navy-950 text-slate-400 border-b border-navy-800">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Entry Date</th>
                      <th className="p-2.5">Exit Date</th>
                      <th className="p-2.5">Entry Price</th>
                      <th className="p-2.5">Exit Price</th>
                      <th className="p-2.5">Shares</th>
                      <th className="p-2.5">P&amp;L</th>
                      <th className="p-2.5">Return (%)</th>
                      <th className="p-2.5">Exit Trigger</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-800 text-slate-200">
                    {result.trades.map((t) => {
                      const isProfit = (t.pnl || 0) >= 0;
                      return (
                        <tr key={t.id} className="hover:bg-navy-850">
                          <td className="p-2.5 text-slate-400">{t.id}</td>
                          <td className="p-2.5">{t.entry_date}</td>
                          <td className="p-2.5">{t.exit_date || 'OPEN'}</td>
                          <td className="p-2.5">{t.entry_price}</td>
                          <td className="p-2.5">{t.exit_price || '-'}</td>
                          <td className="p-2.5">{t.shares}</td>
                          <td className={`p-2.5 font-bold ${isProfit ? 'text-gain' : 'text-loss'}`}>
                            {t.pnl ? `${t.pnl > 0 ? '+' : ''}${t.pnl}` : '-'}
                          </td>
                          <td className={`p-2.5 font-bold ${isProfit ? 'text-gain' : 'text-loss'}`}>
                            {t.pnl_pct ? `${t.pnl_pct > 0 ? '+' : ''}${t.pnl_pct}%` : '-'}
                          </td>
                          <td className="p-2.5 text-slate-400 text-[10px]">{t.exit_reason || 'Pending'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl bg-navy-950 text-[11px] text-slate-500 font-mono">
            {result.disclaimer}
          </div>
        </div>
      )}
    </div>
  );
};
