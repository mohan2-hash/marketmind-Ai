import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { marketApi, analyticsApi, predictionApi, portfolioApi, watchlistApi } from '../services/api';
import {
  StockQuote,
  HistoricalData,
  TechnicalAnalysis,
  FundamentalAnalysis,
  RiskMetrics,
  PredictionData,
  NewsArticle
} from '../types';
import { TradingViewChart } from '../components/TradingViewChart';
import {
  TrendingUp,
  TrendingDown,
  Bookmark,
  Bell,
  Briefcase,
  BrainCircuit,
  Building2,
  LineChart,
  ShieldAlert,
  Newspaper,
  Info,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const StockDetailPage: React.FC = () => {
  const { symbol = 'RELIANCE' } = useParams<{ symbol: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'chart' | 'technical' | 'fundamentals' | 'predictions' | 'risk' | 'news'>('chart');
  const [timeframe, setTimeframe] = useState<string>('1Y');

  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [history, setHistory] = useState<HistoricalData | null>(null);
  const [technical, setTechnical] = useState<TechnicalAnalysis | null>(null);
  const [fundamental, setFundamental] = useState<FundamentalAnalysis | null>(null);
  const [risk, setRisk] = useState<RiskMetrics | null>(null);
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Trade Modal State
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [tradeQuantity, setTradeQuantity] = useState<number>(10);
  const [tradeMessage, setTradeMessage] = useState<string | null>(null);

  // Watchlist & Alert state
  const [watchlistSuccess, setWatchlistSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadStockData = async () => {
      setLoading(true);
      try {
        const [q, h] = await Promise.all([
          marketApi.getStockQuote(symbol),
          marketApi.getStockHistory(symbol, timeframe),
        ]);
        setQuote(q);
        setHistory(h);

        // Fetch remaining analytics asynchronously
        analyticsApi.getTechnicalIndicators(symbol).then(setTechnical).catch(console.error);
        analyticsApi.getFundamentals(symbol).then(setFundamental).catch(console.error);
        analyticsApi.getRiskMetrics(symbol).then(setRisk).catch(console.error);
        predictionApi.getPredictions(symbol).then(setPrediction).catch(console.error);
        marketApi.getNews(symbol).then(setNews).catch(console.error);
      } catch (err) {
        console.error('Failed to load stock detail', err);
      } finally {
        setLoading(false);
      }
    };
    loadStockData();
  }, [symbol, timeframe]);

  const handleAddToWatchlist = async () => {
    try {
      await watchlistApi.addSymbol(symbol);
      setWatchlistSuccess('Added to Watchlist!');
      setTimeout(() => setWatchlistSuccess(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to add to watchlist');
    }
  };

  const handleExecuteTrade = async () => {
    try {
      await portfolioApi.createTransaction({
        symbol,
        transaction_type: tradeType,
        quantity: tradeQuantity,
        price: quote?.price,
      });
      setTradeMessage(`Successfully executed ${tradeType} for ${tradeQuantity} shares of ${symbol}!`);
      setTimeout(() => {
        setTradeMessage(null);
        setShowTradeModal(false);
      }, 2000);
    } catch (err: any) {
      alert(err.response?.data?.detail || err.message || 'Trade failed');
    }
  };

  if (loading && !quote) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-mono text-slate-400">Loading {symbol} Analytics...</span>
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="p-6 bg-loss/10 border border-loss/30 rounded-xl text-loss text-sm">
        Stock quote for {symbol} not found.
      </div>
    );
  }

  const isUp = quote.change_pct >= 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-navy-800">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-white tracking-tight">{quote.symbol}</h1>
              <span className="text-xs px-2.5 py-0.5 rounded bg-navy-950 font-mono text-slate-300 border border-navy-800">
                {quote.exchange}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded bg-navy-950 font-mono text-brand-cyan border border-navy-800">
                {quote.market === 'IN' ? 'NSE / BSE' : 'NASDAQ / NYSE'}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1 font-medium">{quote.name}</p>
            <span className="text-xs text-slate-500 font-mono">
              {quote.sector} • {quote.industry}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleAddToWatchlist}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-navy-950 hover:bg-navy-800 border border-navy-800 text-xs font-medium text-slate-200 transition-colors"
            >
              <Bookmark className="w-4 h-4 text-brand-cyan" />
              <span>{watchlistSuccess || 'Watchlist'}</span>
            </button>
            <button
              onClick={() => setShowTradeModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-blue hover:bg-blue-600 text-white text-xs font-semibold shadow-md shadow-brand-blue/20 transition-all"
            >
              <Briefcase className="w-4 h-4" />
              <span>Simulate Trade</span>
            </button>
          </div>
        </div>

        {/* Live Price Statistics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 pt-4 text-xs font-mono">
          <div>
            <span className="text-slate-400 block text-[10px]">CURRENT PRICE</span>
            <span className="text-2xl font-bold text-white block mt-0.5">
              {quote.currency === 'INR' ? '₹' : '$'}{quote.price.toFixed(2)}
            </span>
            <div className={`flex items-center text-xs font-semibold mt-0.5 ${isUp ? 'text-gain' : 'text-loss'}`}>
              {isUp ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
              <span>
                {isUp ? '+' : ''}{quote.change.toFixed(2)} ({isUp ? '+' : ''}{quote.change_pct.toFixed(2)}%)
              </span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px]">DAY RANGE</span>
            <span className="text-slate-200 font-semibold block mt-1">
              {quote.day_low.toFixed(2)} - {quote.day_high.toFixed(2)}
            </span>
            <span className="text-slate-500 text-[10px] block mt-0.5">Open: {quote.open.toFixed(2)}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px]">52-WEEK RANGE</span>
            <span className="text-slate-200 font-semibold block mt-1">
              {quote.year_low.toFixed(2)} - {quote.year_high.toFixed(2)}
            </span>
            <span className="text-slate-500 text-[10px] block mt-0.5">Prev Close: {quote.previous_close.toFixed(2)}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px]">VOLUME</span>
            <span className="text-slate-200 font-semibold block mt-1">
              {(quote.volume / 1000000).toFixed(2)}M
            </span>
            <span className="text-slate-500 text-[10px] block mt-0.5">Shares Traded</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px]">P/E RATIO</span>
            <span className="text-slate-200 font-semibold block mt-1">
              {quote.pe_ratio ? `${quote.pe_ratio}x` : 'N/A'}
            </span>
            <span className="text-slate-500 text-[10px] block mt-0.5">Div Yield: {quote.dividend_yield || 0}%</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px]">DATA SOURCE</span>
            <span className="text-brand-cyan font-semibold block mt-1">{quote.provider}</span>
            <span className="text-slate-500 text-[10px] block mt-0.5">{quote.data_status}</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-navy-800 pb-2 text-xs font-medium">
        {[
          { id: 'chart', label: 'Interactive Chart', icon: LineChart },
          { id: 'technical', label: 'Technical Indicators', icon: LineChart },
          { id: 'fundamentals', label: 'Fundamentals & Health', icon: Building2 },
          { id: 'predictions', label: 'AI Prediction Centre', icon: BrainCircuit },
          { id: 'risk', label: 'Quantitative Risk', icon: ShieldAlert },
          { id: 'news', label: 'News & Sentiment', icon: Newspaper },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-brand-blue text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-navy-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Chart View */}
      {activeTab === 'chart' && history && (
        <div className="space-y-4">
          <TradingViewChart
            candles={history.candles}
            symbol={quote.symbol}
            currency={quote.currency}
            timeframe={timeframe}
            onTimeframeChange={setTimeframe}
          />
          {quote.description && (
            <div className="bg-navy-900 border border-navy-800 rounded-xl p-5 text-xs text-slate-300 leading-relaxed">
              <h4 className="font-bold text-white mb-2 text-sm">About {quote.name}</h4>
              <p>{quote.description}</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Technical Analysis */}
      {activeTab === 'technical' && technical && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-navy-900 border border-navy-800 rounded-xl p-5">
              <span className="text-xs text-slate-400 block font-mono">14-DAY RSI</span>
              <span className="text-2xl font-bold font-mono text-white mt-1 block">
                {technical.rsi_14}
              </span>
              <span
                className={`text-xs font-mono font-semibold px-2 py-0.5 rounded inline-block mt-2 ${
                  technical.rsi_signal === 'OVERSOLD'
                    ? 'bg-gain/20 text-gain'
                    : technical.rsi_signal === 'OVERBOUGHT'
                    ? 'bg-loss/20 text-loss'
                    : 'bg-navy-800 text-slate-300'
                }`}
              >
                {technical.rsi_signal}
              </span>
            </div>

            <div className="bg-navy-900 border border-navy-800 rounded-xl p-5">
              <span className="text-xs text-slate-400 block font-mono">MACD (12, 26, 9)</span>
              <span className="text-2xl font-bold font-mono text-white mt-1 block">
                {technical.macd}
              </span>
              <span className="text-xs text-slate-400 block mt-1">Signal: {technical.macd_signal}</span>
              <span className="text-[11px] text-brand-cyan font-mono block mt-1">{technical.macd_trend}</span>
            </div>

            <div className="bg-navy-900 border border-navy-800 rounded-xl p-5">
              <span className="text-xs text-slate-400 block font-mono">BOLLINGER (20, 2σ)</span>
              <span className="text-xs text-slate-300 font-mono block mt-1">Upper: {technical.bollinger_upper}</span>
              <span className="text-xs text-slate-300 font-mono block">Mid: {technical.bollinger_middle}</span>
              <span className="text-xs text-slate-300 font-mono block">Lower: {technical.bollinger_lower}</span>
            </div>

            <div className="bg-navy-900 border border-navy-800 rounded-xl p-5">
              <span className="text-xs text-slate-400 block font-mono">OVERALL CONSENSUS</span>
              <span
                className={`text-xl font-bold font-mono mt-1 block ${
                  technical.overall_sentiment.includes('BUY')
                    ? 'text-gain'
                    : technical.overall_sentiment.includes('SELL')
                    ? 'text-loss'
                    : 'text-amber-400'
                }`}
              >
                {technical.overall_sentiment.replace('_', ' ')}
              </span>
              <span className="text-[11px] text-slate-400 mt-2 block">ATR: {technical.atr_14}</span>
            </div>
          </div>

          {/* Support & Resistance & Detected Patterns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-navy-900 border border-navy-800 rounded-xl p-5">
              <h4 className="text-sm font-bold text-white mb-3">Support &amp; Resistance Levels</h4>
              <div className="space-y-2">
                {technical.support_resistance.map((lvl, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 rounded bg-navy-950 font-mono text-xs">
                    <span className={lvl.type === 'RESISTANCE' ? 'text-loss' : 'text-gain'}>
                      {lvl.type}
                    </span>
                    <span className="text-white font-bold">{lvl.price}</span>
                    <span className="text-slate-400 text-[10px]">Tested: {lvl.tested_count}x</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-navy-900 border border-navy-800 rounded-xl p-5">
              <h4 className="text-sm font-bold text-white mb-3">Detected Candlestick Patterns</h4>
              {technical.detected_patterns.length === 0 ? (
                <p className="text-xs text-slate-400">No classic patterns detected in the immediate 3 sessions.</p>
              ) : (
                <div className="space-y-2">
                  {technical.detected_patterns.map((p, idx) => (
                    <div key={idx} className="p-2.5 rounded bg-navy-950 border border-navy-800/80">
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-white">{p.name}</span>
                        <span className={p.type === 'BULLISH' ? 'text-gain' : 'text-loss'}>{p.type}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{p.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Educational Note */}
          <div className="bg-navy-900/60 border border-navy-800 rounded-xl p-4 text-xs text-slate-400 leading-relaxed">
            <p className="mb-1">{technical.educational_summary.rsi_explanation}</p>
            <p className="mb-1">{technical.educational_summary.macd_explanation}</p>
            <p className="text-slate-500 text-[10px]">{technical.educational_summary.disclaimer}</p>
          </div>
        </div>
      )}

      {/* Tab 3: Fundamental Analysis */}
      {activeTab === 'fundamentals' && fundamental && (
        <div className="space-y-6">
          {/* Health Score Overview */}
          <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-6">
            <div>
              <span className="text-xs text-slate-400 font-mono block">MARKETMIND FINANCIAL HEALTH SCORE</span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-4xl font-extrabold text-white font-mono">{fundamental.health_score}</span>
                <span className="text-slate-400 text-sm">/ 100</span>
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                  {fundamental.health_rating}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2 max-w-xl">
                Composite transparent assessment weighted evenly across Profitability (25%), Solvency (25%), Valuation (25%), and Growth (25%).
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 min-w-[280px]">
              {fundamental.score_breakdown.map((comp) => (
                <div key={comp.name} className="bg-navy-950 p-2.5 rounded-lg border border-navy-800 text-xs font-mono">
                  <span className="text-slate-400 block text-[10px] truncate">{comp.name}</span>
                  <span className="text-white font-bold text-sm">{comp.score}/100</span>
                  <span className="text-emerald-400 text-[10px] block">{comp.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Risks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-navy-900 border border-navy-800 rounded-xl p-5">
              <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gain" />
                <span>Identified Business Strengths</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {fundamental.strengths.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-gain">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-navy-900 border border-navy-800 rounded-xl p-5">
              <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Identified Fundamental Risks</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {fundamental.risks.map((r, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Quarterly Results */}
          <div className="bg-navy-900 border border-navy-800 rounded-xl p-5">
            <h4 className="text-sm font-bold text-white mb-3">Quarterly Performance Trend</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-navy-950 text-slate-400 border-b border-navy-800">
                  <tr>
                    <th className="p-2.5">Period</th>
                    <th className="p-2.5">Revenue ({fundamental.currency})</th>
                    <th className="p-2.5">Net Profit</th>
                    <th className="p-2.5">Operating Margin</th>
                    <th className="p-2.5">EPS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800 text-slate-200">
                  {fundamental.quarterly_results.map((q, idx) => (
                    <tr key={idx} className="hover:bg-navy-850">
                      <td className="p-2.5 font-bold text-white">{q.period}</td>
                      <td className="p-2.5">{q.revenue.toLocaleString()}</td>
                      <td className="p-2.5">{q.net_profit.toLocaleString()}</td>
                      <td className="p-2.5 text-gain">{q.operating_margin_pct}%</td>
                      <td className="p-2.5">{q.eps}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: AI Predictions */}
      {activeTab === 'predictions' && prediction && (
        <div className="space-y-6">
          <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-brand-cyan" />
                  <span>Machine Learning Multi-Horizon Forecasts</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Selected Best Architecture: <span className="font-mono text-brand-cyan">{prediction.best_model_name}</span> | Calibrated: {prediction.last_training_date}
                </p>
              </div>

              <button
                onClick={() => predictionApi.trainModels(symbol).then(() => alert('Models Retrained!'))}
                className="text-xs px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-700 font-mono"
              >
                Retrain Models
              </button>
            </div>

            {/* Forecast Horizons Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {prediction.forecasts.map((f) => {
                const isUp = f.direction === 'UP';
                return (
                  <div key={f.horizon} className="bg-navy-950 border border-navy-800 rounded-xl p-4 font-mono">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-white">{f.horizon} Forecast</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${f.uncertainty_level === 'LOW' ? 'bg-gain/20 text-gain' : 'bg-amber-500/20 text-amber-400'}`}>
                        {f.uncertainty_level}
                      </span>
                    </div>

                    <span className="text-lg font-bold text-white block mt-1">
                      {prediction.currency === 'INR' ? '₹' : '$'}{f.target_price.toFixed(2)}
                    </span>
                    <span className={`text-xs font-semibold block ${isUp ? 'text-gain' : 'text-loss'}`}>
                      {f.expected_change_pct > 0 ? '+' : ''}{f.expected_change_pct}%
                    </span>

                    <div className="mt-3 pt-2 border-t border-navy-800 text-[10px] text-slate-400">
                      <span>80% Interval:</span>
                      <span className="block text-slate-300 font-bold">
                        [{f.lower_bound} - {f.upper_bound}]
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Model Evaluation Table */}
          <div className="bg-navy-900 border border-navy-800 rounded-xl p-5">
            <h4 className="text-sm font-bold text-white mb-3">Out-of-Sample Walk-Forward Validation Benchmark</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-navy-950 text-slate-400 border-b border-navy-800">
                  <tr>
                    <th className="p-2.5">Model Architecture</th>
                    <th className="p-2.5">MAE</th>
                    <th className="p-2.5">RMSE</th>
                    <th className="p-2.5">MAPE</th>
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
                      <td className="p-2.5">{m.mape}%</td>
                      <td className="p-2.5 text-brand-cyan">{m.directional_accuracy_pct}%</td>
                      <td className="p-2.5 text-slate-400">{m.baseline_mae}</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${m.beats_baseline ? 'bg-gain/20 text-gain' : 'bg-loss/20 text-loss'}`}>
                          {m.beats_baseline ? 'YES' : 'NO'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Limitations & Disclaimer */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5 text-xs text-slate-300">
            <span className="font-bold text-amber-400 block mb-1">LIMITATIONS &amp; TRANSPARENCY</span>
            <ul className="list-disc pl-4 space-y-1 mb-2">
              {prediction.limitations.map((l, idx) => (
                <li key={idx}>{l}</li>
              ))}
            </ul>
            <p className="text-[11px] text-slate-400">{prediction.disclaimer}</p>
          </div>
        </div>
      )}

      {/* Tab 5: Quantitative Risk */}
      {activeTab === 'risk' && risk && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-navy-900 border border-navy-800 rounded-xl p-5 font-mono">
              <span className="text-xs text-slate-400 block">ANNUALIZED VOLATILITY</span>
              <span className="text-2xl font-bold text-white mt-1 block">{risk.annualized_volatility}%</span>
              <span className="text-[10px] text-slate-500 mt-1 block">Benchmark: {risk.benchmark_volatility}%</span>
            </div>

            <div className="bg-navy-900 border border-navy-800 rounded-xl p-5 font-mono">
              <span className="text-xs text-slate-400 block">BETA vs BENCHMARK</span>
              <span className="text-2xl font-bold text-white mt-1 block">{risk.beta}</span>
              <span className="text-[10px] text-slate-500 mt-1 block">vs {risk.benchmark_symbol}</span>
            </div>

            <div className="bg-navy-900 border border-navy-800 rounded-xl p-5 font-mono">
              <span className="text-xs text-slate-400 block">SHARPE RATIO</span>
              <span className="text-2xl font-bold text-white mt-1 block">{risk.sharpe_ratio}</span>
              <span className="text-[10px] text-slate-500 mt-1 block">Sortino: {risk.sortino_ratio}</span>
            </div>

            <div className="bg-navy-900 border border-navy-800 rounded-xl p-5 font-mono">
              <span className="text-xs text-slate-400 block">MAX DRAWDOWN</span>
              <span className="text-2xl font-bold text-loss mt-1 block">-{risk.max_drawdown_pct}%</span>
              <span className="text-[10px] text-slate-500 mt-1 block">VaR(95%): {risk.var_95}%</span>
            </div>
          </div>

          <div className="bg-navy-900 border border-navy-800 rounded-xl p-5">
            <h4 className="text-sm font-bold text-white mb-2">Risk Officer Commentary &amp; Warnings</h4>
            <ul className="space-y-2 text-xs text-slate-300">
              {risk.warnings.map((w, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-400">•</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Tab 6: News */}
      {activeTab === 'news' && (
        <div className="space-y-4">
          {news.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No recent news available.</div>
          ) : (
            news.map((item) => (
              <div key={item.id} className="bg-navy-900 border border-navy-800 rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-brand-cyan">{item.source}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${item.sentiment === 'POSITIVE' ? 'bg-gain/20 text-gain' : 'bg-navy-800 text-slate-400'}`}>
                    {item.sentiment} ({item.sentiment_score > 0 ? '+' : ''}{item.sentiment_score})
                  </span>
                </div>
                <h4 className="font-bold text-white text-sm">{item.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{item.summary}</p>
                <span className="text-[10px] text-slate-500 font-mono">{item.published_at}</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Trade Simulation Modal */}
      {showTradeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-navy-900 border border-navy-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Simulated Virtual Order</h3>
            <p className="text-xs text-slate-400 mb-4 font-mono">
              Execute virtual paper trades at live market prices with zero financial risk.
            </p>

            <div className="space-y-4">
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
                <label className="text-xs text-slate-400 block mb-1">Shares Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={tradeQuantity}
                  onChange={(e) => setTradeQuantity(Number(e.target.value))}
                  className="w-full bg-navy-950 border border-navy-700 rounded-lg p-2 text-sm text-white font-mono"
                />
              </div>

              <div className="bg-navy-950 p-3 rounded-lg text-xs font-mono text-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span>Price per Share:</span>
                  <span>{quote.currency === 'INR' ? '₹' : '$'}{quote.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-white">
                  <span>Estimated Total:</span>
                  <span>{quote.currency === 'INR' ? '₹' : '$'}{(quote.price * tradeQuantity).toFixed(2)}</span>
                </div>
              </div>

              {tradeMessage && (
                <div className="p-2 text-center text-xs font-semibold text-gain bg-gain/10 rounded border border-gain/20">
                  {tradeMessage}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowTradeModal(false)}
                  className="flex-1 py-2 rounded-lg bg-navy-800 text-slate-300 text-xs hover:bg-navy-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteTrade}
                  className="flex-1 py-2 rounded-lg bg-brand-blue hover:bg-blue-600 text-white text-xs font-bold"
                >
                  Confirm Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
