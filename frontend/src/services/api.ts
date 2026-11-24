import axios from 'axios';
import {
  StockQuote,
  MarketOverview,
  HistoricalData,
  TechnicalAnalysis,
  FundamentalAnalysis,
  RiskMetrics,
  PredictionData,
  BacktestResult,
  PortfolioSummary,
  Watchlist,
  PriceAlert,
  NewsArticle,
  LearningModule
} from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const marketApi = {
  getOverview: async (market: 'IN' | 'US' = 'IN', forceDemo: boolean = false) => {
    const res = await api.get<MarketOverview>('/markets/overview', {
      params: { market, force_demo: forceDemo },
    });
    return res.data;
  },

  searchStocks: async (query: string, market?: string) => {
    const res = await api.get<StockQuote[]>('/stocks/search', {
      params: { q: query, market },
    });
    return res.data;
  },

  getStockQuote: async (symbol: string, forceDemo: boolean = false) => {
    const res = await api.get<StockQuote>(`/stocks/${symbol}`, {
      params: { force_demo: forceDemo },
    });
    return res.data;
  },

  getStockHistory: async (symbol: string, timeframe: string = '1Y', forceDemo: boolean = false) => {
    const res = await api.get<HistoricalData>(`/stocks/${symbol}/history`, {
      params: { timeframe, force_demo: forceDemo },
    });
    return res.data;
  },

  getNews: async (symbol: string, limit: number = 10) => {
    const res = await api.get<NewsArticle[]>(`/stocks/${symbol}/news`, {
      params: { limit },
    });
    return res.data;
  },
};

export const analyticsApi = {
  getTechnicalIndicators: async (symbol: string) => {
    const res = await api.get<TechnicalAnalysis>(`/analytics/indicators/${symbol}`);
    return res.data;
  },

  getFundamentals: async (symbol: string) => {
    const res = await api.get<FundamentalAnalysis>(`/analytics/fundamentals/${symbol}`);
    return res.data;
  },

  getRiskMetrics: async (symbol: string, benchmark?: string) => {
    const res = await api.get<RiskMetrics>(`/analytics/risk/${symbol}`, {
      params: { benchmark },
    });
    return res.data;
  },

  runBacktest: async (payload: {
    symbol: string;
    strategy: string;
    initial_capital: number;
    commission_pct?: number;
    slippage_pct?: number;
    parameters?: Record<string, any>;
  }) => {
    const res = await api.post<BacktestResult>('/analytics/backtests/run', payload);
    return res.data;
  },
};

export const predictionApi = {
  getPredictions: async (symbol: string) => {
    const res = await api.get<PredictionData>(`/predictions/${symbol}`);
    return res.data;
  },

  trainModels: async (symbol: string) => {
    const res = await api.post(`/predictions/train`, { symbol });
    return res.data;
  },
};

export const portfolioApi = {
  getPortfolio: async () => {
    const res = await api.get<PortfolioSummary>('/portfolio');
    return res.data;
  },

  createTransaction: async (payload: {
    symbol: string;
    transaction_type: 'BUY' | 'SELL';
    quantity: number;
    price?: number;
    notes?: string;
  }) => {
    const res = await api.post('/portfolio/transactions', payload);
    return res.data;
  },
};

export const watchlistApi = {
  getWatchlist: async () => {
    const res = await api.get<Watchlist>('/watchlists');
    return res.data;
  },

  addSymbol: async (symbol: string) => {
    const res = await api.post('/watchlists/items', { symbol });
    return res.data;
  },

  removeSymbol: async (symbol: string) => {
    const res = await api.delete(`/watchlists/items/${symbol}`);
    return res.data;
  },

  getAlerts: async () => {
    const res = await api.get<PriceAlert[]>('/alerts');
    return res.data;
  },

  createAlert: async (payload: { symbol: string; target_price: number; condition: 'ABOVE' | 'BELOW' }) => {
    const res = await api.post<PriceAlert>('/alerts', payload);
    return res.data;
  },

  deleteAlert: async (id: number) => {
    const res = await api.delete(`/alerts/${id}`);
    return res.data;
  },
};

export const assistantApi = {
  sendMessage: async (message: string, symbol?: string) => {
    const res = await api.post<{
      reply: string;
      symbol?: string;
      data_timestamp: string;
      sources_cited: string[];
      disclaimer: string;
    }>('/assistant/chat', { message, symbol });
    return res.data;
  },
};

export const learningApi = {
  getModules: async () => {
    const res = await api.get<LearningModule[]>('/learning/modules');
    return res.data;
  },
};

export default api;
