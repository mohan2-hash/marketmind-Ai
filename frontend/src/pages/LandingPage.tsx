import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  BrainCircuit,
  LineChart,
  ShieldAlert,
  Building2,
  History,
  Scale,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Github,
  BookOpen
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-brand-blue/30 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-navy-800/80 bg-navy-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-cyan flex items-center justify-center shadow-lg shadow-brand-blue/30">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-wide text-white">
              MarketMind <span className="text-brand-cyan font-mono">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/vmohan/marketmind-ai"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-brand-blue hover:bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-md shadow-brand-blue/20 flex items-center gap-1.5"
            >
              <span>Launch Terminal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 border-b border-navy-800/60">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.18),rgba(255,255,255,0))]"></div>
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/30 text-brand-cyan text-xs font-mono font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-POWERED FINANCIAL INTELLIGENCE PLATFORM</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight md:leading-none mb-6">
            Intelligent Stock Analysis &amp;{' '}
            <span className="bg-gradient-to-r from-brand-cyan via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Probabilistic Prediction
            </span>
          </h1>

          <p className="text-base md:text-lg text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            Institutional-grade quantitative analytics, transparent financial health scoring, and machine learning
            forecasting with statistical uncertainty intervals for Indian (NSE/BSE) and US (NASDAQ/NYSE) markets.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gradient-to-r from-brand-blue to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-brand-blue/25 flex items-center gap-2"
            >
              <span>Explore Market Terminal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/predictions')}
              className="bg-navy-900 hover:bg-navy-800 text-slate-200 border border-navy-700 text-sm font-semibold px-6 py-3 rounded-xl transition-all flex items-center gap-2"
            >
              <BrainCircuit className="w-4 h-4 text-brand-cyan" />
              <span>Inspect ML Engine</span>
            </button>
          </div>
        </div>
      </section>

      {/* Dual Market Highlights */}
      <section className="py-16 max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-white mb-2">Dual Market Institutional Coverage</h2>
          <p className="text-sm text-slate-400">Seamlessly navigate between Indian and US capital markets</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* India */}
          <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🇮🇳</span>
                <div>
                  <h3 className="font-bold text-white text-lg">Indian Market (NSE &amp; BSE)</h3>
                  <span className="text-xs text-slate-400 font-mono">Currency: INR (₹)</span>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded bg-navy-800 text-brand-cyan font-mono border border-navy-700">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Full tracking for NIFTY 50, SENSEX, BANK NIFTY, and large caps including RELIANCE, TCS, INFY, HDFCBANK, ICICIBANK, and SBIN.
            </p>
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="bg-navy-950 p-2 rounded-lg border border-navy-800">
                <span className="text-slate-400 block text-[10px]">NIFTY 50</span>
                <span className="text-white font-semibold">24,850.30</span>
                <span className="text-gain block text-[10px]">+0.55%</span>
              </div>
              <div className="bg-navy-950 p-2 rounded-lg border border-navy-800">
                <span className="text-slate-400 block text-[10px]">SENSEX</span>
                <span className="text-white font-semibold">81,320.15</span>
                <span className="text-gain block text-[10px]">+0.51%</span>
              </div>
              <div className="bg-navy-950 p-2 rounded-lg border border-navy-800">
                <span className="text-slate-400 block text-[10px]">BANK NIFTY</span>
                <span className="text-white font-semibold">52,140.80</span>
                <span className="text-loss block text-[10px]">-0.16%</span>
              </div>
            </div>
          </div>

          {/* US */}
          <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🇺🇸</span>
                <div>
                  <h3 className="font-bold text-white text-lg">United States (NASDAQ &amp; NYSE)</h3>
                  <span className="text-xs text-slate-400 font-mono">Currency: USD ($)</span>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded bg-navy-800 text-brand-cyan font-mono border border-navy-700">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Real-time analytics for S&amp;P 500, NASDAQ Composite, Dow Jones, and mega-caps such as AAPL, MSFT, NVDA, GOOGL, AMZN, and TSLA.
            </p>
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="bg-navy-950 p-2 rounded-lg border border-navy-800">
                <span className="text-slate-400 block text-[10px]">S&amp;P 500</span>
                <span className="text-white font-semibold">5,865.40</span>
                <span className="text-gain block text-[10px]">+0.42%</span>
              </div>
              <div className="bg-navy-950 p-2 rounded-lg border border-navy-800">
                <span className="text-slate-400 block text-[10px]">NASDAQ</span>
                <span className="text-white font-semibold">18,518.60</span>
                <span className="text-gain block text-[10px]">+0.61%</span>
              </div>
              <div className="bg-navy-950 p-2 rounded-lg border border-navy-800">
                <span className="text-slate-400 block text-[10px]">DOW JONES</span>
                <span className="text-white font-semibold">42,863.85</span>
                <span className="text-loss block text-[10px]">-0.08%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Capabilities */}
      <section className="py-16 bg-navy-950/60 border-y border-navy-800/80">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-white mb-3">Engineered for Technical &amp; Fundamental Clarity</h2>
            <p className="text-slate-400 text-sm max-w-2xl mx-auto">
              Every metric, ratio, and model prediction is backed by transparent statistical methodologies and empirical error reporting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-navy-900 border border-navy-800/80 p-6 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-brand-blue/15 text-brand-blue flex items-center justify-center mb-4">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base mb-2">Walk-Forward ML Pipeline</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Strict chronological train/test splits that forbid target leakage. Benchmarked against Naive Persistence and Ridge baselines with empirical uncertainty bounds.
              </p>
              <span className="text-[11px] text-brand-cyan font-mono font-medium">1D • 5D • 7D • 30D • 90D Horizons</span>
            </div>

            <div className="bg-navy-900 border border-navy-800/80 p-6 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-4">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base mb-2">4-Pillar Health Score</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Transparent 0-100 rating across Profitability, Solvency, Valuation, and Growth with component weight breakdowns and explicit missing data notifications.
              </p>
              <span className="text-[11px] text-emerald-400 font-mono font-medium">Weighted Composite Scoring</span>
            </div>

            <div className="bg-navy-900 border border-navy-800/80 p-6 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center mb-4">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base mb-2">Quantitative Risk Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Historical simulation calculating 95% Value at Risk (VaR), Conditional VaR (Expected Shortfall), Maximum Drawdowns, Beta, and Sharpe/Sortino ratios.
              </p>
              <span className="text-[11px] text-rose-400 font-mono font-medium">Downside Variance &amp; Beta</span>
            </div>

            <div className="bg-navy-900 border border-navy-800/80 p-6 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center mb-4">
                <LineChart className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base mb-2">Technical Indicator Suite</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Mathematical Wilder RSI, MACD histograms, Bollinger Bands, dynamic support/resistance levels, and automated candlestick pattern detection.
              </p>
              <span className="text-[11px] text-indigo-400 font-mono font-medium">Lightweight Candlestick Charts</span>
            </div>

            <div className="bg-navy-900 border border-navy-800/80 p-6 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-4">
                <History className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base mb-2">Backtesting Laboratory</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Test moving average crossovers, RSI mean reversion, and breakouts with realistic slippage, transaction commission friction, and equity curve visualizer.
              </p>
              <span className="text-[11px] text-amber-400 font-mono font-medium">Friction-Adjusted Alpha</span>
            </div>

            <div className="bg-navy-900 border border-navy-800/80 p-6 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center mb-4">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base mb-2">Portfolio Simulator</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Simulated virtual orders, cash ledger, realized and unrealized profit &amp; loss calculations, holding allocations, and sector concentration analytics.
              </p>
              <span className="text-[11px] text-cyan-400 font-mono font-medium">Zero-Risk Virtual Trading</span>
            </div>
          </div>
        </div>
      </section>

      {/* Risk and Transparency Statement */}
      <section className="py-16 max-w-4xl mx-auto px-6">
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 leading-relaxed">
            <h4 className="font-bold text-amber-400 text-sm mb-1 uppercase tracking-wide">
              Transparency, Governance &amp; Disclaimer
            </h4>
            <p className="mb-2">
              MarketMind AI is an educational, research, and technical analysis platform. Model predictions are generated by statistical machine learning regressors calibrated on chronological historical observations.
            </p>
            <p className="text-slate-400">
              Predictions are never presented as guaranteed future prices or investment advice. The platform explicitly reports out-of-sample error metrics (MAE, RMSE, MAPE) alongside baseline performance to communicate genuine uncertainty.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-navy-800 bg-navy-950 py-8 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-slate-300">MarketMind AI</span> — Intelligent Financial Analytics Platform
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/dashboard')} className="hover:text-white transition-colors">
              Terminal
            </button>
            <button onClick={() => navigate('/learning')} className="hover:text-white transition-colors">
              Learning Centre
            </button>
            <button onClick={() => navigate('/settings')} className="hover:text-white transition-colors">
              API Settings
            </button>
            <a
              href="https://github.com/vmohan/marketmind-ai"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
            >
              GitHub Repository
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
