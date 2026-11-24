import React, { useState, useEffect } from 'react';
import { portfolioApi, marketApi } from '../services/api';
import { PortfolioSummary, StockQuote } from '../types';
import { Briefcase, TrendingUp, TrendingDown, Plus, Minus, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';

export const PortfolioPage: React.FC = () => {
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Trade Modal
  const [showModal, setShowModal] = useState<boolean>(false);
  const [tradeSymbol, setTradeSymbol] = useState<string>('RELIANCE');
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [tradeQuantity, setTradeQuantity] = useState<number>(10);
  const [tradePrice, setTradePrice] = useState<number>(0);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    setLoading(true);
    try {
      const data = await portfolioApi.getPortfolio();
      setPortfolio(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTrade = async (sym: string, type: 'BUY' | 'SELL') => {
    setTradeSymbol(sym);
    setTradeType(type);
    try {
      const quote = await marketApi.getStockQuote(sym);
      setTradePrice(quote.price);
    } catch (err) {
      console.error(err);
    }
    setShowModal(true);
  };

  const handleExecuteTrade = async () => {
    setSubmitting(true);
    try {
      await portfolioApi.createTransaction({
        symbol: tradeSymbol,
        transaction_type: tradeType,
        quantity: tradeQuantity,
        price: tradePrice,
      });
      setShowModal(false);
      await loadPortfolio();
      alert(`Trade confirmed: ${tradeType} ${tradeQuantity} ${tradeSymbol}`);
    } catch (err: any) {
      alert(err.response?.data?.detail || err.message || 'Trade execution failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-brand-cyan" />
            <span>Virtual Portfolio Simulator</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Paper-trading ledger with real-time mark-to-market valuation, P&amp;L accounting, and allocation tracking
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenTrade('RELIANCE', 'BUY')}
            className="bg-brand-blue hover:bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-md shadow-brand-blue/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Order</span>
          </button>
          <button
            onClick={loadPortfolio}
            className="p-2 rounded-lg bg-navy-900 border border-navy-800 text-slate-300 hover:text-white"
            title="Refresh Ledger"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading && !portfolio ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <span className="text-xs text-slate-400 font-mono">Loading Virtual Ledger...</span>
        </div>
      ) : portfolio ? (
        <>
          {/* Equity & PnL Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-navy-900 border border-navy-800 rounded-xl p-5 font-mono">
              <span className="text-xs text-slate-400 block">TOTAL PORTFOLIO EQUITY</span>
              <span className="text-2xl font-black text-white mt-1 block">
                {portfolio.currency === 'INR' ? '₹' : '$'}{portfolio.total_equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Cash: {portfolio.currency === 'INR' ? '₹' : '$'}{portfolio.cash_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="bg-navy-900 border border-navy-800 rounded-xl p-5 font-mono">
              <span className="text-xs text-slate-400 block">TOTAL UNREALIZED P&amp;L</span>
              <span className={`text-2xl font-black mt-1 block ${portfolio.total_unrealized_pnl >= 0 ? 'text-gain' : 'text-loss'}`}>
                {portfolio.total_unrealized_pnl > 0 ? '+' : ''}{portfolio.currency === 'INR' ? '₹' : '$'}{portfolio.total_unrealized_pnl.toLocaleString()}
              </span>
              <span className={`text-[10px] font-semibold mt-1 block ${portfolio.total_unrealized_pnl_pct >= 0 ? 'text-gain' : 'text-loss'}`}>
                {portfolio.total_unrealized_pnl_pct > 0 ? '+' : ''}{portfolio.total_unrealized_pnl_pct}%
              </span>
            </div>

            <div className="bg-navy-900 border border-navy-800 rounded-xl p-5 font-mono">
              <span className="text-xs text-slate-400 block">INVESTED CAPITAL</span>
              <span className="text-2xl font-bold text-white mt-1 block">
                {portfolio.currency === 'INR' ? '₹' : '$'}{portfolio.total_invested.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Holdings Value: {portfolio.currency === 'INR' ? '₹' : '$'}{portfolio.current_portfolio_value.toLocaleString()}
              </span>
            </div>

            <div className="bg-navy-900 border border-navy-800 rounded-xl p-5 font-mono">
              <span className="text-xs text-slate-400 block">REALIZED GAINS / LOSSES</span>
              <span className="text-2xl font-bold text-slate-300 mt-1 block">
                {portfolio.currency === 'INR' ? '₹' : '$'}{portfolio.total_realized_pnl.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">Closed Trades Return</span>
            </div>
          </div>

          {/* Holdings Table */}
          <div className="bg-navy-900 border border-navy-800 rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-white mb-3">Open Stock Holdings</h3>
            {portfolio.holdings.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No active stock holdings in this virtual portfolio. Click "New Order" to purchase virtual shares.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-navy-950 text-slate-400 border-b border-navy-800">
                    <tr>
                      <th className="p-3">Asset</th>
                      <th className="p-3">Shares</th>
                      <th className="p-3">Average Cost</th>
                      <th className="p-3">Current Price</th>
                      <th className="p-3">Invested Value</th>
                      <th className="p-3">Current Value</th>
                      <th className="p-3">Unrealized P&amp;L</th>
                      <th className="p-3">Weight</th>
                      <th className="p-3 text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-800 text-slate-200">
                    {portfolio.holdings.map((h) => {
                      const isProfit = h.unrealized_pnl >= 0;
                      return (
                        <tr key={h.symbol} className="hover:bg-navy-850">
                          <td className="p-3">
                            <span className="font-bold text-white block">{h.symbol}</span>
                            <span className="text-[10px] text-slate-400 font-sans block truncate max-w-[120px]">{h.name}</span>
                          </td>
                          <td className="p-3 font-bold">{h.shares}</td>
                          <td className="p-3">{h.average_price.toFixed(2)}</td>
                          <td className="p-3 font-bold text-white">{h.current_price.toFixed(2)}</td>
                          <td className="p-3">{h.invested_value.toLocaleString()}</td>
                          <td className="p-3 font-bold text-white">{h.current_value.toLocaleString()}</td>
                          <td className={`p-3 font-bold ${isProfit ? 'text-gain' : 'text-loss'}`}>
                            {isProfit ? '+' : ''}{h.unrealized_pnl.toLocaleString()} ({isProfit ? '+' : ''}{h.unrealized_pnl_pct}%)
                          </td>
                          <td className="p-3 text-brand-cyan">{h.portfolio_weight_pct}%</td>
                          <td className="p-3 text-right space-x-2">
                            <button
                              onClick={() => handleOpenTrade(h.symbol, 'BUY')}
                              className="px-2 py-1 rounded bg-gain/20 text-gain hover:bg-gain/30 text-[10px] font-bold"
                            >
                              BUY
                            </button>
                            <button
                              onClick={() => handleOpenTrade(h.symbol, 'SELL')}
                              className="px-2 py-1 rounded bg-loss/20 text-loss hover:bg-loss/30 text-[10px] font-bold"
                            >
                              SELL
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Sector Allocation Breakdown */}
          <div className="bg-navy-900 border border-navy-800 rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-white mb-3">Portfolio Asset &amp; Sector Diversification</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {portfolio.sector_allocation.map((sec) => (
                <div key={sec.sector} className="bg-navy-950 p-3 rounded-lg border border-navy-800 font-mono text-xs">
                  <span className="text-slate-400 block text-[11px] truncate">{sec.sector}</span>
                  <span className="text-white font-bold text-base block mt-1">
                    {portfolio.currency === 'INR' ? '₹' : '$'}{sec.value.toLocaleString()}
                  </span>
                  <span className="text-brand-cyan font-semibold text-[10px] block mt-0.5">
                    {sec.weight_pct}% Allocation
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}

      {/* Trade Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-navy-900 border border-navy-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Simulated Order: {tradeSymbol}</h3>
            <p className="text-xs text-slate-400 mb-4 font-mono">
              Execute virtual paper transactions with zero risk.
            </p>

            <div className="space-y-4 text-xs font-mono">
              <div className="flex rounded-lg bg-navy-950 p-1 border border-navy-800">
                <button
                  onClick={() => setTradeType('BUY')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded ${tradeType === 'BUY' ? 'bg-gain text-white' : 'text-slate-400'}`}
                >
                  BUY
                </button>
                <button
                  onClick={() => setTradeType('SELL')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded ${tradeType === 'SELL' ? 'bg-loss text-white' : 'text-slate-400'}`}
                >
                  SELL
                </button>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Stock Symbol</label>
                <input
                  type="text"
                  value={tradeSymbol}
                  onChange={(e) => setTradeSymbol(e.target.value.toUpperCase())}
                  className="w-full bg-navy-950 border border-navy-700 rounded-lg p-2 text-white font-bold uppercase"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Quantity (Shares)</label>
                <input
                  type="number"
                  min="1"
                  value={tradeQuantity}
                  onChange={(e) => setTradeQuantity(Number(e.target.value))}
                  className="w-full bg-navy-950 border border-navy-700 rounded-lg p-2 text-white font-bold"
                />
              </div>

              <div className="bg-navy-950 p-3 rounded-lg text-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span>Price per Share:</span>
                  <span>{tradePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-white">
                  <span>Estimated Total Amount:</span>
                  <span>{(tradePrice * tradeQuantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 rounded-lg bg-navy-800 text-slate-300 hover:bg-navy-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteTrade}
                  disabled={submitting}
                  className="flex-1 py-2 rounded-lg bg-brand-blue hover:bg-blue-600 text-white font-bold"
                >
                  {submitting ? 'Executing...' : 'Confirm Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
