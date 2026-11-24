import React, { useState, useEffect } from 'react';
import { analyticsApi, marketApi } from '../services/api';
import { FundamentalAnalysis, StockQuote } from '../types';
import { Building2, ShieldCheck, CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react';

export const FundamentalAnalysisPage: React.FC = () => {
  const [symbol, setSymbol] = useState<string>('INFY');
  const [data, setData] = useState<FundamentalAnalysis | null>(null);
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const supportedSymbols = ['INFY', 'TCS', 'RELIANCE', 'HDFCBANK', 'AAPL', 'MSFT', 'NVDA', 'GOOGL'];

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [fin, q] = await Promise.all([
          analyticsApi.getFundamentals(symbol),
          marketApi.getStockQuote(symbol),
        ]);
        setData(fin);
        setQuote(q);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [symbol]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-brand-cyan" />
            <span>Fundamental Analysis &amp; Health Scoring</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Institutional Ratios, Balance Sheet Viability, and 4-Pillar Transparent Health Ratings
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
          <span className="text-xs text-slate-400 font-mono">Aggregating Financial Disclosures...</span>
        </div>
      ) : data && quote ? (
        <>
          {/* Health Score Summary Card */}
          <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-6">
            <div>
              <span className="text-xs font-mono text-slate-400">FINANCIAL HEALTH EVALUATION</span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-4xl font-black text-white font-mono">{data.health_score}</span>
                <span className="text-slate-400 text-sm">/ 100</span>
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                  {data.health_rating}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2 max-w-xl">
                Weighted composite framework evaluating {data.company_name} on Capital Profitability (25%), Solvency &amp; Debt (25%), Valuation (25%), and Growth Traction (25%).
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 min-w-[280px]">
              {data.score_breakdown.map((comp) => (
                <div key={comp.name} className="bg-navy-950 p-3 rounded-xl border border-navy-800 text-xs font-mono">
                  <span className="text-slate-400 block text-[10px] truncate">{comp.name}</span>
                  <span className="text-white font-bold text-sm block mt-0.5">{comp.score}/100</span>
                  <span className="text-emerald-400 text-[10px] block mt-0.5">{comp.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Financial Ratios Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-navy-900 border border-navy-800 rounded-xl p-5 font-mono">
              <span className="text-xs text-slate-400 block">RETURN ON EQUITY (ROE)</span>
              <span className="text-2xl font-bold text-white mt-1 block">{data.metrics.roe}%</span>
              <span className="text-[10px] text-slate-500 mt-1 block">ROCE: {data.metrics.roce}%</span>
            </div>

            <div className="bg-navy-900 border border-navy-800 rounded-xl p-5 font-mono">
              <span className="text-xs text-slate-400 block">OPERATING MARGIN</span>
              <span className="text-2xl font-bold text-gain mt-1 block">{data.metrics.operating_margin}%</span>
              <span className="text-[10px] text-slate-500 mt-1 block">Net Margin: {data.metrics.net_profit_margin}%</span>
            </div>

            <div className="bg-navy-900 border border-navy-800 rounded-xl p-5 font-mono">
              <span className="text-xs text-slate-400 block">DEBT TO EQUITY</span>
              <span className="text-2xl font-bold text-white mt-1 block">{data.metrics.debt_to_equity}</span>
              <span className="text-[10px] text-slate-500 mt-1 block">Current Ratio: {data.metrics.current_ratio}</span>
            </div>

            <div className="bg-navy-900 border border-navy-800 rounded-xl p-5 font-mono">
              <span className="text-xs text-slate-400 block">VALUATION (P/E)</span>
              <span className="text-2xl font-bold text-brand-cyan mt-1 block">{data.metrics.pe_ratio}x</span>
              <span className="text-[10px] text-slate-500 mt-1 block">P/B: {data.metrics.pb_ratio}x</span>
            </div>
          </div>

          {/* Strengths & Risks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-navy-900 border border-navy-800 rounded-xl p-5 shadow-lg">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gain" />
                <span>Fundamental Moats &amp; Strengths</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {data.strengths.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-gain font-bold">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-navy-900 border border-navy-800 rounded-xl p-5 shadow-lg">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Identified Financial &amp; Valuation Vulnerabilities</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {data.risks.map((r, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Multi-Year Financial Statements Table */}
          <div className="bg-navy-900 border border-navy-800 rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-white mb-3">Multi-Year Statement of Accounts</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-navy-950 text-slate-400 border-b border-navy-800">
                  <tr>
                    <th className="p-2.5">Financial Year</th>
                    <th className="p-2.5">Revenue ({data.currency})</th>
                    <th className="p-2.5">Net Income</th>
                    <th className="p-2.5">Free Cash Flow</th>
                    <th className="p-2.5">Long-Term Debt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800 text-slate-200">
                  {data.annual_financials.map((row, idx) => (
                    <tr key={idx} className="hover:bg-navy-850">
                      <td className="p-2.5 font-bold text-white">{row.year}</td>
                      <td className="p-2.5">{row.revenue.toLocaleString()}</td>
                      <td className="p-2.5 text-gain">{row.net_profit.toLocaleString()}</td>
                      <td className="p-2.5 text-brand-cyan">{row.free_cash_flow.toLocaleString()}</td>
                      <td className="p-2.5 text-slate-400">{row.debt.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
