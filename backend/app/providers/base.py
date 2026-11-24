from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
import pandas as pd

class BaseMarketDataProvider(ABC):
    @property
    @abstractmethod
    def name(self) -> str:
        """Name of the provider (e.g. 'demo', 'twelve_data', 'alpha_vantage', 'finnhub')."""
        pass

    @abstractmethod
    def get_quote(self, symbol: str) -> Dict[str, Any]:
        """Get latest price quote for a symbol."""
        pass

    @abstractmethod
    def get_historical_ohlcv(
        self,
        symbol: str,
        timeframe: str = "1Y"
    ) -> pd.DataFrame:
        """
        Get historical OHLCV data returned as a DataFrame with columns:
        ['timestamp', 'open', 'high', 'low', 'close', 'volume']
        sorted chronologically.
        """
        pass

    @abstractmethod
    def get_indices(self, market: str = "IN") -> List[Dict[str, Any]]:
        """Get major market indices for Indian or US market."""
        pass

    @abstractmethod
    def get_top_movers(self, market: str = "IN") -> Dict[str, List[Dict[str, Any]]]:
        """Get top gainers, losers, and most active stocks."""
        pass

    @abstractmethod
    def get_company_profile(self, symbol: str) -> Dict[str, Any]:
        """Get company description, sector, industry, market cap, and overview."""
        pass

    @abstractmethod
    def get_financials(self, symbol: str) -> Dict[str, Any]:
        """Get financial statements, ratios, quarterly results, and health metrics."""
        pass

    @abstractmethod
    def get_news(self, symbol: Optional[str] = None, limit: int = 10) -> List[Dict[str, Any]]:
        """Get latest financial news with sentiment."""
        pass

    @abstractmethod
    def search_symbols(self, query: str, market: Optional[str] = None) -> List[Dict[str, Any]]:
        """Search stocks by symbol or company name."""
        pass
