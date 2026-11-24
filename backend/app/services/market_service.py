from typing import List, Dict, Any, Optional
import pandas as pd
from sqlalchemy.orm import Session
from app.providers.factory import ProviderFactory
from app.models.stock import Stock

class MarketService:
    def __init__(self, db: Optional[Session] = None):
        self.db = db

    def get_provider(self, force_demo: bool = False):
        return ProviderFactory.get_provider(force_demo=force_demo)

    def get_market_overview(self, market: str = "IN", force_demo: bool = False) -> Dict[str, Any]:
        provider = self.get_provider(force_demo)
        indices = provider.get_indices(market=market)
        movers = provider.get_top_movers(market=market)

        sector_perf = {
            "Information Technology": 1.45,
            "Banking & Finance": 0.82,
            "Energy & Petrochem": -0.34,
            "Automobile": 1.12,
            "Consumer Goods": 0.25,
            "Pharmaceuticals": -0.15,
            "Metals & Mining": 0.95
        } if market.upper() == "IN" else {
            "Information Technology": 1.85,
            "Consumer Discretionary": 0.94,
            "Communication Services": 1.15,
            "Financials": 0.42,
            "Health Care": -0.28,
            "Energy": -0.65,
            "Industrials": 0.38
        }

        from datetime import datetime
        return {
            "market": market.upper(),
            "indices": indices,
            "top_gainers": movers.get("top_gainers", []),
            "top_losers": movers.get("top_losers", []),
            "most_active": movers.get("most_active", []),
            "sector_performance": sector_perf,
            "market_status": "OPEN",
            "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC"),
            "data_mode": "DEMO" if provider.name == "demo" else "REAL"
        }

    def get_stock_quote(self, symbol: str, force_demo: bool = False) -> Dict[str, Any]:
        provider = self.get_provider(force_demo)
        return provider.get_quote(symbol)

    def get_stock_history(self, symbol: str, timeframe: str = "1Y", force_demo: bool = False) -> Dict[str, Any]:
        provider = self.get_provider(force_demo)
        df = provider.get_historical_ohlcv(symbol, timeframe=timeframe)
        quote = provider.get_quote(symbol)

        candles = []
        for _, row in df.iterrows():
            candles.append({
                "time": str(row["timestamp"]),
                "open": float(row["open"]),
                "high": float(row["high"]),
                "low": float(row["low"]),
                "close": float(row["close"]),
                "volume": float(row["volume"])
            })

        return {
            "symbol": symbol,
            "exchange": quote.get("exchange", "NSE"),
            "currency": quote.get("currency", "INR"),
            "timeframe": timeframe,
            "provider": provider.name,
            "data_mode": "DEMO" if provider.name == "demo" else "REAL",
            "candles": candles
        }

    def search_stocks(self, query: str, market: Optional[str] = None) -> List[Dict[str, Any]]:
        provider = self.get_provider()
        return provider.search_symbols(query, market)

    def get_financials(self, symbol: str) -> Dict[str, Any]:
        provider = self.get_provider()
        return provider.get_financials(symbol)

    def get_news(self, symbol: Optional[str] = None, limit: int = 10) -> List[Dict[str, Any]]:
        provider = self.get_provider()
        return provider.get_news(symbol, limit)
