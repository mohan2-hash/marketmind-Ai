from typing import Optional
from app.providers.base import BaseMarketDataProvider
from app.providers.demo_provider import DemoProvider
from app.providers.twelve_data import TwelveDataProvider
from app.providers.alpha_vantage import AlphaVantageProvider
from app.providers.finnhub import FinnhubProvider
from app.core.config import settings

class ProviderFactory:
    _instance: Optional[BaseMarketDataProvider] = None

    @classmethod
    def get_provider(cls, force_demo: bool = False, provider_name: Optional[str] = None) -> BaseMarketDataProvider:
        """
        Returns the appropriate market data provider.
        If force_demo is True or no credentials configured, defaults safely to DemoProvider.
        """
        if force_demo:
            return DemoProvider()

        target = provider_name or settings.DEFAULT_PROVIDER.lower()

        if target == "twelve_data" and settings.TWELVE_DATA_API_KEY:
            return TwelveDataProvider()
        elif target == "alpha_vantage" and settings.ALPHA_VANTAGE_API_KEY:
            return AlphaVantageProvider()
        elif target == "finnhub" and settings.FINNHUB_API_KEY:
            return FinnhubProvider()

        # Default fallback
        return DemoProvider()
