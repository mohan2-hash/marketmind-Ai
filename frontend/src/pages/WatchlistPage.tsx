import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { watchlistApi } from '../services/api';
import { Watchlist, PriceAlert } from '../types';
import { Bookmark, Bell, Plus, Trash2, TrendingUp, TrendingDown, CheckCircle2 } from 'lucide-react';

export const WatchlistPage: React.FC = () => {
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState<Watchlist | null>(null);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // New stock
  const [newSymbol, setNewSymbol] = useState<string>('');

  // New Alert modal
  const [showAlertModal, setShowAlertModal] = useState<boolean>(false);
  const [alertSymbol, setAlertSymbol] = useState<string>('RELIANCE');
  const [alertTargetPrice, setAlertTargetPrice] = useState<number>(3100);
  const [alertCondition, setAlertCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [wl, al] = await Promise.all([
        watchlistApi.getWatchlist(),
        watchlistApi.getAlerts(),
      ]);
      setWatchlist(wl);
      setAlerts(al);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = async () => {
    if (!newSymbol.trim()) return;
    try {
      await watchlistApi.addSymbol(newSymbol.trim().toUpperCase());
      setNewSymbol('');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to add stock');
    }
  };

  const handleRemoveStock = async (sym: string) => {
    try {
      await watchlistApi.removeSymbol(sym);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to remove stock');
    }
  };

  const handleCreateAlert = async () => {
    try {
      await watchlistApi.createAlert({
        symbol: alertSymbol,
        target_price: alertTargetPrice,
        condition: alertCondition,
      });
      setShowAlertModal(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create alert');
    }
  };

  const handleDeleteAlert = async (id: number) => {
    try {
      await watchlistApi.deleteAlert(id);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete alert');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-brand-cyan" />
            <span>Watchlists &amp; Active Price Alerts</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time tracking of prioritized equities and price threshold notifications
          </p>
        </div>

        <button
          onClick={() => setShowAlertModal(true)}
          className="bg-brand-blue hover:bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-md shadow-brand-blue/20 transition-all"
        >
          <Bell className="w-4 h-4" />
          <span>New Price Alert</span>
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <span className="text-xs text-slate-400 font-mono">Syncing Watchlists &amp; Alerts...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Watchlist Table */}
          <div className="lg:col-span-2 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-navy-800">
              <div>
                <h3 className="text-sm font-bold text-white">Primary Watchlist</h3>
                <span className="text-xs text-slate-400">{watchlist?.items.length || 0} Assets Monitored</span>
              </div>

              {/* Add Symbol Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Symbol (e.g. AAPL)..."
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                  className="bg-navy-950 border border-navy-700 rounded-lg px-3 py-1.5 text-xs text-white uppercase font-mono focus:outline-none focus:border-brand-blue"
                />
                <button
                  onClick={handleAddStock}
                  className="bg-navy-800 hover:bg-navy-700 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-navy-950 text-slate-400 border-b border-navy-800">
                  <tr>
                    <th className="p-3">Asset</th>
                    <th className="p-3">Exchange</th>
                    <th className="p-3">Current Price</th>
                    <th className="p-3">24h Change</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800 text-slate-200">
                  {watchlist?.items.map((item) => {
                    const isUp = item.change_pct >= 0;
                    return (
                      <tr key={item.symbol} className="hover:bg-navy-850">
                        <td
                          onClick={() => navigate(`/stocks/${item.symbol}`)}
                          className="p-3 cursor-pointer"
                        >
                          <span className="font-bold text-white block hover:text-brand-cyan transition-colors">
                            {item.symbol}
                          </span>
                          <span className="text-[10px] text-slate-400 font-sans block truncate max-w-[140px]">
                            {item.name}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400">{item.exchange}</td>
                        <td className="p-3 font-bold text-white">
                          {item.currency === 'INR' ? '₹' : '$'}{item.price.toFixed(2)}
                        </td>
                        <td className={`p-3 font-semibold ${isUp ? 'text-gain' : 'text-loss'}`}>
                          {isUp ? '+' : ''}{item.change_pct.toFixed(2)}%
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleRemoveStock(item.symbol)}
                            className="p-1.5 rounded hover:bg-navy-800 text-slate-400 hover:text-loss transition-colors"
                            title="Remove from watchlist"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Price Alerts */}
          <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-navy-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-brand-cyan" />
                <span>Price Alerts</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">{alerts.length} Active</span>
            </div>

            {alerts.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No price alerts configured. Click "New Price Alert" to create notifications.
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((a) => (
                  <div
                    key={a.id}
                    className="p-3 rounded-xl bg-navy-950 border border-navy-800 font-mono text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{a.symbol}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            a.condition === 'ABOVE' ? 'bg-gain/20 text-gain' : 'bg-loss/20 text-loss'
                          }`}
                        >
                          {a.condition}
                        </span>
                      </div>
                      <span className="text-slate-300 block text-xs mt-1">
                        Target: {a.target_price} (Current: {a.current_price})
                      </span>
                      {a.is_triggered && (
                        <span className="text-amber-400 text-[10px] flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Triggered
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteAlert(a.id)}
                      className="p-1.5 rounded hover:bg-navy-800 text-slate-400 hover:text-loss transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Alert Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-navy-900 border border-navy-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Create Price Alert</h3>
            <p className="text-xs text-slate-400 mb-4 font-mono">
              Get notified when an equity crosses a designated target price.
            </p>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Stock Symbol</label>
                <input
                  type="text"
                  value={alertSymbol}
                  onChange={(e) => setAlertSymbol(e.target.value.toUpperCase())}
                  className="w-full bg-navy-950 border border-navy-700 rounded-lg p-2 text-white font-bold uppercase"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Condition</label>
                <select
                  value={alertCondition}
                  onChange={(e) => setAlertCondition(e.target.value as any)}
                  className="w-full bg-navy-950 border border-navy-700 rounded-lg p-2 text-white"
                >
                  <option value="ABOVE">Price Rises Above Target</option>
                  <option value="BELOW">Price Drops Below Target</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Target Price</label>
                <input
                  type="number"
                  value={alertTargetPrice}
                  onChange={(e) => setAlertTargetPrice(Number(e.target.value))}
                  className="w-full bg-navy-950 border border-navy-700 rounded-lg p-2 text-white font-bold"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAlertModal(false)}
                  className="flex-1 py-2 rounded-lg bg-navy-800 text-slate-300 hover:bg-navy-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAlert}
                  className="flex-1 py-2 rounded-lg bg-brand-blue hover:bg-blue-600 text-white font-bold"
                >
                  Set Alert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
