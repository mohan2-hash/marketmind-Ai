import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from app.providers.base import BaseMarketDataProvider

DEMO_STOCKS_DATA = {
    # Indian Stocks (NSE)
    "RELIANCE": {
        "name": "Reliance Industries Ltd.",
        "exchange": "NSE",
        "market": "IN",
        "currency": "INR",
        "base_price": 2980.50,
        "sector": "Energy & Petrochemicals",
        "industry": "Oil, Gas & Telecom",
        "market_cap": 2015000.0, # in Cr INR
        "pe": 27.8,
        "pb": 2.4,
        "roe": 9.8,
        "roce": 11.2,
        "debt_equity": 0.42,
        "current_ratio": 1.15,
        "eps": 107.2,
        "div_yield": 0.35,
        "description": "Reliance Industries Limited is an Indian multinational conglomerate headquartered in Mumbai. Its businesses include energy, petrochemicals, natural gas, retail, telecommunications (Jio), mass media, and textiles."
    },
    "TCS": {
        "name": "Tata Consultancy Services Ltd.",
        "exchange": "NSE",
        "market": "IN",
        "currency": "INR",
        "base_price": 3890.25,
        "sector": "Information Technology",
        "industry": "IT Services & Consulting",
        "market_cap": 1410000.0,
        "pe": 31.2,
        "pb": 13.5,
        "roe": 48.5,
        "roce": 58.0,
        "debt_equity": 0.05,
        "current_ratio": 2.4,
        "eps": 124.6,
        "div_yield": 1.35,
        "description": "Tata Consultancy Services is a leading Indian multinational information technology services and consulting company part of the Tata Group."
    },
    "INFY": {
        "name": "Infosys Ltd.",
        "exchange": "NSE",
        "market": "IN",
        "currency": "INR",
        "base_price": 1640.75,
        "sector": "Information Technology",
        "industry": "IT Services & Consulting",
        "market_cap": 680000.0,
        "pe": 26.5,
        "pb": 8.1,
        "roe": 31.8,
        "roce": 39.5,
        "debt_equity": 0.08,
        "current_ratio": 2.1,
        "eps": 62.0,
        "div_yield": 2.10,
        "description": "Infosys is a global leader in next-generation digital services and consulting, enabling clients across 56 countries to navigate their digital transformation."
    },
    "HDFCBANK": {
        "name": "HDFC Bank Ltd.",
        "exchange": "NSE",
        "market": "IN",
        "currency": "INR",
        "base_price": 1585.00,
        "sector": "Financial Services",
        "industry": "Private Sector Banking",
        "market_cap": 1205000.0,
        "pe": 18.9,
        "pb": 2.8,
        "roe": 16.4,
        "roce": 15.8,
        "debt_equity": 6.8, # Bank leverage
        "current_ratio": 1.05,
        "eps": 83.8,
        "div_yield": 1.25,
        "description": "HDFC Bank Limited is the largest Indian private sector bank by assets and the world's tenth-largest bank by market capitalisation."
    },
    "ICICIBANK": {
        "name": "ICICI Bank Ltd.",
        "exchange": "NSE",
        "market": "IN",
        "currency": "INR",
        "base_price": 1180.40,
        "sector": "Financial Services",
        "industry": "Private Sector Banking",
        "market_cap": 830000.0,
        "pe": 17.5,
        "pb": 2.9,
        "roe": 18.2,
        "roce": 16.9,
        "debt_equity": 5.9,
        "current_ratio": 1.02,
        "eps": 67.4,
        "div_yield": 0.85,
        "description": "ICICI Bank is a leading Indian multinational banking and financial services company offering diversified retail and corporate banking products."
    },
    "SBIN": {
        "name": "State Bank of India",
        "exchange": "NSE",
        "market": "IN",
        "currency": "INR",
        "base_price": 795.30,
        "sector": "Financial Services",
        "industry": "Public Sector Banking",
        "market_cap": 710000.0,
        "pe": 11.2,
        "pb": 1.6,
        "roe": 15.6,
        "roce": 14.1,
        "debt_equity": 7.2,
        "current_ratio": 1.01,
        "eps": 71.0,
        "div_yield": 1.70,
        "description": "State Bank of India is a Fortune 500 Indian public sector bank and the largest commercial bank in India with over 200 years of heritage."
    },
    "TATAMOTORS": {
        "name": "Tata Motors Ltd.",
        "exchange": "NSE",
        "market": "IN",
        "currency": "INR",
        "base_price": 820.50,
        "sector": "Automobile",
        "industry": "Passenger & Commercial Vehicles",
        "market_cap": 302000.0,
        "pe": 10.8,
        "pb": 3.4,
        "roe": 36.2,
        "roce": 21.5,
        "debt_equity": 1.15,
        "current_ratio": 1.12,
        "eps": 76.0,
        "div_yield": 0.75,
        "description": "Tata Motors is an automobile manufacturer part of the Tata Group, producing cars, sports utility vehicles, trucks, buses and luxury brand Jaguar Land Rover."
    },

    # US Stocks
    "AAPL": {
        "name": "Apple Inc.",
        "exchange": "NASDAQ",
        "market": "US",
        "currency": "USD",
        "base_price": 224.20,
        "sector": "Technology",
        "industry": "Consumer Electronics & Software",
        "market_cap": 3450000.0, # in Millions USD
        "pe": 33.4,
        "pb": 46.2,
        "roe": 147.2,
        "roce": 58.4,
        "debt_equity": 1.45,
        "current_ratio": 1.07,
        "eps": 6.72,
        "div_yield": 0.45,
        "description": "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories, and sells a variety of related services."
    },
    "MSFT": {
        "name": "Microsoft Corporation",
        "exchange": "NASDAQ",
        "market": "US",
        "currency": "USD",
        "base_price": 428.15,
        "sector": "Technology",
        "industry": "Cloud & Enterprise Software",
        "market_cap": 3180000.0,
        "pe": 36.2,
        "pb": 12.8,
        "roe": 39.1,
        "roce": 31.4,
        "debt_equity": 0.38,
        "current_ratio": 1.25,
        "eps": 11.82,
        "div_yield": 0.72,
        "description": "Microsoft develops and supports software, services, devices and solutions including Azure cloud computing, Windows, Office 365, and AI platforms."
    },
    "NVDA": {
        "name": "NVIDIA Corporation",
        "exchange": "NASDAQ",
        "market": "US",
        "currency": "USD",
        "base_price": 138.50,
        "sector": "Technology",
        "industry": "Semiconductors & AI Hardware",
        "market_cap": 3390000.0,
        "pe": 54.8,
        "pb": 42.0,
        "roe": 115.4,
        "roce": 88.2,
        "debt_equity": 0.18,
        "current_ratio": 4.1,
        "eps": 2.53,
        "div_yield": 0.03,
        "description": "NVIDIA is the pioneer of GPU-accelerated computing, powering modern artificial intelligence, high-performance computing, data centers, and gaming."
    },
    "GOOGL": {
        "name": "Alphabet Inc.",
        "exchange": "NASDAQ",
        "market": "US",
        "currency": "USD",
        "base_price": 174.60,
        "sector": "Communication Services",
        "industry": "Internet Search & Digital Media",
        "market_cap": 2180000.0,
        "pe": 23.9,
        "pb": 6.8,
        "roe": 31.2,
        "roce": 32.5,
        "debt_equity": 0.10,
        "current_ratio": 2.15,
        "eps": 7.31,
        "div_yield": 0.46,
        "description": "Alphabet Inc. is a multinational technology conglomerate holding company that was created through a restructuring of Google."
    },
    "AMZN": {
        "name": "Amazon.com Inc.",
        "exchange": "NASDAQ",
        "market": "US",
        "currency": "USD",
        "base_price": 195.40,
        "sector": "Consumer Discretionary",
        "industry": "E-Commerce & Cloud Computing (AWS)",
        "market_cap": 2040000.0,
        "pe": 41.5,
        "pb": 8.9,
        "roe": 22.8,
        "roce": 16.9,
        "debt_equity": 0.62,
        "current_ratio": 1.08,
        "eps": 4.71,
        "div_yield": 0.00,
        "description": "Amazon focuses on retail, cloud computing via AWS, online advertising, digital streaming, and artificial intelligence solutions worldwide."
    },
    "TSLA": {
        "name": "Tesla, Inc.",
        "exchange": "NASDAQ",
        "market": "US",
        "currency": "USD",
        "base_price": 252.80,
        "sector": "Consumer Discretionary",
        "industry": "Electric Vehicles & Clean Energy",
        "market_cap": 808000.0,
        "pe": 68.4,
        "pb": 12.1,
        "roe": 19.5,
        "roce": 15.2,
        "debt_equity": 0.12,
        "current_ratio": 1.85,
        "eps": 3.70,
        "div_yield": 0.00,
        "description": "Tesla designs, manufactures, and sells electric vehicles, stationary energy storage systems, and solar panels, and develops autonomous driving technologies."
    }
}

