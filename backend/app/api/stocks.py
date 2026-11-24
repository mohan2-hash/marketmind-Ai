from fastapi import APIRouter, Depends, Query, Path
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.connection import get_db
from app.services.market_service import MarketService
from app.schemas.market import (
    StockDetailResponse,
    StockSearchItem,
    HistoricalDataResponse
)
from app.schemas.news_assistant import NewsArticleItem

router = APIRouter(prefix="/stocks", tags=["Stocks"])

@router.get("/search", response_model=List[StockSearchItem])
def search_stocks(
    q: str = Query(..., min_length=1, description="Search term for symbol or company name"),
    market: Optional[str] = Query(None, description="Filter by market: 'IN' or 'US'"),
    db: Session = Depends(get_db)
):
    service = MarketService(db)
    return service.search_stocks(query=q, market=market)

@router.get("/{symbol}", response_model=StockDetailResponse)
def get_stock_detail(
    symbol: str = Path(..., description="Stock symbol (e.g. RELIANCE, TCS, AAPL, NVDA)"),
    force_demo: bool = Query(False, description="Force demo data mode"),
    db: Session = Depends(get_db)
):
    service = MarketService(db)
    return service.get_stock_quote(symbol.upper(), force_demo=force_demo)

@router.get("/{symbol}/history", response_model=HistoricalDataResponse)
def get_stock_history(
    symbol: str = Path(..., description="Stock symbol"),
    timeframe: str = Query("1Y", description="Timeframe: 1D, 5D, 1M, 3M, 6M, 1Y, 5Y"),
    force_demo: bool = Query(False, description="Force demo mode"),
    db: Session = Depends(get_db)
):
    service = MarketService(db)
    return service.get_stock_history(symbol.upper(), timeframe=timeframe, force_demo=force_demo)

@router.get("/{symbol}/news", response_model=List[NewsArticleItem])
def get_stock_news(
    symbol: str = Path(..., description="Stock symbol"),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    service = MarketService(db)
    return service.get_news(symbol=symbol.upper(), limit=limit)
