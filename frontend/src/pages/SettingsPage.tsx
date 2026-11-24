import React, { useState, useEffect } from 'react';
import { Settings, Key, Globe, Shield, Database, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

export const SettingsPage: React.FC = () => {
  const [defaultMarket, setDefaultMarket] = useState<'IN' | 'US'>('IN');
  const [twelveDataKey, setTwelveDataKey] = useState<string>('');
  const [alphaVantageKey, setAlphaVantageKey] = useState<string>('');
  const [finnhubKey, setFinnhubKey] = useState<string>('');
  const [geminiKey, setGeminiKey] = useState<string>('');

  const [backendStatus, setBackendStatus] = useState<string>('Testing...');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    // Check backend health
    axios
      .get('/api/health')
      .then((res) => setBackendStatus(res.data.status === 'healthy' ? 'Online & Healthy' : 'Degraded'))
      .catch(() => setBackendStatus('Offline / Unreachable'));

    // Load persisted local config
    const storedMarket = localStorage.getItem('marketmind_market');
    if (storedMarket === 'IN' || storedMarket === 'US') setDefaultMarket(storedMarket);

    setTwelveDataKey(localStorage.getItem('marketmind_twelvedata_key') || '');
    setAlphaVantageKey(localStorage.getItem('marketmind_alphavantage_key') || '');
    setFinnhubKey(localStorage.getItem('marketmind_finnhub_key') || '');
    setGeminiKey(localStorage.getItem('marketmind_gemini_key') || '');
  }, []);

  const handleSave = () => {
    localStorage.setItem('marketmind_market', defaultMarket);
    localStorage.setItem('marketmind_twelvedata_key', twelveDataKey);
    localStorage.setItem('marketmind_alphavantage_key', alphaVantageKey);
    localStorage.setItem('marketmind_finnhub_key', finnhubKey);
    localStorage.setItem('marketmind_gemini_key', geminiKey);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-brand-cyan" />
          <span>User Profile &amp; Engine Settings</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure API credentials, market jurisdiction preferences, and platform runtime options
        </p>
      </div>

      {/* Backend Status Card */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-brand-cyan" />
          <div>
            <h3 className="text-sm font-bold text-white">FastAPI Backend &amp; SQLite/PostgreSQL Engine</h3>
            <span className="text-xs text-slate-400 font-mono">http://127.0.0.1:8000/api</span>
          </div>
        </div>
        <span
          className={`text-xs px-3 py-1 rounded-full font-mono font-bold ${
            backendStatus.includes('Healthy') ? 'bg-gain/20 text-gain' : 'bg-loss/20 text-loss'
          }`}
        >
          {backendStatus}
        </span>
      </div>

      {/* Preferences Form */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div>
          <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <Globe className="w-4 h-4 text-brand-blue" />
            <span>Market Jurisdiction Preference</span>
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <button
              type="button"
              onClick={() => setDefaultMarket('IN')}
              className={`p-3 rounded-xl border text-left transition-all ${
                defaultMarket === 'IN'
                  ? 'bg-brand-blue/20 border-brand-blue text-white shadow'
                  : 'bg-navy-950 border-navy-800 text-slate-400 hover:text-white'
              }`}
            >
              <span className="text-base block mb-1">🇮🇳 India</span>
              <span>National Stock Exchange (NSE) &amp; BSE</span>
            </button>
            <button
              type="button"
              onClick={() => setDefaultMarket('US')}
              className={`p-3 rounded-xl border text-left transition-all ${
                defaultMarket === 'US'
                  ? 'bg-brand-blue/20 border-brand-blue text-white shadow'
                  : 'bg-navy-950 border-navy-800 text-slate-400 hover:text-white'
              }`}
            >
              <span className="text-base block mb-1">🇺🇸 United States</span>
              <span>NASDAQ &amp; New York Stock Exchange (NYSE)</span>
            </button>
          </div>
        </div>

        {/* API Credentials */}
        <div className="pt-4 border-t border-navy-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-brand-cyan" />
            <span>External Market-Data Provider Credentials (Optional)</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            MarketMind AI operates out-of-the-box in <strong className="text-amber-400">Deterministic Demo Mode</strong> with rich realistic historical datasets. If you have provider API keys, enter them here to query live provider endpoints.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">Twelve Data API Key</label>
              <input
                type="password"
                placeholder="twelve_data_api_key_..."
                value={twelveDataKey}
                onChange={(e) => setTwelveDataKey(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 rounded-lg p-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Alpha Vantage API Key</label>
              <input
                type="password"
                placeholder="alphavantage_key_..."
                value={alphaVantageKey}
                onChange={(e) => setAlphaVantageKey(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 rounded-lg p-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Finnhub Stock API Key</label>
              <input
                type="password"
                placeholder="finnhub_token_..."
                value={finnhubKey}
                onChange={(e) => setFinnhubKey(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 rounded-lg p-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Google Gemini API Key (for LLM Assistant)</label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 rounded-lg p-2 text-white"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-4 border-t border-navy-800">
          {savedSuccess ? (
            <span className="text-xs text-gain flex items-center gap-1 font-mono">
              <CheckCircle2 className="w-4 h-4" /> Preferences saved successfully!
            </span>
          ) : (
            <span></span>
          )}

          <button
            onClick={handleSave}
            className="bg-brand-blue hover:bg-blue-600 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md shadow-brand-blue/20 transition-all"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