class DemoProvider(BaseMarketDataProvider):
    """
    Deterministic Market Data Provider.
    Provides realistic, reproducible historical series and company fundamentals
    without requiring third-party API credentials.
    """

    @property
    def name(self) -> str:
        return "demo"

    def _generate_deterministic_series(self, symbol: str, days: int = 500) -> pd.DataFrame:
        """
        Generates deterministic daily price action using a seed unique to the symbol,
        preserving realistic trends, volatility, and volume patterns.
        """
        # Create deterministic seed from symbol characters
        seed = sum(ord(c) * (i + 1) for i, c in enumerate(symbol))
        rng = np.random.RandomState(seed)

        base_info = DEMO_STOCKS_DATA.get(symbol, {
            "base_price": 500.0,
            "currency": "USD",
            "exchange": "DEMO"
        })
        base_price = base_info["base_price"]

        end_date = datetime.now()
        dates = [end_date - timedelta(days=d) for d in range(days)]
        dates.sort()

        # Filter out weekends
        trading_dates = [d for d in dates if d.weekday() < 5]
        n = len(trading_dates)

        # Generate realistic returns with slight positive drift (mean 0.0004, std 0.016)
        daily_returns = rng.normal(loc=0.0005, scale=0.016, size=n)
        
        # Add slight autoregression / momentum
        for i in range(1, n):
            daily_returns[i] = 0.15 * daily_returns[i-1] + 0.85 * daily_returns[i]

        price_series = np.empty(n)
        # Anchor end of series close to base_price
        cum_ret = np.cumprod(1 + daily_returns)
        scale_factor = base_price / cum_ret[-1]
        price_series = cum_ret * scale_factor

        records = []
        for i, dt in enumerate(trading_dates):
            close = float(price_series[i])
            daily_vol = max(0.004, abs(daily_returns[i]))
            high = float(close * (1 + rng.uniform(0.002, 0.018) + daily_vol * 0.5))
            low = float(close * (1 - rng.uniform(0.002, 0.018) - daily_vol * 0.5))
            
            # Open is close to previous close
            prev_close = price_series[i-1] if i > 0 else close
            open_price = float(prev_close * (1 + rng.normal(0, 0.004)))
            
            # Ensure valid bounds
            high = max(high, open_price, close)
            low = min(low, open_price, close)
            
            # Volume
            base_vol = 1_500_000 if base_info.get("market") == "IN" else 25_000_000
            volume = float(base_vol * rng.lognormal(0, 0.35) * (1 + abs(daily_returns[i]) * 10))

            records.append({
                "timestamp": dt.strftime("%Y-%m-%d"),
                "open": round(open_price, 2),
                "high": round(high, 2),
                "low": round(low, 2),
                "close": round(close, 2),
                "volume": round(volume, 0)
            })

        df = pd.DataFrame(records)
        return df

    def get_quote(self, symbol: str) -> Dict[str, Any]:
        info = DEMO_STOCKS_DATA.get(symbol)
        if not info:
            # Fallback for unrecognized demo symbol
            info = {
                "name": f"{symbol} Corporation",
                "exchange": "DEMO",
                "market": "US",
                "currency": "USD",
                "base_price": 100.0,
                "pe": 20.0,
                "div_yield": 1.0,
                "description": "Demonstration company data."
            }

        df = self._generate_deterministic_series(symbol, days=30)
        latest = df.iloc[-1]
        prev = df.iloc[-2]
        
        change = round(latest["close"] - prev["close"], 2)
        change_pct = round((change / prev["close"]) * 100, 2)
        
        year_high = round(float(df["high"].max() * 1.15), 2)
        year_low = round(float(df["low"].min() * 0.85), 2)

        return {
            "symbol": symbol,
            "name": info["name"],
            "exchange": info["exchange"],
            "market": info["market"],
            "currency": info["currency"],
            "sector": info.get("sector", "Diversified"),
            "industry": info.get("industry", "General"),
            "description": info.get("description", ""),
            "price": latest["close"],
            "previous_close": prev["close"],
            "open": latest["open"],
            "day_high": latest["high"],
            "day_low": latest["low"],
            "volume": latest["volume"],
            "change": change,
            "change_pct": change_pct,
            "year_high": year_high,
            "year_low": year_low,
            "market_cap": info.get("market_cap"),
            "pe_ratio": info.get("pe"),
            "dividend_yield": info.get("div_yield"),
            "provider": "MarketMind Demo Engine",
            "data_timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC"),
            "data_status": "DEMO"
        }

    def get_historical_ohlcv(self, symbol: str, timeframe: str = "1Y") -> pd.DataFrame:
        days_map = {
            "1D": 2,
            "5D": 10,
            "1M": 35,
            "3M": 95,
            "6M": 185,
            "1Y": 370,
            "5Y": 1850,
            "MAX": 2500
        }
        days = days_map.get(timeframe, 370)
        df = self._generate_deterministic_series(symbol, days=days)
        return df

    def get_indices(self, market: str = "IN") -> List[Dict[str, Any]]:
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC")
        if market.upper() == "IN":
            return [
                {
                    "symbol": "NIFTY 50",
                    "name": "Nifty 50 Index",
                    "exchange": "NSE",
                    "market": "IN",
                    "value": 24850.30,
                    "change": 135.40,
                    "change_pct": 0.55,
                    "data_status": "DEMO",
                    "timestamp": now_str
                },
                {
                    "symbol": "SENSEX",
                    "name": "BSE SENSEX",
                    "exchange": "BSE",
                    "market": "IN",
                    "value": 81320.15,
                    "change": 410.80,
                    "change_pct": 0.51,
                    "data_status": "DEMO",
                    "timestamp": now_str
                },
                {
                    "symbol": "BANK NIFTY",
                    "name": "Nifty Bank Index",
                    "exchange": "NSE",
                    "market": "IN",
                    "value": 52140.80,
                    "change": -85.20,
                    "change_pct": -0.16,
                    "data_status": "DEMO",
                    "timestamp": now_str
                }
            ]
        else:
            return [
                {
                    "symbol": "S&P 500",
                    "name": "S&P 500 Index",
                    "exchange": "NYSE/NASDAQ",
                    "market": "US",
                    "value": 5865.40,
                    "change": 24.30,
                    "change_pct": 0.42,
                    "data_status": "DEMO",
                    "timestamp": now_str
                },
                {
                    "symbol": "NASDAQ",
                    "name": "NASDAQ Composite",
                    "exchange": "NASDAQ",
                    "market": "US",
                    "value": 18518.60,
                    "change": 112.50,
                    "change_pct": 0.61,
                    "data_status": "DEMO",
                    "timestamp": now_str
                },
                {
                    "symbol": "DOW",
                    "name": "Dow Jones Industrial Average",
                    "exchange": "NYSE",
                    "market": "US",
                    "value": 42863.85,
                    "change": -35.20,
                    "change_pct": -0.08,
                    "data_status": "DEMO",
                    "timestamp": now_str
                }
            ]

    def get_top_movers(self, market: str = "IN") -> Dict[str, List[Dict[str, Any]]]:
        candidates = [
            s for s, d in DEMO_STOCKS_DATA.items() 
            if d["market"] == market.upper()
        ]
        
        quotes = [self.get_quote(sym) for sym in candidates]
        
        # Sort for gainers & losers
        gainers = sorted(quotes, key=lambda q: q["change_pct"], reverse=True)[:4]
        losers = sorted(quotes, key=lambda q: q["change_pct"])[:4]
        active = sorted(quotes, key=lambda q: q["volume"], reverse=True)[:4]

        return {
            "top_gainers": gainers,
            "top_losers": losers,
            "most_active": active
        }

    def get_company_profile(self, symbol: str) -> Dict[str, Any]:
        return self.get_quote(symbol)

    def get_financials(self, symbol: str) -> Dict[str, Any]:
        data = DEMO_STOCKS_DATA.get(symbol, {})
        currency = data.get("currency", "USD")
        
        # Quarter dates
        quarters = ["Q4 FY25", "Q3 FY25", "Q2 FY25", "Q1 FY25"]
        base_rev = 45000 if currency == "INR" else 85000
        
        quarterly = [
            {"period": quarters[0], "revenue": round(base_rev * 1.12, 1), "net_profit": round(base_rev * 0.18, 1), "operating_margin_pct": 21.4, "eps": round(data.get("eps", 10.0) * 0.28, 2)},
            {"period": quarters[1], "revenue": round(base_rev * 1.08, 1), "net_profit": round(base_rev * 0.17, 1), "operating_margin_pct": 20.8, "eps": round(data.get("eps", 10.0) * 0.26, 2)},
            {"period": quarters[2], "revenue": round(base_rev * 1.04, 1), "net_profit": round(base_rev * 0.16, 1), "operating_margin_pct": 19.9, "eps": round(data.get("eps", 10.0) * 0.24, 2)},
            {"period": quarters[3], "revenue": round(base_rev * 1.00, 1), "net_profit": round(base_rev * 0.15, 1), "operating_margin_pct": 19.5, "eps": round(data.get("eps", 10.0) * 0.22, 2)},
        ]

        years = ["FY2025", "FY2024", "FY2023", "FY2022"]
        annual = [
            {"year": years[0], "revenue": round(base_rev * 4.3, 1), "net_profit": round(base_rev * 0.68, 1), "free_cash_flow": round(base_rev * 0.52, 1), "debt": round(base_rev * 0.4, 1)},
            {"year": years[1], "revenue": round(base_rev * 3.8, 1), "net_profit": round(base_rev * 0.59, 1), "free_cash_flow": round(base_rev * 0.44, 1), "debt": round(base_rev * 0.45, 1)},
            {"year": years[2], "revenue": round(base_rev * 3.4, 1), "net_profit": round(base_rev * 0.51, 1), "free_cash_flow": round(base_rev * 0.38, 1), "debt": round(base_rev * 0.48, 1)},
            {"year": years[3], "revenue": round(base_rev * 3.0, 1), "net_profit": round(base_rev * 0.43, 1), "free_cash_flow": round(base_rev * 0.32, 1), "debt": round(base_rev * 0.52, 1)},
        ]

        return {
            "symbol": symbol,
            "company_name": data.get("name", symbol),
            "currency": currency,
            "metrics": {
                "revenue_growth_yoy": 12.8,
                "net_profit_margin": 16.5,
                "operating_margin": 20.8,
                "pe_ratio": data.get("pe", 25.0),
                "pb_ratio": data.get("pb", 4.0),
                "roe": data.get("roe", 20.0),
                "roce": data.get("roce", 22.0),
                "debt_to_equity": data.get("debt_equity", 0.3),
                "current_ratio": data.get("current_ratio", 1.5),
                "free_cash_flow": round(base_rev * 0.52, 1),
                "dividend_yield": data.get("div_yield", 1.0),
                "market_cap": data.get("market_cap"),
                "eps": data.get("eps", 15.0)
            },
            "quarterly_results": quarterly,
            "annual_financials": annual
        }

    def get_news(self, symbol: Optional[str] = None, limit: int = 10) -> List[Dict[str, Any]]:
        articles = [
            {
                "id": "news-1",
                "symbol": "RELIANCE",
                "title": "Reliance Retail Expands Omnichannel Presence with 250 New Stores",
                "source": "Financial Express",
                "url": "https://example.com/reliance-retail-expansion",
                "published_at": "2026-11-22T08:30:00Z",
                "summary": "Reliance Retail announces rapid footprint growth across Tier 2 and Tier 3 cities, boosting FY26 projections.",
                "sentiment": "POSITIVE",
                "sentiment_score": 0.72,
                "category": "Corporate Strategy"
            },
            {
                "id": "news-2",
                "symbol": "TCS",
                "title": "TCS Secures Multi-Million Dollar Cloud Transformation Deal with European Bank",
                "source": "Economic Times",
                "url": "https://example.com/tcs-cloud-deal",
                "published_at": "2026-11-21T14:15:00Z",
                "summary": "Tata Consultancy Services deepens European financial technology footprint with an 8-year modern infrastructure deal.",
                "sentiment": "POSITIVE",
                "sentiment_score": 0.81,
                "category": "Deal Win"
            },
            {
                "id": "news-3",
                "symbol": "AAPL",
                "title": "Apple Unveils On-Device Siri AI Architecture and Extended Enterprise Capabilities",
                "source": "Bloomberg",
                "url": "https://example.com/apple-ai-architecture",
                "published_at": "2026-11-22T10:00:00Z",
                "summary": "Apple introduces privacy-first on-device generative AI engines, boosting iPhone replacement cycle forecasts.",
                "sentiment": "POSITIVE",
                "sentiment_score": 0.75,
                "category": "Product Launch"
            },
            {
                "id": "news-4",
                "symbol": "NVDA",
                "title": "NVIDIA Blackwell Ultra GPUs Witness Accelerating Global Data Center Adoption",
                "source": "Reuters",
                "url": "https://example.com/nvidia-blackwell-adoption",
                "published_at": "2026-11-22T06:45:00Z",
                "summary": "Hyperscale cloud providers expand capital expenditure allocations specifically designated for next-generation GPU clusters.",
                "sentiment": "POSITIVE",
                "sentiment_score": 0.88,
                "category": "Earnings & Guidance"
            },
            {
                "id": "news-5",
                "symbol": "HDFCBANK",
                "title": "Reserve Bank of India Monetary Policy Committee Holds Repo Rates Steady",
                "source": "Livemint",
                "url": "https://example.com/rbi-mpc-rates",
                "published_at": "2026-11-20T11:00:00Z",
                "summary": "RBI maintains status quo on key lending rates, citing balanced domestic inflation trends and stable liquidity.",
                "sentiment": "NEUTRAL",
                "sentiment_score": 0.05,
                "category": "Macroeconomy"
            },
            {
                "id": "news-6",
                "symbol": "TSLA",
                "title": "Automotive Sector Navigates Evolving Raw Material Supply Dynamics",
                "source": "Wall Street Journal",
                "url": "https://example.com/ev-materials-supply",
                "published_at": "2026-11-19T16:20:00Z",
                "summary": "Global EV manufacturers manage battery chemistry adjustments amid fluctuating nickel and lithium index quotes.",
                "sentiment": "NEUTRAL",
                "sentiment_score": -0.12,
                "category": "Industry Trends"
            }
        ]

        if symbol:
            filtered = [a for a in articles if a.get("symbol") == symbol.upper()]
            return filtered if filtered else articles[:limit]
        return articles[:limit]

    def search_symbols(self, query: str, market: Optional[str] = None) -> List[Dict[str, Any]]:
        q = query.strip().upper()
        results = []
        for sym, d in DEMO_STOCKS_DATA.items():
            if market and d["market"] != market.upper():
                continue
            if q in sym or q in d["name"].upper():
                quote = self.get_quote(sym)
                results.append({
                    "symbol": sym,
                    "name": d["name"],
                    "exchange": d["exchange"],
                    "market": d["market"],
                    "currency": d["currency"],
                    "sector": d.get("sector"),
                    "industry": d.get("industry"),
                    "price": quote["price"],
                    "change": quote["change"],
                    "change_pct": quote["change_pct"],
                    "market_cap": d.get("market_cap")
                })
        return results
