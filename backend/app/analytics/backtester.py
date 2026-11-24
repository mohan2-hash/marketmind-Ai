import numpy as np
import pandas as pd
from typing import Dict, Any, List
from app.analytics.technical import calculate_rsi, calculate_bollinger_bands

def run_backtest_strategy(
    df: pd.DataFrame,
    symbol: str,
    strategy: str = "SMA_CROSSOVER",
    initial_capital: float = 100000.0,
    commission_pct: float = 0.1, # 0.1% fee
    slippage_pct: float = 0.05,  # 0.05% slippage
    parameters: Dict[str, Any] = None
) -> Dict[str, Any]:
    """
    Backtesting engine simulating realistic historical trade execution with
    transaction friction (slippage & commissions) and strict prevention of look-ahead bias.
    """
    df = df.copy().sort_values('timestamp').reset_index(drop=True)
    if len(df) < 50:
        raise ValueError("Insufficient historical bars for backtesting (minimum 50 bars required).")

    params = parameters or {}
    close = df['close']

    # Generate signals
    signals = pd.Series(0, index=df.index)

    if strategy == "SMA_CROSSOVER":
        fast = int(params.get("fast_period", 10))
        slow = int(params.get("slow_period", 30))
        sma_fast = close.rolling(fast).mean()
        sma_slow = close.rolling(slow).mean()
        # 1 when fast > slow, 0 otherwise
        signals = (sma_fast > sma_slow).astype(int)

    elif strategy == "RSI_MEAN_REVERSION":
        rsi_period = int(params.get("rsi_period", 14))
        oversold = float(params.get("oversold_threshold", 30))
        overbought = float(params.get("overbought_threshold", 70))
        
        rsi = calculate_rsi(close, rsi_period)
        
        in_trade = 0
        sig_list = []
        for val in rsi:
            if pd.isna(val):
                sig_list.append(0)
            elif val < oversold:
                in_trade = 1
                sig_list.append(1)
            elif val > overbought:
                in_trade = 0
                sig_list.append(0)
            else:
                sig_list.append(in_trade)
        signals = pd.Series(sig_list, index=df.index)

    elif strategy == "BOLLINGER_BREAKOUT":
        bb_period = int(params.get("period", 20))
        bb_std = float(params.get("std", 2.0))
        upper, middle, lower = calculate_bollinger_bands(close, bb_period, bb_std)
        
        in_trade = 0
        sig_list = []
        for i in range(len(df)):
            c = close.iloc[i]
            u = upper.iloc[i]
            m = middle.iloc[i]
            if pd.isna(u):
                sig_list.append(0)
            elif c > u:
                in_trade = 1
                sig_list.append(1)
            elif c < m:
                in_trade = 0
                sig_list.append(0)
            else:
                sig_list.append(in_trade)
        signals = pd.Series(sig_list, index=df.index)

    else:
        # Default buy & hold
        strategy = "BUY_AND_HOLD"
        signals = pd.Series(1, index=df.index)

    # Execution Simulation
    cash = initial_capital
    shares = 0.0
    equity_curve = []
    trades = []
    
    current_trade = None
    trade_id = 1

    fee_multiplier = 1.0 + (commission_pct + slippage_pct) / 100.0
    sell_multiplier = 1.0 - (commission_pct + slippage_pct) / 100.0

    benchmark_shares = (initial_capital * (1.0 - (commission_pct / 100.0))) / close.iloc[0]

    for i in range(1, len(df)):
        dt = str(df['timestamp'].iloc[i])
        price = float(close.iloc[i])
        sig = signals.iloc[i]
        prev_sig = signals.iloc[i - 1]

        # BUY trigger (0 -> 1)
        if prev_sig == 0 and sig == 1 and cash > 10:
            exec_price = price * fee_multiplier
            shares = cash / exec_price
            cash = 0.0
            current_trade = {
                "id": trade_id,
                "entry_date": dt,
                "trade_type": "LONG",
                "entry_price": round(exec_price, 2),
                "shares": round(shares, 4),
                "status": "OPEN"
            }
            trade_id += 1

        # SELL trigger (1 -> 0)
        elif prev_sig == 1 and sig == 0 and shares > 0:
            exec_price = price * sell_multiplier
            cash = shares * exec_price
            
            if current_trade:
                pnl = round(cash - (current_trade["shares"] * current_trade["entry_price"]), 2)
                pnl_pct = round(((exec_price - current_trade["entry_price"]) / current_trade["entry_price"]) * 100, 2)
                current_trade.update({
                    "exit_date": dt,
                    "exit_price": round(exec_price, 2),
                    "pnl": pnl,
                    "pnl_pct": pnl_pct,
                    "status": "CLOSED",
                    "exit_reason": "Strategy Signal Reversal"
                })
                trades.append(current_trade)
                current_trade = None
            shares = 0.0

        current_portfolio_val = cash + (shares * price * sell_multiplier if shares > 0 else 0.0)
        benchmark_val = benchmark_shares * price

        equity_curve.append({
            "date": dt,
            "portfolio_equity": round(current_portfolio_val, 2),
            "benchmark_equity": round(benchmark_val, 2),
            "drawdown_pct": 0.0 # Will compute next
        })

    # Close open trade at final bar if any
    if current_trade and shares > 0:
        final_price = float(close.iloc[-1]) * sell_multiplier
        final_val = shares * final_price
        pnl = round(final_val - (current_trade["shares"] * current_trade["entry_price"]), 2)
        pnl_pct = round(((final_price - current_trade["entry_price"]) / current_trade["entry_price"]) * 100, 2)
        current_trade.update({
            "exit_date": str(df['timestamp'].iloc[-1]),
            "exit_price": round(final_price, 2),
            "pnl": pnl,
            "pnl_pct": pnl_pct,
            "status": "CLOSED",
            "exit_reason": "Backtest Period Concluded"
        })
        trades.append(current_trade)

    # Compute Equity Metrics
    final_equity = equity_curve[-1]["portfolio_equity"] if equity_curve else initial_capital
    total_return_pct = round(((final_equity - initial_capital) / initial_capital) * 100, 2)
    
    final_bench = equity_curve[-1]["benchmark_equity"] if equity_curve else initial_capital
    benchmark_return_pct = round(((final_bench - initial_capital) / initial_capital) * 100, 2)
    alpha = round(total_return_pct - benchmark_return_pct, 2)

    # Max Drawdown of strategy
    eq_series = pd.Series([pt["portfolio_equity"] for pt in equity_curve])
    running_max = eq_series.cummax()
    dd_series = (eq_series - running_max) / running_max
    max_dd_pct = round(float(abs(dd_series.min()) * 100), 2)

    for i in range(len(equity_curve)):
        equity_curve[i]["drawdown_pct"] = round(float(dd_series.iloc[i] * 100), 2)

    # Trade stats
    closed_trades = [t for t in trades if t["status"] == "CLOSED"]
    winning = [t for t in closed_trades if (t.get("pnl") or 0) > 0]
    losing = [t for t in closed_trades if (t.get("pnl") or 0) <= 0]
    
    total_t = len(closed_trades)
    win_rate = round((len(winning) / total_t) * 100, 2) if total_t > 0 else 0.0

    gross_profit = sum(t["pnl"] for t in winning) if winning else 0.0
    gross_loss = abs(sum(t["pnl"] for t in losing)) if losing else 0.0
    profit_factor = round(gross_profit / gross_loss, 2) if gross_loss > 0 else (round(gross_profit, 2) if gross_profit > 0 else 1.0)

    # CAGR and Sharpe
    days = len(df)
    cagr = round((((final_equity / initial_capital) ** (252 / max(1, days))) - 1) * 100, 2)
    
    port_returns = eq_series.pct_change().dropna()
    sharpe = round(float((port_returns.mean() / (port_returns.std() + 1e-9)) * np.sqrt(252)), 2) if len(port_returns) > 0 else 0.0

    return {
        "symbol": symbol,
        "strategy": strategy,
        "parameters": params,
        "initial_capital": initial_capital,
        "final_equity": final_equity,
        "total_return_pct": total_return_pct,
        "benchmark_return_pct": benchmark_return_pct,
        "alpha": alpha,
        "cagr": cagr,
        "sharpe_ratio": sharpe,
        "max_drawdown_pct": max_dd_pct,
        "win_rate_pct": win_rate,
        "total_trades": total_t,
        "winning_trades": len(winning),
        "losing_trades": len(losing),
        "profit_factor": profit_factor,
        "equity_curve": equity_curve,
        "trades": trades,
        "disclaimer": "Backtesting results reflect historical simulation with slippage & commission fees. Past simulated returns do not guarantee future performance."
    }
