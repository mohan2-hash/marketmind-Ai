from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class BacktestRequest(BaseModel):
    symbol: str
    strategy: str # "SMA_CROSSOVER", "RSI_MEAN_REVERSION", "BOLLINGER_BREAKOUT"
    initial_capital: float = 100000.0
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    commission_pct: float = 0.1 # 0.1% commission per trade
    slippage_pct: float = 0.05 # 0.05% slippage
    parameters: Optional[Dict[str, Any]] = None # e.g. {"fast_period": 10, "slow_period": 30}

class SimulatedTrade(BaseModel):
    id: int
    entry_date: str
    exit_date: Optional[str] = None
    trade_type: str # "LONG"
    entry_price: float
    exit_price: Optional[float] = None
    shares: float
    pnl: Optional[float] = None
    pnl_pct: Optional[float] = None
    status: str # "CLOSED", "OPEN"
    exit_reason: Optional[str] = None

class EquityPoint(BaseModel):
    date: str
    portfolio_equity: float
    benchmark_equity: float
    drawdown_pct: float

class BacktestResponse(BaseModel):
    symbol: str
    strategy: str
    parameters: Dict[str, Any]
    initial_capital: float
    final_equity: float
    total_return_pct: float
    benchmark_return_pct: float
    alpha: float
    cagr: float
    sharpe_ratio: float
    max_drawdown_pct: float
    win_rate_pct: float
    total_trades: int
    winning_trades: int
    losing_trades: int
    profit_factor: Optional[float] = None
    equity_curve: List[EquityPoint]
    trades: List[SimulatedTrade]
    disclaimer: str
