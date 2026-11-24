import httpx
import pandas as pd
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.providers.base import BaseMarketDataProvider
from app.core.config import settings

class TwelveDataProvider(BaseMarketDataProvider):
    """
    Twelve Data API provider for global and Indian (NSE/BSE) market quotes.
    Requires TWELVE_DATA_API_KEY in environment.
    """

    BASE_URL = "https://api.twelvedata.com"

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.TWELVE_DATA_API_KEY

    @property
    def name(self) -> str:
        return "twelve_data"

    def get_quote(self, symbol: str) -> Dict[str, Any]:
        if not self.api_key:
            raise ValueError("TWELVE_DATA_API_KEY is not configured.")

        params = {
            "symbol": symbol,
            "apikey": self.api_key
        }
        with httpx.Client(timeout=10.0) as client:
            resp = client.get(f"{self.BASE_URL}/quote", params=params)
            resp.raise_for_status()
            data = resp.json()

        if "code" in data and data["code"] != 200:
            raise ValueError(f"Twelve Data Error: {data.get('message', 'Unknown error')}")

        price = float(data.get("close", 0.0))
        change = float(data.get("change", 0.0))
        change_pct = float(data.get("percent_change", 0.0))

        return {
            "symbol": symbol,
            "name": data.get("name", symbol),
            "exchange": data.get("exchange", "NSE"),
            "market": "IN" if "NSE" in data.get("exchange", "") or "BSE" in data.get("exchange", "") else "US",
            "currency": data.get("currency", "USD"),
            "price": price,
            "previous_close": float(data.get("previous_close", 0.0)),
            "open": float(data.get("open", 0.0)),
            "day_high": float(data.get("high", 0.0)),
            "day_low": float(data.get("low", 0.0)),
            "volume": float(data.get("volume", 0.0)),
            "change": change,
            "change_pct": change_pct,
            "year_high": float(data.get("fifty_two_week", {}).get("high", price * 1.2)),
            "year_low": float(data.get("fifty_two_week", {}).get("low", price * 0.8)),
            "provider": "Twelve Data",
            "data_timestamp": data.get("datetime", datetime.now().strftime("%Y-%m-%d")),
            "data_status": "REAL_DELAYED"
        }

    def get_historical_ohlcv(self, symbol: str, timeframe: str = "1Y") -> pd.DataFrame:
        if not self.api_key:
            raise ValueError("TWELVE_DATA_API_KEY is not configured.")

        params = {
            "symbol": symbol,
            "interval": "1day",
            "outputsize": 365 if timeframe == "1Y" else 100,
            "apikey": self.api_key
        }
        with httpx.Client(timeout=15.0) as client:
            resp = client.get(f"{self.BASE_URL}/time_series", params=params)
            resp.raise_for_status()
            data = resp.json()

        values = data.get("values", [])
        if not values:
            raise ValueError(f"No historical time series returned for {symbol} by Twelve Data.")

        records = []
        for val in values:
            records.append({
                "timestamp": val["datetime"],
                "open": float(val["open"]),
                "high": float(val["high"]),
                "low": float(val["low"]),
                "close": float(val["close"]),
                "volume": float(val.get("volume", 0))
            })

        df = pd.DataFrame(records)
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        df = df.sort_values("timestamp").reset_index(drop=True)
        df["timestamp"] = df["timestamp"].dt.strftime("%Y-%m-%d")
        return df

    def get_indices(self, market: str = "IN") -> List[Dict[str, Any]]:
        from app.providers.demo_provider import DemoProvider
        return DemoProvider().get_indices(market=market)

    def get_top_movers(self, market: str = "IN") -> Dict[str, List[Dict[str, Any]]]:
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
