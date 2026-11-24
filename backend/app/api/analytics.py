from fastapi import APIRouter, Depends, Path, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database.connection import get_db
from app.services.market_service import MarketService
from app.analytics.technical import compute_all_technical_indicators
from app.analytics.fundamental import compute_health_score
from app.analytics.risk import compute_risk_analytics
from app.analytics.backtester import run_backtest_strategy
from app.schemas.analytics import (
    TechnicalAnalysisResponse,
    FundamentalAnalysisResponse,
    RiskMetricsResponse
)
from app.schemas.backtest import BacktestRequest, BacktestResponse

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/indicators/{symbol}", response_model=TechnicalAnalysisResponse)
def get_technical_indicators(
    symbol: str = Path(..., description="Stock symbol"),
    db: Session = Depends(get_db)
):
    service = MarketService(db)
    df = service.get_provider().get_historical_ohlcv(symbol.upper(), timeframe="1Y")
    return compute_all_technical_indicators(df, symbol.upper())

@router.get("/fundamentals/{symbol}", response_model=FundamentalAnalysisResponse)
def get_fundamentals(
    symbol: str = Path(..., description="Stock symbol"),
    db: Session = Depends(get_db)
):
    service = MarketService(db)
    raw_fin = service.get_financials(symbol.upper())
    health_result = compute_health_score(raw_fin.get("metrics", {}))

    return {
        "symbol": symbol.upper(),
        "company_name": raw_fin.get("company_name", symbol.upper()),
        "currency": raw_fin.get("currency", "USD"),
        "metrics": raw_fin.get("metrics", {}),
        "health_score": health_result["health_score"],
        "health_rating": health_result["health_rating"],
        "score_breakdown": health_result["score_breakdown"],
        "quarterly_results": raw_fin.get("quarterly_results", []),
        "annual_financials": raw_fin.get("annual_financials", []),
        "strengths": health_result["strengths"],
        "risks": health_result["risks"],
        "competitor_comparison": [
            {"symbol": "TCS", "pe": 31.2, "roe": 48.5, "growth": 8.2},
            {"symbol": "INFY", "pe": 26.5, "roe": 31.8, "growth": 6.8},
            {"symbol": "WIPRO", "pe": 21.0, "roe": 15.2, "growth": 2.1}
        ] if raw_fin.get("currency") == "INR" else [
            {"symbol": "AAPL", "pe": 33.4, "roe": 147.2, "growth": 6.1},
            {"symbol": "MSFT", "pe": 36.2, "roe": 39.1, "growth": 15.2},
            {"symbol": "GOOGL", "pe": 23.9, "roe": 31.2, "growth": 14.1}
        ]
    }

@router.get("/risk/{symbol}", response_model=RiskMetricsResponse)
def get_risk_analysis(
    symbol: str = Path(..., description="Stock symbol"),
    benchmark: Optional[str] = Query(None, description="Benchmark index (e.g. 'NIFTY 50' or 'S&P 500')"),
    db: Session = Depends(get_db)
):
    service = MarketService(db)
    provider = service.get_provider()
    stock_df = provider.get_historical_ohlcv(symbol.upper(), timeframe="1Y")
    
    quote = provider.get_quote(symbol.upper())
    bench_symbol = benchmark or ("NIFTY 50" if quote.get("market") == "IN" else "S&P 500")
    
    # Generate benchmark historical series
    bench_df = provider.get_historical_ohlcv(symbol=bench_symbol, timeframe="1Y")
    
    return compute_risk_analytics(
        stock_df=stock_df,
        benchmark_df=bench_df,
        symbol=symbol.upper(),
        benchmark_symbol=bench_symbol
    )

@router.post("/backtests/run", response_model=BacktestResponse)
def run_backtest(
    req: BacktestRequest,
    db: Session = Depends(get_db)
):
    service = MarketService(db)
    provider = service.get_provider()
    df = provider.get_historical_ohlcv(req.symbol.upper(), timeframe="1Y")
    
    return run_backtest_strategy(
        df=df,
        symbol=req.symbol.upper(),
        strategy=req.strategy,
        initial_capital=req.initial_capital,
        commission_pct=req.commission_pct,
        slippage_pct=req.slippage_pct,
        parameters=req.parameters
    )
