from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database.connection import get_db
from app.services.market_service import MarketService
from app.schemas.market import MarketOverviewResponse

router = APIRouter(prefix="/markets", tags=["Markets"])

@router.get("/overview", response_model=MarketOverviewResponse)
def get_market_overview(
    market: str = Query("IN", description="Market identifier: 'IN' or 'US'"),
    force_demo: bool = Query(False, description="Force demo data mode"),
    db: Session = Depends(get_db)
):
    service = MarketService(db)
    return service.get_market_overview(market=market, force_demo=force_demo)
