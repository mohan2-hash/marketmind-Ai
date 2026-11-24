import React, { useState, useEffect } from 'react';
import { predictionApi, marketApi } from '../services/api';
import { PredictionData, StockQuote } from '../types';
import { BrainCircuit, Info, Sparkles, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

export const AIPredictionPage: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('RELIANCE');
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRetraining, setIsRetraining] = useState<boolean>(false);

  const supportedSymbols = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'TSLA'];

  useEffect(() => {
    loadPrediction(selectedSymbol);
  }, [selectedSymbol]);

  const loadPrediction = async (sym: string) => {
    setLoading(true);
    try {
      const data = await predictionApi.getPredictions(sym);
      setPrediction(data);
    } catch (err) {
      console.error('Failed to load predictions', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetrain = async () => {
    setIsRetraining(true);
    try {
      await predictionApi.trainModels(selectedSymbol);
      await loadPrediction(selectedSymbol);
      alert(`Model retraining and walk-forward benchmarking completed for ${selectedSymbol}!`);
    } catch (err: any) {
      alert(err.message || 'Retraining failed');
    } finally {
      setIsRetraining(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-brand-cyan" />
            <span>AI Prediction Centre</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Machine Learning Multi-Horizon Forecasts with Empirical Statistical Uncertainty Bands
          </p>
        </div>

        {/* Stock Selector Pill */}
        <div className="flex items-center gap-2 overflow-x-auto bg-navy-900 p-1.5 rounded-xl border border-navy-800">
          {supportedSymbols.map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSymbol(s)}
              className={`text-xs px-3 py-1.5 rounded-lg font-mono font-medium transition-all ${
                selectedSymbol === s
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
          <span className="text-xs text-slate-400 font-mono">Calibrating Walk-Forward Ensembles...</span>
        </div>
      ) : prediction ? (
        <>
          {/* Main Forecast Card */}
          <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-navy-800">
              <div>
                <span className="text-xs font-mono text-slate-400">TARGET ASSET</span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-2xl font-black text-white font-mono">{prediction.symbol}</span>
                  <span className="text-lg font-mono text-slate-300">
                    {prediction.currency === 'INR' ? '₹' : '$'}{prediction.current_price.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right text-xs font-mono">
                  <span className="text-slate-400 block text-[10px]">OPTIMAL ARCHITECTURE</span>
                  <span className="text-brand-cyan font-bold">{prediction.best_model_name}</span>
                </div>
                <button
                  onClick={handleRetrain}
                  disabled={isRetraining}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-navy-950 hover:bg-navy-800 border border-navy-800 text-xs text-slate-200 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRetraining ? 'animate-spin' : ''}`} />
                  <span>{isRetraining ? 'Training...' : 'Retrain Pipeline'}</span>
                </button>
              </div>
            </div>

            {/* Multi Horizon Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
              {prediction.forecasts.map((f) => {
                const isUp = f.direction === 'UP';
                return (
                  <div
                    key={f.horizon}
                    className="bg-navy-950 border border-navy-800/80 rounded-xl p-4 font-mono flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-white">{f.horizon} Window</span>
                        <span className="text-[10px] text-slate-400">{f.forecast_date}</span>
                      </div>

                      <span className="text-xl font-black text-white block mt-2">
                        {prediction.currency === 'INR' ? '₹' : '$'}{f.target_price.toFixed(2)}
                      </span>

                      <div className={`flex items-center text-xs font-bold mt-1 ${isUp ? 'text-gain' : 'text-loss'}`}>
                        {isUp ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
                        <span>
                          {f.expected_change_pct > 0 ? '+' : ''}{f.expected_change_pct}%
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-navy-800/80 text-[10px] text-slate-400 space-y-1">
                      <div className="flex justify-between">
                        <span>80% Interval:</span>
                        <span className="text-slate-300">[{f.lower_bound} - {f.upper_bound}]</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Uncertainty:</span>
                        <span className="text-amber-400 font-bold">{f.uncertainty_level}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Model Benchmark & Feature Importance */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Model Benchmarking Table */}
            <div className="lg:col-span-2 bg-navy-900 border border-navy-800 rounded-xl p-5 shadow-lg">
              <h3 className="text-sm font-bold text-white mb-3">
                Walk-Forward Out-of-Sample Performance Benchmark
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-navy-950 text-slate-400 border-b border-navy-800">
                    <tr>
                      <th className="p-2.5">Architecture</th>
                      <th className="p-2.5">MAE</th>
                      <th className="p-2.5">RMSE</th>
                      <th className="p-2.5">Directional Accuracy</th>
                      <th className="p-2.5">Baseline MAE</th>
                      <th className="p-2.5">Beats Baseline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-800 text-slate-200">
                    {prediction.model_evaluations.map((m, idx) => (
                      <tr key={idx} className="hover:bg-navy-850">
                        <td className="p-2.5 font-bold text-white">{m.model_name}</td>
                        <td className="p-2.5">{m.mae}</td>
                        <td className="p-2.5">{m.rmse}</td>
                        <td className="p-2.5 text-brand-cyan">{m.directional_accuracy_pct}%</td>
                        <td className="p-2.5 text-slate-400">{m.baseline_mae}</td>
                        <td className="p-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] ${
                              m.beats_baseline ? 'bg-gain/20 text-gain' : 'bg-loss/20 text-loss'
                            }`}
                          >
                            {m.beats_baseline ? 'YES' : 'NO'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Feature Importance */}
            <div className="bg-navy-900 border border-navy-800 rounded-xl p-5 shadow-lg">
              <h3 className="text-sm font-bold text-white mb-3">Model Feature Importance</h3>
              <div className="space-y-2.5">
                {prediction.feature_importance.map((f, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-300">{f.feature}</span>
                      <span className="text-brand-cyan font-bold">{(f.importance * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-navy-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-blue rounded-full"
                        style={{ width: `${Math.min(100, f.importance * 300)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Transparency & Disclaimer Box */}
          <div className="bg-navy-900/60 border border-navy-800 rounded-xl p-5 text-xs text-slate-300">
            <span className="font-bold text-brand-cyan block mb-2 font-mono uppercase">
              Model Governance &amp; Limitations Notice
            </span>
            <ul className="list-disc pl-5 space-y-1 text-slate-400 mb-3">
              {prediction.limitations.map((l, idx) => (
                <li key={idx}>{l}</li>
              ))}
            </ul>
            <p className="text-[11px] text-slate-500 font-mono">{prediction.disclaimer}</p>
          </div>
        </>
      ) : null}
    </div>
  );
};
