import httpx
import pandas as pd
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.providers.base import BaseMarketDataProvider
from app.core.config import settings

class AlphaVantageProvider(BaseMarketDataProvider):
    """
    Alpha Vantage API integration for real market data.
    Requires ALPHA_VANTAGE_API_KEY in environment.
    """

    BASE_URL = "https://www.alphavantage.co/query"

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.ALPHA_VANTAGE_API_KEY

    @property
    def name(self) -> str:
        return "alpha_vantage"

    def get_quote(self, symbol: str) -> Dict[str, Any]:
        if not self.api_key:
            raise ValueError("ALPHA_VANTAGE_API_KEY is not configured.")

        params = {
            "function": "GLOBAL_QUOTE",
            "symbol": symbol,
            "apikey": self.api_key
        }
        with httpx.Client(timeout=10.0) as client:
            resp = client.get(self.BASE_URL, params=params)
            resp.raise_for_status()
            data = resp.json()

        quote = data.get("Global Quote", {})
        if not quote:
            raise ValueError(f"No Alpha Vantage quote found for symbol: {symbol}")

        price = float(quote.get("05. price", 0.0))
        change = float(quote.get("09. change", 0.0))
        change_pct_str = quote.get("10. change percent", "0%").replace("%", "")
        change_pct = float(change_pct_str)

        return {
            "symbol": symbol,
            "name": symbol,
            "exchange": "US",
            "market": "US",
            "currency": "USD",
            "price": price,
            "previous_close": float(quote.get("08. previous close", 0.0)),
            "open": float(quote.get("02. open", 0.0)),
            "day_high": float(quote.get("03. high", 0.0)),
            "day_low": float(quote.get("04. low", 0.0)),
            "volume": float(quote.get("06. volume", 0.0)),
            "change": change,
            "change_pct": change_pct,
            "year_high": price * 1.2,
            "year_low": price * 0.8,
            "provider": "Alpha Vantage",
            "data_timestamp": quote.get("07. latest trading day", datetime.now().strftime("%Y-%m-%d")),
            "data_status": "REAL_DELAYED"
        }

    def get_historical_ohlcv(self, symbol: str, timeframe: str = "1Y") -> pd.DataFrame:
        if not self.api_key:
            raise ValueError("ALPHA_VANTAGE_API_KEY is not configured.")

        outputsize = "full" if timeframe in ["5Y", "MAX"] else "compact"
        params = {
            "function": "TIME_SERIES_DAILY",
            "symbol": symbol,
            "outputsize": outputsize,
            "apikey": self.api_key
        }
        with httpx.Client(timeout=15.0) as client:
            resp = client.get(self.BASE_URL, params=params)
            resp.raise_for_status()
            data = resp.json()

        time_series = data.get("Time Series (Daily)", {})
        if not time_series:
            raise ValueError(f"No daily time series found for {symbol} on Alpha Vantage.")

        records = []
        for date_str, values in time_series.items():
            records.append({
                "timestamp": date_str,
                "open": float(values.get("1. open", 0)),
                "high": float(values.get("2. high", 0)),
                "low": float(values.get("3. low", 0)),
                "close": float(values.get("4. close", 0)),
                "volume": float(values.get("5. volume", 0))
            })

        df = pd.DataFrame(records)
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        df = df.sort_values("timestamp").reset_index(drop=True)
        df["timestamp"] = df["timestamp"].dt.strftime("%Y-%m-%d")
        return df

    def get_indices(self, market: str = "US") -> List[Dict[str, Any]]:
        # Fallback to standard indices
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
        if not self.api_key:
            from app.providers.demo_provider import DemoProvider
            return DemoProvider().search_symbols(query, market)

        params = {
            "function": "SYMBOL_SEARCH",
            "keywords": query,
            "apikey": self.api_key
        }
        with httpx.Client(timeout=10.0) as client:
            resp = client.get(self.BASE_URL, params=params)
            resp.raise_for_status()
            data = resp.json()

        matches = data.get("bestMatches", [])
        results = []
        for match in matches:
            sym = match.get("1. symbol", "")
            results.append({
                "symbol": sym,
                "name": match.get("2. name", sym),
                "exchange": match.get("4. region", "US"),
                "market": "US" if match.get("4. region") == "United States" else "IN",
                "currency": match.get("8. currency", "USD"),
                "price": 0.0,
                "change": 0.0,
                "change_pct": 0.0
            })
        return results
