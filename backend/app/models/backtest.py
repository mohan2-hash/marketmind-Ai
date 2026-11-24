from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
from datetime import datetime
from app.database.connection import Base

class BacktestRun(Base):
    __tablename__ = "backtest_runs"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(20), nullable=False, index=True)
    strategy = Column(String(50), nullable=False) # "SMA_CROSSOVER", "RSI_MEAN_REVERSION", "BUY_AND_HOLD"
    parameters = Column(JSON, nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    initial_capital = Column(Float, nullable=False)
    final_equity = Column(Float, nullable=False)
    total_return_pct = Column(Float, nullable=False)
    benchmark_return_pct = Column(Float, nullable=False)
    alpha = Column(Float, nullable=False)
    cagr = Column(Float, nullable=False)
    sharpe_ratio = Column(Float, nullable=False)
    max_drawdown_pct = Column(Float, nullable=False)
    win_rate_pct = Column(Float, nullable=False)
    total_trades = Column(Integer, nullable=False)
    profit_factor = Column(Float, nullable=True)
    equity_curve = Column(JSON, nullable=False)
    trades = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
