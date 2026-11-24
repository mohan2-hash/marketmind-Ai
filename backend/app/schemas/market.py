from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class StockBase(BaseModel):
    symbol: str
    name: str
    exchange: str
    market: str
    currency: str
    sector: Optional[str] = None
    industry: Optional[str] = None

class StockSearchItem(StockBase):
    price: float
    change: float
    change_pct: float
    market_cap: Optional[float] = None

class StockDetailResponse(StockBase):
    description: Optional[str] = None
    market_cap: Optional[float] = None
    price: float
    previous_close: float
    open: float
    day_high: float
    day_low: float
    volume: float
    change: float
    change_pct: float
    year_high: float
    year_low: float
    pe_ratio: Optional[float] = None
    dividend_yield: Optional[float] = None
    provider: str
    data_timestamp: str
    data_status: str # "DEMO", "REAL_DELAYED", "REAL_EOD"

class IndexOverviewItem(BaseModel):
    symbol: str
    name: str
    exchange: str
    market: str
    value: float
    change: float
    change_pct: float
    data_status: str
    timestamp: str

class MarketOverviewResponse(BaseModel):
    market: str # "IN" or "US"
    indices: List[IndexOverviewItem]
    top_gainers: List[StockSearchItem]
    top_losers: List[StockSearchItem]
    most_active: List[StockSearchItem]
    sector_performance: Dict[str, float]
    market_status: str # "OPEN", "CLOSED"
    last_updated: str
    data_mode: str # "DEMO" or "REAL"

class Candle(BaseModel):
    time: str # YYYY-MM-DD or Unix timestamp
    open: float
    high: float
    low: float
    close: float
    volume: float

class HistoricalDataResponse(BaseModel):
    symbol: str
    exchange: str
    currency: str
    timeframe: str # "1D", "1W", "1M", "1Y", "5Y"
    provider: str
    data_mode: str
    candles: List[Candle]
