import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database.connection import init_db, SessionLocal
from app.services.market_service import MarketService
from app.services.portfolio_service import PortfolioService
from app.services.watchlist_service import WatchlistService, AlertService
from app.services.assistant_service import AssistantService
from app.analytics.technical import compute_all_technical_indicators
from app.analytics.fundamental import compute_health_score
from app.analytics.risk import compute_risk_analytics
from app.analytics.backtester import run_backtest_strategy
from app.ml.predictor import generate_multi_horizon_predictions

def run_all_tests():
    print("--- 1. Initializing Database ---", flush=True)
    init_db()
    db = SessionLocal()
    print("Database tables initialized successfully.", flush=True)

    print("--- 2. Market Service ---", flush=True)
    ms = MarketService(db)
    overview_in = ms.get_market_overview("IN")
    print(f"Market Overview IN: {len(overview_in['indices'])} indices, {len(overview_in['top_gainers'])} gainers", flush=True)
    assert len(overview_in['indices']) >= 3
    assert len(overview_in['top_gainers']) > 0

    overview_us = ms.get_market_overview("US")
    print(f"Market Overview US: {len(overview_us['indices'])} indices, {len(overview_us['top_gainers'])} gainers", flush=True)
    assert len(overview_us['indices']) >= 3

    quote_rel = ms.get_stock_quote("RELIANCE")
    print(f"Quote RELIANCE: Price {quote_rel['price']} {quote_rel['currency']} ({quote_rel['change_pct']}%)", flush=True)
    assert quote_rel["price"] > 0

    quote_aapl = ms.get_stock_quote("AAPL")
    print(f"Quote AAPL: Price {quote_aapl['price']} {quote_aapl['currency']} ({quote_aapl['change_pct']}%)", flush=True)
    assert quote_aapl["price"] > 0

    print("--- 3. Historical Candles ---", flush=True)
    df = ms.get_provider().get_historical_ohlcv("TCS", timeframe="1Y")
    print(f"Historical Candles TCS: {len(df)} daily bars", flush=True)
    assert len(df) >= 100

    print("--- 4. Technical Analysis ---", flush=True)
    tech = compute_all_technical_indicators(df, "TCS")
    print(f"Technical Indicators TCS: RSI={tech['rsi_14']} ({tech['rsi_signal']}), MACD={tech['macd']}, Sentiment={tech['overall_sentiment']}", flush=True)
    assert 0 <= tech["rsi_14"] <= 100
    assert len(tech["indicator_series"]["rsi"]) > 0

    print("--- 5. Fundamental Analysis & Health Score ---", flush=True)
    raw_fin = ms.get_financials("INFY")
    health = compute_health_score(raw_fin["metrics"])
    print(f"Health Score INFY: {health['health_score']}/100 ({health['health_rating']})", flush=True)
    print(f"  Strengths: {health['strengths']}", flush=True)
    print(f"  Risks: {health['risks']}", flush=True)
    assert 0 <= health["health_score"] <= 100
    assert len(health["score_breakdown"]) == 4

    print("--- 6. Risk Analysis ---", flush=True)
    bench_df = ms.get_provider().get_historical_ohlcv("NIFTY 50", timeframe="1Y")
    risk = compute_risk_analytics(df, bench_df, "TCS", "NIFTY 50")
    print(f"Risk Metrics TCS: Ann Vol={risk['annualized_volatility']}%, Beta={risk['beta']}, Sharpe={risk['sharpe_ratio']}, VaR(95%)={risk['var_95']}%", flush=True)
    assert risk["annualized_volatility"] > 0

    print("--- 7. Strategy Backtest ---", flush=True)
    bt = run_backtest_strategy(df, "TCS", strategy="SMA_CROSSOVER", initial_capital=100000.0)
    print(f"Backtest SMA Crossover TCS: Return={bt['total_return_pct']}%, Benchmark={bt['benchmark_return_pct']}%, Trades={bt['total_trades']}, WinRate={bt['win_rate_pct']}%", flush=True)
    assert len(bt["equity_curve"]) > 10

    print("--- 8. Machine Learning Prediction Engine ---", flush=True)
    preds = generate_multi_horizon_predictions(df, "TCS", currency="INR")
    print(f"Predictions TCS: Best Model={preds['best_model_name']}", flush=True)
    for f in preds["forecasts"]:
        print(f"  Horizon {f['horizon']} ({f['forecast_date']}): Target={f['target_price']} [{f['lower_bound']} - {f['upper_bound']}] ({f['direction']})", flush=True)
    assert len(preds["forecasts"]) == 5
    assert len(preds["model_evaluations"]) >= 3

    print("--- 9. Virtual Portfolio Simulation ---", flush=True)
    ps = PortfolioService(db)
    summary = ps.get_portfolio_summary()
    init_cash = summary["cash_balance"]
    print(f"Initial Virtual Cash: {init_cash}", flush=True)
    
    tx = ps.execute_transaction("RELIANCE", "BUY", 10.0)
    print(f"Executed BUY 10 RELIANCE @ {tx.price}, TX ID: {tx.id}", flush=True)
    
    summary2 = ps.get_portfolio_summary()
    print(f"Updated Portfolio Equity: {summary2['total_equity']}, Holdings: {len(summary2['holdings'])}", flush=True)
    assert len(summary2["holdings"]) > 0

    # Sell 5
    tx_sell = ps.execute_transaction("RELIANCE", "SELL", 5.0)
    print(f"Executed SELL 5 RELIANCE @ {tx_sell.price}", flush=True)

    print("--- 10. Watchlists & Price Alerts ---", flush=True)
    ws = WatchlistService(db)
    ws.add_symbol_to_watchlist("TATAMOTORS")
    wl = ws.get_watchlist_details()
    print(f"Watchlist items: {[i['symbol'] for i in wl['items']]}", flush=True)
    assert any(i["symbol"] == "TATAMOTORS" for i in wl["items"])

    als = AlertService(db)
    alert = als.create_alert("AAPL", 250.0, "ABOVE")
    alerts = als.get_alerts()
    print(f"Active Alerts count: {len(alerts)}", flush=True)
    assert any(a["id"] == alert.id for a in alerts)
    als.delete_alert(alert.id)

    print("--- 11. AI Assistant ---", flush=True)
    asst = AssistantService(ms)
    resp = asst.answer_query("Explain RSI and what it means for TCS", symbol="TCS")
    print(f"AI Assistant Reply: {resp['reply'][:120]}...", flush=True)
    assert len(resp["reply"]) > 20
    assert len(resp["sources_cited"]) > 0

    db.close()
    print("\n=================================================")
    print("ALL 11 BACKEND SERVICES TESTED & VERIFIED 100%!")
    print("=================================================\n", flush=True)

if __name__ == "__main__":
    run_all_tests()
