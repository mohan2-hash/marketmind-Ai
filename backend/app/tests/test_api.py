import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.connection import init_db

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    init_db()

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data
    assert data["features"]["demo_mode"] is True

def test_market_overview_in():
    response = client.get("/api/markets/overview?market=IN")
    assert response.status_code == 200
    data = response.json()
    assert data["market"] == "IN"
    assert len(data["indices"]) >= 3
    assert any(idx["symbol"] == "NIFTY 50" for idx in data["indices"])
    assert len(data["top_gainers"]) > 0

def test_market_overview_us():
    response = client.get("/api/markets/overview?market=US")
    assert response.status_code == 200
    data = response.json()
    assert data["market"] == "US"
    assert any(idx["symbol"] == "S&P 500" for idx in data["indices"])

def test_stock_search():
    response = client.get("/api/stocks/search?q=TCS")
    assert response.status_code == 200
    results = response.json()
    assert len(results) > 0
    assert results[0]["symbol"] == "TCS"

def test_stock_detail_and_history():
    quote_resp = client.get("/api/stocks/AAPL")
    assert quote_resp.status_code == 200
    quote = quote_resp.json()
    assert quote["symbol"] == "AAPL"
    assert quote["price"] > 0
    assert quote["currency"] == "USD"

    hist_resp = client.get("/api/stocks/AAPL/history?timeframe=1Y")
    assert hist_resp.status_code == 200
    hist = hist_resp.json()
    assert len(hist["candles"]) >= 100
    assert "open" in hist["candles"][0]

def test_technical_indicators():
    resp = client.get("/api/analytics/indicators/RELIANCE")
    assert resp.status_code == 200
    data = resp.json()
    assert "rsi_14" in data
    assert 0 <= data["rsi_14"] <= 100
    assert "macd" in data
    assert "sma_50" in data
    assert "overall_sentiment" in data
    assert "support_resistance" in data
    assert "educational_summary" in data

def test_fundamental_analysis_and_health_score():
    resp = client.get("/api/analytics/fundamentals/INFY")
    assert resp.status_code == 200
    data = resp.json()
    assert data["symbol"] == "INFY"
    assert 0 <= data["health_score"] <= 100
    assert len(data["score_breakdown"]) == 4 # 4 transparent pillars
    assert len(data["strengths"]) > 0

def test_risk_metrics():
    resp = client.get("/api/analytics/risk/NVDA")
    assert resp.status_code == 200
    data = resp.json()
    assert data["annualized_volatility"] > 0
    assert "beta" in data
    assert "sharpe_ratio" in data
    assert "var_95" in data
    assert "cvar_95" in data
    assert len(data["return_distribution"]["bins"]) > 0

def test_backtest_strategy():
    payload = {
        "symbol": "TCS",
        "strategy": "SMA_CROSSOVER",
        "initial_capital": 100000.0,
        "commission_pct": 0.1,
        "slippage_pct": 0.05,
        "parameters": {"fast_period": 10, "slow_period": 30}
    }
    resp = client.post("/api/analytics/backtests/run", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "final_equity" in data
    assert "total_return_pct" in data
    assert "sharpe_ratio" in data
    assert len(data["equity_curve"]) > 10

def test_ml_predictions_pipeline():
    resp = client.get("/api/predictions/MSFT")
    assert resp.status_code == 200
    data = resp.json()
    assert data["symbol"] == "MSFT"
    assert len(data["forecasts"]) == 5 # 1D, 5D, 7D, 30D, 90D
    for f in data["forecasts"]:
        assert f["target_price"] > 0
        assert f["lower_bound"] <= f["target_price"] or abs(f["lower_bound"] - f["target_price"]) < 1.0
        assert f["upper_bound"] >= f["target_price"]
    assert len(data["model_evaluations"]) >= 3 # Baseline, Ridge, RF, GB
    assert len(data["feature_importance"]) > 0

def test_portfolio_simulator_flow():
    # 1. Get initial portfolio
    resp1 = client.get("/api/portfolio")
    assert resp1.status_code == 200
    port = resp1.json()
    init_cash = port["cash_balance"]
    assert init_cash > 0

    # 2. Buy virtual shares
    buy_payload = {
        "symbol": "RELIANCE",
        "transaction_type": "BUY",
        "quantity": 10.0
    }
    buy_resp = client.post("/api/portfolio/transactions", json=buy_payload)
    assert buy_resp.status_code == 200
    tx = buy_resp.json()
    assert tx["transaction_type"] == "BUY"
    assert tx["quantity"] == 10.0

    # 3. Check holdings
    resp2 = client.get("/api/portfolio")
    port2 = resp2.json()
    assert port2["cash_balance"] < init_cash
    assert any(h["symbol"] == "RELIANCE" and h["shares"] >= 10.0 for h in port2["holdings"])

    # 4. Attempt invalid short-sell (selling more than owned)
    oversell_payload = {
        "symbol": "RELIANCE",
        "transaction_type": "SELL",
        "quantity": 999999.0
    }
    err_resp = client.post("/api/portfolio/transactions", json=oversell_payload)
    assert err_resp.status_code == 400

    # 5. Valid partial sell
    sell_payload = {
        "symbol": "RELIANCE",
        "transaction_type": "SELL",
        "quantity": 5.0
    }
    sell_resp = client.post("/api/portfolio/transactions", json=sell_payload)
    assert sell_resp.status_code == 200

def test_watchlists_and_alerts():
    # Add to watchlist
    add_resp = client.post("/api/watchlists/items", json={"symbol": "TATAMOTORS"})
    assert add_resp.status_code == 200

    # Get watchlist
    wl_resp = client.get("/api/watchlists")
    assert wl_resp.status_code == 200
    assert any(item["symbol"] == "TATAMOTORS" for item in wl_resp.json()["items"])

    # Create price alert
    alert_resp = client.post("/api/alerts", json={
        "symbol": "AAPL",
        "target_price": 250.0,
        "condition": "ABOVE"
    })
    assert alert_resp.status_code == 200
    alert_id = alert_resp.json()["id"]

    # Delete alert
    del_resp = client.delete(f"/api/alerts/{alert_id}")
    assert del_resp.status_code == 200

def test_ai_assistant_chat():
    req = {
        "message": "What is the RSI of TCS and what does it mean?",
        "symbol": "TCS"
    }
    resp = client.post("/api/assistant/chat", json=req)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["reply"]) > 20
    assert len(data["sources_cited"]) > 0
    assert "disclaimer" in data
