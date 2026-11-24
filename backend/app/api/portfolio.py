from fastapi import APIRouter, Depends, Path
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.services.portfolio_service import PortfolioService
from app.services.watchlist_service import WatchlistService, AlertService
from app.schemas.portfolio import (
    PortfolioResponse,
    TransactionCreate,
    TransactionResponse,
    WatchlistResponse,
    WatchlistItemAdd,
    AlertCreate,
    AlertResponse
)

router = APIRouter(tags=["Portfolio & Watchlists"])

# Portfolio Endpoints
@router.get("/portfolio", response_model=PortfolioResponse)
def get_portfolio(db: Session = Depends(get_db)):
    service = PortfolioService(db)
    return service.get_portfolio_summary()

@router.post("/portfolio/transactions", response_model=TransactionResponse)
def create_transaction(
    req: TransactionCreate,
    db: Session = Depends(get_db)
):
    service = PortfolioService(db)
    return service.execute_transaction(
        symbol=req.symbol,
        transaction_type=req.transaction_type,
        quantity=req.quantity,
        price=req.price,
        notes=req.notes
    )

# Watchlist Endpoints
@router.get("/watchlists", response_model=WatchlistResponse)
def get_watchlist(db: Session = Depends(get_db)):
    service = WatchlistService(db)
    return service.get_watchlist_details()

@router.post("/watchlists/items")
def add_to_watchlist(
    req: WatchlistItemAdd,
    db: Session = Depends(get_db)
):
    service = WatchlistService(db)
    return service.add_symbol_to_watchlist(symbol=req.symbol)

@router.delete("/watchlists/items/{symbol}")
def remove_from_watchlist(
    symbol: str = Path(...),
    db: Session = Depends(get_db)
):
    service = WatchlistService(db)
    return service.remove_symbol_from_watchlist(symbol=symbol)

# Alerts Endpoints
@router.get("/alerts", response_model=List[AlertResponse])
def get_alerts(db: Session = Depends(get_db)):
    service = AlertService(db)
    return service.get_alerts()

@router.post("/alerts", response_model=AlertResponse)
def create_alert(
    req: AlertCreate,
    db: Session = Depends(get_db)
):
    service = AlertService(db)
    alert_obj = service.create_alert(
        symbol=req.symbol,
        target_price=req.target_price,
        condition=req.condition
    )
    # Return formatted response
    alerts = service.get_alerts()
    created = next((a for a in alerts if a["id"] == alert_obj.id), alerts[0])
    return created

@router.delete("/alerts/{alert_id}")
def delete_alert(
    alert_id: int = Path(...),
    db: Session = Depends(get_db)
):
    service = AlertService(db)
    return service.delete_alert(alert_id)
