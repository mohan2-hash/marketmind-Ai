from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class TransactionCreate(BaseModel):
    symbol: str
    transaction_type: str # "BUY", "SELL"
    quantity: float
    price: Optional[float] = None # If None, uses current market price
    notes: Optional[str] = None

class TransactionResponse(BaseModel):
    id: int
    symbol: str
    transaction_type: str
    quantity: float
    price: float
    fees: float
    total_amount: float
    timestamp: datetime
    notes: Optional[str] = None

class HoldingItem(BaseModel):
    symbol: str
    name: str
    exchange: str
    currency: str
    shares: float
    average_price: float
    current_price: float
    invested_value: float
    current_value: float
    unrealized_pnl: float
    unrealized_pnl_pct: float
    portfolio_weight_pct: float

class PortfolioResponse(BaseModel):
    id: int
    name: str
    currency: str
    cash_balance: float
    total_invested: float
    current_portfolio_value: float
    total_equity: float
    total_unrealized_pnl: float
    total_unrealized_pnl_pct: float
    total_realized_pnl: float
    holdings: List[HoldingItem]
    recent_transactions: List[TransactionResponse]
    sector_allocation: List[dict]

class WatchlistCreate(BaseModel):
    name: str = "My Watchlist"
    description: Optional[str] = None

class WatchlistItemAdd(BaseModel):
    symbol: str

class WatchlistItemResponse(BaseModel):
    id: int
    symbol: str
    name: str
    price: float
    change: float
    change_pct: float
    exchange: str
    currency: str
    market: str

class WatchlistResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    items: List[WatchlistItemResponse]

class AlertCreate(BaseModel):
    symbol: str
    target_price: float
    condition: str # "ABOVE", "BELOW"

class AlertResponse(BaseModel):
    id: int
    symbol: str
    target_price: float
    condition: str
    current_price: float
    is_triggered: bool
    is_active: bool
    created_at: datetime
