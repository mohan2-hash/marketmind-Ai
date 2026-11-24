from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class IndicatorPoint(BaseModel):
    time: str
    value: Optional[float] = None
    upper: Optional[float] = None
    middle: Optional[float] = None
    lower: Optional[float] = None
    macd: Optional[float] = None
    signal: Optional[float] = None
    histogram: Optional[float] = None
    k: Optional[float] = None
    d: Optional[float] = None

class CandlestickPattern(BaseModel):
    name: str
    type: str # "BULLISH", "BEARISH", "NEUTRAL"
    detected_at: str
    description: str

class SupportResistanceLevel(BaseModel):
    price: float
    type: str # "SUPPORT", "RESISTANCE"
    strength: str # "STRONG", "MODERATE", "WEAK"
    tested_count: int

class TechnicalAnalysisResponse(BaseModel):
    symbol: str
    latest_price: float
    rsi_14: float
    rsi_signal: str # "OVERSOLD", "NEUTRAL", "OVERBOUGHT"
    macd: float
    macd_signal: float
    macd_histogram: float
    macd_trend: str # "BULLISH_CROSSOVER", "BEARISH_CROSSOVER", "NEUTRAL"
    sma_20: float
    sma_50: float
    sma_200: float
    ema_20: float
    bollinger_upper: float
    bollinger_middle: float
    bollinger_lower: float
    atr_14: float
    stochastic_k: float
    stochastic_d: float
    overall_sentiment: str # "STRONG_BUY", "BUY", "NEUTRAL", "SELL", "STRONG_SELL"
    support_resistance: List[SupportResistanceLevel]
    detected_patterns: List[CandlestickPattern]
    indicator_series: Dict[str, List[Dict[str, Any]]]
    educational_summary: Dict[str, str]

class HealthScoreComponent(BaseModel):
    name: str
    score: float # 0 to 100
    weight: float # e.g. 0.25
    description: str
    status: str # "EXCELLENT", "GOOD", "AVERAGE", "WEAK"

class FundamentalMetrics(BaseModel):
    revenue_growth_yoy: Optional[float] = None
    net_profit_margin: Optional[float] = None
    operating_margin: Optional[float] = None
    pe_ratio: Optional[float] = None
    pb_ratio: Optional[float] = None
    ev_ebitda: Optional[float] = None
    roe: Optional[float] = None
    roce: Optional[float] = None
    debt_to_equity: Optional[float] = None
    current_ratio: Optional[float] = None
    free_cash_flow: Optional[float] = None
    dividend_yield: Optional[float] = None
    market_cap: Optional[float] = None
    eps: Optional[float] = None

class FundamentalAnalysisResponse(BaseModel):
    symbol: str
    company_name: str
    currency: str
    metrics: FundamentalMetrics
    health_score: float # 0 to 100
    health_rating: str # "EXCELLENT", "HEALTHY", "MODERATE", "VULNERABLE"
    score_breakdown: List[HealthScoreComponent]
    quarterly_results: List[Dict[str, Any]]
    annual_financials: List[Dict[str, Any]]
    strengths: List[str]
    risks: List[str]
    competitor_comparison: List[Dict[str, Any]]

class RiskMetricsResponse(BaseModel):
    symbol: str
    benchmark_symbol: str
    annualized_volatility: float
    benchmark_volatility: float
    beta: float
    sharpe_ratio: float
    sortino_ratio: float
    max_drawdown_pct: float
    var_95: float # Value at Risk 95%
    cvar_95: float # Conditional VaR (Expected Shortfall)
    downside_deviation: float
    risk_level: str # "LOW", "MODERATE", "HIGH", "VERY_HIGH"
    return_distribution: Dict[str, Any]
    drawdown_series: List[Dict[str, Any]]
    warnings: List[str]
