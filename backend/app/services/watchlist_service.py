from sqlalchemy.orm import Session
from typing import List, Dict, Any
from fastapi import HTTPException
from app.models.watchlist import Watchlist, WatchlistItem
from app.models.alert import PriceAlert
from app.services.market_service import MarketService

class WatchlistService:
    def __init__(self, db: Session):
        self.db = db
        self.market_service = MarketService(db)

    def get_or_create_default_watchlist(self) -> Watchlist:
        wl = self.db.query(Watchlist).first()
        if not wl:
            wl = Watchlist(name="Primary Watchlist", description="Default user watchlist")
            self.db.add(wl)
            self.db.commit()
            self.db.refresh(wl)
            
            # Add a couple initial stocks
            initial_symbols = ["RELIANCE", "TCS", "AAPL", "NVDA"]
            for s in initial_symbols:
                item = WatchlistItem(watchlist_id=wl.id, symbol=s)
                self.db.add(item)
            self.db.commit()
            self.db.refresh(wl)
        return wl

    def get_watchlist_details(self, watchlist_id: int = None) -> Dict[str, Any]:
        if watchlist_id:
            wl = self.db.query(Watchlist).filter(Watchlist.id == watchlist_id).first()
        else:
            wl = self.get_or_create_default_watchlist()

        if not wl:
            raise HTTPException(status_code=404, detail="Watchlist not found.")

        items = []
        for item in wl.items:
            quote = self.market_service.get_stock_quote(item.symbol)
            items.append({
                "id": item.id,
                "symbol": item.symbol,
                "name": quote.get("name", item.symbol),
                "price": quote.get("price", 0.0),
                "change": quote.get("change", 0.0),
                "change_pct": quote.get("change_pct", 0.0),
                "exchange": quote.get("exchange", "NSE"),
                "currency": quote.get("currency", "INR"),
                "market": quote.get("market", "IN")
            })

        return {
            "id": wl.id,
            "name": wl.name,
            "description": wl.description,
            "items": items
        }

    def add_symbol_to_watchlist(self, symbol: str, watchlist_id: int = None) -> Dict[str, Any]:
        sym = symbol.strip().upper()
        wl = self.get_or_create_default_watchlist() if not watchlist_id else self.db.query(Watchlist).filter(Watchlist.id == watchlist_id).first()
        if not wl:
            raise HTTPException(status_code=404, detail="Watchlist not found")

        existing = self.db.query(WatchlistItem).filter(
            WatchlistItem.watchlist_id == wl.id,
            WatchlistItem.symbol == sym
        ).first()

        if existing:
            return {"message": f"{sym} is already in the watchlist"}

        item = WatchlistItem(watchlist_id=wl.id, symbol=sym)
        self.db.add(item)
        self.db.commit()
        return {"message": f"Added {sym} to watchlist successfully"}

    def remove_symbol_from_watchlist(self, symbol: str, watchlist_id: int = None) -> Dict[str, Any]:
        sym = symbol.strip().upper()
        wl = self.get_or_create_default_watchlist() if not watchlist_id else self.db.query(Watchlist).filter(Watchlist.id == watchlist_id).first()
        
        item = self.db.query(WatchlistItem).filter(
            WatchlistItem.watchlist_id == wl.id,
            WatchlistItem.symbol == sym
        ).first()

        if not item:
            raise HTTPException(status_code=404, detail=f"{sym} not found in watchlist")

        self.db.delete(item)
        self.db.commit()
        return {"message": f"Removed {sym} from watchlist"}

class AlertService:
    def __init__(self, db: Session):
        self.db = db
        self.market_service = MarketService(db)

    def create_alert(self, symbol: str, target_price: float, condition: str) -> PriceAlert:
        alert = PriceAlert(
            symbol=symbol.strip().upper(),
            target_price=target_price,
            condition=condition.upper(),
            is_active=True
        )
        self.db.add(alert)
        self.db.commit()
        self.db.refresh(alert)
        return alert

    def get_alerts(self) -> List[Dict[str, Any]]:
        alerts = self.db.query(PriceAlert).order_by(PriceAlert.created_at.desc()).all()
        results = []
        for a in alerts:
            quote = self.market_service.get_stock_quote(a.symbol)
            curr = float(quote.get("price", 0.0))
            # Check condition
            triggered = a.is_triggered
            if not triggered and a.is_active:
                if a.condition == "ABOVE" and curr >= a.target_price:
                    triggered = True
                    a.is_triggered = True
                    self.db.commit()
                elif a.condition == "BELOW" and curr <= a.target_price:
                    triggered = True
                    a.is_triggered = True
                    self.db.commit()

            results.append({
                "id": a.id,
                "symbol": a.symbol,
                "target_price": a.target_price,
                "condition": a.condition,
                "current_price": curr,
                "is_triggered": triggered,
                "is_active": a.is_active,
                "created_at": a.created_at
            })
        return results

    def delete_alert(self, alert_id: int):
        alert = self.db.query(PriceAlert).filter(PriceAlert.id == alert_id).first()
        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")
        self.db.delete(alert)
        self.db.commit()
        return {"message": "Alert deleted"}
