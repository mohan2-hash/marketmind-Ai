export interface StockQuote {
  symbol: str;
  name: str;
  exchange: str;
  market: 'IN' | 'US';
  currency: string;
  sector?: string;
  industry?: string;
  description?: string;
  price: number;
  previous_close: number;
  open: number;
  day_high: number;
  day_low: number;
  volume: number;
  change: number;
  change_pct: number;
  year_high: number;
  year_low: number;
  market_cap?: number;
  pe_ratio?: number;
  dividend_yield?: number;
  provider: string;
  data_timestamp: string;
  data_status: 'DEMO' | 'REAL_DELAYED' | 'REAL_EOD';
}

export type str = string;

export interface MarketIndexItem {
  symbol: string;
  name: string;
  exchange: string;
  market: string;
  value: number;
  change: number;
  change_pct: number;
  data_status: string;
  timestamp: string;
}

export interface MarketOverview {
  market: 'IN' | 'US';
  indices: MarketIndexItem[];
  top_gainers: StockQuote[];
  top_losers: StockQuote[];
  most_active: StockQuote[];
  sector_performance: Record<string, number>;
  market_status: string;
  last_updated: string;
  data_mode: 'DEMO' | 'REAL';
}

export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface HistoricalData {
  symbol: string;
  exchange: string;
  currency: string;
  timeframe: string;
  provider: string;
  data_mode: string;
  candles: Candle[];
}

export interface TechnicalAnalysis {
  symbol: string;
  latest_price: number;
  rsi_14: number;
  rsi_signal: 'OVERSOLD' | 'NEUTRAL' | 'OVERBOUGHT';
  macd: number;
  macd_signal: number;
  macd_histogram: number;
  macd_trend: string;
  sma_20: number;
  sma_50: number;
  sma_200: number;
  ema_20: number;
  bollinger_upper: number;
  bollinger_middle: number;
  bollinger_lower: number;
  atr_14: number;
  stochastic_k: number;
  stochastic_d: number;
  overall_sentiment: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';
  support_resistance: {
    price: number;
    type: 'SUPPORT' | 'RESISTANCE';
    strength: string;
    tested_count: number;
  }[];
  detected_patterns: {
    name: string;
    type: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    detected_at: string;
    description: string;
  }[];
  indicator_series: {
    rsi: { time: string; value: number | null }[];
    macd: { time: string; macd: number | null; signal: number | null; histogram: number | null }[];
    bollinger: { time: string; upper: number | null; middle: number | null; lower: number | null }[];
  };
  educational_summary: {
    rsi_explanation: string;
    macd_explanation: string;
    moving_averages_explanation: string;
    disclaimer: string;
  };
}

export interface FundamentalAnalysis {
  symbol: string;
  company_name: string;
  currency: string;
  metrics: {
    revenue_growth_yoy?: number;
    net_profit_margin?: number;
    operating_margin?: number;
    pe_ratio?: number;
    pb_ratio?: number;
    ev_ebitda?: number;
    roe?: number;
    roce?: number;
    debt_to_equity?: number;
    current_ratio?: number;
    free_cash_flow?: number;
    dividend_yield?: number;
    market_cap?: number;
    eps?: number;
  };
  health_score: number;
  health_rating: 'EXCELLENT' | 'HEALTHY' | 'MODERATE' | 'VULNERABLE';
  score_breakdown: {
    name: string;
    score: number;
    weight: number;
    description: string;
    status: string;
  }[];
  quarterly_results: {
    period: string;
    revenue: number;
    net_profit: number;
    operating_margin_pct: number;
    eps: number;
  }[];
  annual_financials: {
    year: string;
    revenue: number;
    net_profit: number;
    free_cash_flow: number;
    debt: number;
  }[];
  strengths: string[];
  risks: string[];
  competitor_comparison: {
    symbol: string;
    pe: number;
    roe: number;
    growth: number;
  }[];
}

