import asyncio
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import httpx
from app.main import app

async def main():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        # 1. Health
        r = await client.get("/api/health")
        print("1. Health Check:", r.status_code, r.json())
        assert r.status_code == 200

        # 2. Market Overview (IN)
        r = await client.get("/api/markets/overview?market=IN")
        print("2. Market Overview IN:", r.status_code, "Indices count:", len(r.json()["indices"]))
        assert r.status_code == 200

        # 3. Market Overview (US)
        r = await client.get("/api/markets/overview?market=US")
        print("3. Market Overview US:", r.status_code, "Gainers count:", len(r.json()["top_gainers"]))
        assert r.status_code == 200

        # 4. Stock Search
        r = await client.get("/api/stocks/search?q=RELIANCE")
        print("4. Stock Search:", r.status_code, "Found:", [s["symbol"] for s in r.json()])
        assert r.status_code == 200

        # 5. Stock Detail
        r = await client.get("/api/stocks/AAPL")
        print("5. Stock Detail (AAPL):", r.status_code, "Price:", r.json()["price"], r.json()["currency"])
        assert r.status_code == 200

        # 6. Technical Indicators
        r = await client.get("/api/analytics/indicators/TCS")
        tech = r.json()
        print("6. Technical Indicators (TCS):", r.status_code, "RSI:", tech["rsi_14"], "Sentiment:", tech["overall_sentiment"])
        assert r.status_code == 200

        # 7. Fundamental Analysis
        r = await client.get("/api/analytics/fundamentals/INFY")
        fin = r.json()
        print("7. Fundamentals (INFY):", r.status_code, "Health Score:", fin["health_score"], fin["health_rating"])
        assert r.status_code == 200

        # 8. Risk Metrics
        r = await client.get("/api/analytics/risk/NVDA")
        risk = r.json()
        print("8. Risk Metrics (NVDA):", r.status_code, "Volatility:", risk["annualized_volatility"], "Beta:", risk["beta"], "Sharpe:", risk["sharpe_ratio"])
        assert r.status_code == 200

        # 9. Strategy Backtest
        payload = {
            "symbol": "TCS",
            "strategy": "SMA_CROSSOVER",
            "initial_capital": 100000.0,
            "commission_pct": 0.1,
            "slippage_pct": 0.05,
            "parameters": {"fast_period": 10, "slow_period": 30}
        }
        r = await client.post("/api/analytics/backtests/run", json=payload)
        bt = r.json()
        print("9. Backtest (TCS):", r.status_code, "Return:", bt["total_return_pct"], "% Alpha:", bt["alpha"], "% Trades:", bt["total_trades"])
        assert r.status_code == 200

        # 10. ML Predictions
        r = await client.get("/api/predictions/MSFT")
        pred = r.json()
        print("10. ML Predictions (MSFT):", r.status_code, "Best Model:", pred["best_model_name"], "Forecasts:", len(pred["forecasts"]))
        assert r.status_code == 200

        # 11. Portfolio Virtual Orders
        r = await client.get("/api/portfolio")
        init_cash = r.json()["cash_balance"]
        r = await client.post("/api/portfolio/transactions", json={"symbol": "RELIANCE", "transaction_type": "BUY", "quantity": 10.0})
        print("11. Virtual Buy Order:", r.status_code, "TX ID:", r.json()["id"])
        assert r.status_code == 200

        r = await client.get("/api/portfolio")
        port = r.json()
        print("    Updated Portfolio Equity:", port["total_equity"], "Holdings count:", len(port["holdings"]))
        assert len(port["holdings"]) > 0

        # 12. Watchlist
        r = await client.post("/api/watchlists/items", json={"symbol": "TATAMOTORS"})
        print("12. Watchlist Add:", r.status_code, r.json())
        assert r.status_code == 200

        # 13. AI Assistant Chat
        r = await client.post("/api/assistant/chat", json={"message": "What is the RSI of TCS?", "symbol": "TCS"})
        chat = r.json()
        print("13. Assistant Chat:", r.status_code, "Reply snippet:", chat["reply"][:80], "...")
        assert r.status_code == 200

        # 14. Learning Centre Modules
        r = await client.get("/api/learning/modules")
        print("14. Learning Modules:", r.status_code, "Count:", len(r.json()))
        assert r.status_code == 200

    print("\n=========================================")
    print("ALL 14 BACKEND TESTS COMPLETED SUCCESSFULLY!")
    print("=========================================\n")

if __name__ == "__main__":
    asyncio.run(main())
