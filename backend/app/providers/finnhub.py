import httpx
import pandas as pd
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from app.providers.base import BaseMarketDataProvider
from app.core.config import settings

class FinnhubProvider(BaseMarketDataProvider):
    """
    Finnhub Stock API integration for US & international stocks.
    Requires FINNHUB_API_KEY in environment.
    """

    BASE_URL = "https://finnhub.io/api/v1"

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.FINNHUB_API_KEY

    @property
    def name(self) -> str:
        return "finnhub"

    def get_quote(self, symbol: str) -> Dict[str, Any]:
        if not self.api_key:
            raise ValueError("FINNHUB_API_KEY is not configured.")

        params = {"symbol": symbol, "token": self.api_key}
        with httpx.Client(timeout=10.0) as client:
            resp = client.get(f"{self.BASE_URL}/quote", params=params)
            resp.raise_for_status()
            data = resp.json()

        price = float(data.get("c", 0.0))
        prev_close = float(data.get("pc", 0.0))
        change = float(data.get("d", 0.0))
        change_pct = float(data.get("dp", 0.0))

        return {
            "symbol": symbol,
            "name": symbol,
            "exchange": "US",
            "market": "US",
            "currency": "USD",
            "price": price,
            "previous_close": prev_close,
            "open": float(data.get("o", 0.0)),
            "day_high": float(data.get("h", 0.0)),
            "day_low": float(data.get("l", 0.0)),
            "volume": 0.0,
            "change": change,
            "change_pct": change_pct,
            "year_high": price * 1.25,
            "year_low": price * 0.85,
            "provider": "Finnhub",
            "data_timestamp": datetime.fromtimestamp(data.get("t", datetime.now().timestamp())).strftime("%Y-%m-%d %H:%M:%S"),
            "data_status": "REAL_DELAYED"
        }

    def get_historical_ohlcv(self, symbol: str, timeframe: str = "1Y") -> pd.DataFrame:
        if not self.api_key:
            raise ValueError("FINNHUB_API_KEY is not configured.")

        now = int(datetime.now().timestamp())
        days = 365 if timeframe == "1Y" else 90
        start = now - (days * 86400)

        params = {
            "symbol": symbol,
            "resolution": "D",
            "from": start,
            "to": now,
            "token": self.api_key
        }
        with httpx.Client(timeout=15.0) as client:
            resp = client.get(f"{self.BASE_URL}/stock/candle", params=params)
            resp.raise_for_status()
            data = resp.json()

        if data.get("s") != "ok":
            raise ValueError(f"Finnhub error or no candle data for {symbol}")

        records = []
        for i in range(len(data["t"])):
            dt = datetime.fromtimestamp(data["t"][i]).strftime("%Y-%m-%d")
            records.append({
                "timestamp": dt,
                "open": float(data["o"][i]),
                "high": float(data["h"][i]),
                "low": float(data["l"][i]),
                "close": float(data["c"][i]),
                "volume": float(data["v"][i])
            })

        df = pd.DataFrame(records)
        df = df.sort_values("timestamp").reset_index(drop=True)
        return df

    def get_indices(self, market: str = "US") -> List[Dict[str, Any]]:
        from app.providers.demo_provider import DemoProvider
        return DemoProvider().get_indices(market=market)

    def get_top_movers(self, market: str = "US") -> Dict[str, List[Dict[str, Any]]]:
        from app.providers.demo_provider import DemoProvider
        return DemoProvider().get_top_movers(market=market)

    def get_company_profile(self, symbol: str) -> Dict[str, Any]:
        return self.get_quote(symbol)

    def get_financials(self, symbol: str) -> Dict[str, Any]:
        from app.providers.demo_provider import DemoProvider
        return DemoProvider().get_financials(symbol)

    def get_news(self, symbol: Optional[str] = None, limit: int = 10) -> List[Dict[str, Any]]:
        from app.providers.demo_provider import DemoProvider
        return DemoProvider().get_news(symbol, limit)

    def search_symbols(self, query: str, market: Optional[str] = None) -> List[Dict[str, Any]]:
        from app.providers.demo_provider import DemoProvider
        return DemoProvider().search_symbols(query, market)