export interface RiskMetrics {
  symbol: string;
  benchmark_symbol: string;
  annualized_volatility: number;
  benchmark_volatility: number;
  beta: number;
  sharpe_ratio: number;
  sortino_ratio: number;
  max_drawdown_pct: number;
  var_95: number;
  cvar_95: number;
  downside_deviation: number;
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';
  return_distribution: {
    skewness: number;
    kurtosis: number;
    bins: { bin: string; count: number }[];
  };
  drawdown_series: { date: string; drawdown_pct: number }[];
  warnings: string[];
}

export interface PredictionData {
  symbol: string;
  current_price: number;
  currency: string;
  data_timestamp: string;
  last_training_date: string;
  best_model_name: string;
  forecasts: {
    horizon: string;
    forecast_date: string;
    target_price: number;
    lower_bound: number;
    upper_bound: number;
    expected_change_pct: number;
    direction: 'UP' | 'DOWN' | 'FLAT';
    confidence_level: number;
    model_name: string;
    uncertainty_level: string;
    explanation: string;
  }[];
  model_evaluations: {
    model_name: string;
    mae: number;
    rmse: number;
    mape: number;
    directional_accuracy_pct: number;
    baseline_mae: number;
    beats_baseline: boolean;
    train_samples: number;
    test_samples: number;
    validation_method: string;
  }[];
  feature_importance: {
    feature: string;
    importance: number;
  }[];
  limitations: string[];
  disclaimer: string;
}

export interface BacktestResult {
  symbol: string;
  strategy: string;
  parameters: Record<string, any>;
  initial_capital: number;
  final_equity: number;
  total_return_pct: number;
  benchmark_return_pct: number;
  alpha: number;
  cagr: number;
  sharpe_ratio: number;
  max_drawdown_pct: number;
  win_rate_pct: number;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  profit_factor: number;
  equity_curve: {
    date: string;
    portfolio_equity: number;
    benchmark_equity: number;
    drawdown_pct: number;
  }[];
  trades: {
    id: number;
    entry_date: string;
    exit_date?: string;
    trade_type: string;
    entry_price: number;
    exit_price?: number;
    shares: number;
    pnl?: number;
    pnl_pct?: number;
    status: string;
    exit_reason?: string;
  }[];
  disclaimer: string;
}

export interface PortfolioSummary {
  id: number;
  name: string;
  currency: string;
  cash_balance: number;
  total_invested: number;
  current_portfolio_value: number;
  total_equity: number;
  total_unrealized_pnl: number;
  total_unrealized_pnl_pct: number;
  total_realized_pnl: number;
  holdings: {
    symbol: string;
    name: string;
    exchange: string;
    currency: string;
    shares: number;
    average_price: number;
    current_price: number;
    invested_value: number;
    current_value: number;
    unrealized_pnl: number;
    unrealized_pnl_pct: number;
    portfolio_weight_pct: number;
    sector: string;
  }[];
  recent_transactions: {
    id: number;
    symbol: string;
    transaction_type: string;
    quantity: number;
    price: number;
    fees: number;
    total_amount: number;
    timestamp: string;
    notes?: string;
  }[];
  sector_allocation: {
    sector: string;
    value: number;
    weight_pct: number;
  }[];
}

export interface Watchlist {
  id: number;
  name: string;
  description?: string;
  items: {
    id: number;
    symbol: string;
    name: string;
    price: number;
    change: number;
    change_pct: number;
    exchange: string;
    currency: string;
    market: string;
  }[];
}

export interface PriceAlert {
  id: number;
  symbol: string;
  target_price: number;
  condition: 'ABOVE' | 'BELOW';
  current_price: number;
  is_triggered: boolean;
  is_active: boolean;
  created_at: string;
}

export interface NewsArticle {
  id: string;
  symbol?: string;
  title: string;
  source: string;
  url: string;
  published_at: string;
  summary: string;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  sentiment_score: number;
  category: string;
}

export interface LearningModule {
  id: string;
  title: string;
  category: string;
  level: string;
  duration: string;
  description: string;
  lessons: {
    id: string;
    title: string;
    content: string;
  }[];
  quiz: {
    question: string;
    options: string[];
    answer_index: number;
    explanation: string;
  }[];
}
