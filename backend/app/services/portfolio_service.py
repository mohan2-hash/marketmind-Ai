from sqlalchemy.orm import Session
from typing import Dict, Any, List
from fastapi import HTTPException
from app.models.portfolio import Portfolio, PortfolioTransaction
from app.services.market_service import MarketService

class PortfolioService:
    def __init__(self, db: Session):
        self.db = db
        self.market_service = MarketService(db)

    def get_or_create_default_portfolio(self) -> Portfolio:
        portfolio = self.db.query(Portfolio).first()
        if not portfolio:
            portfolio = Portfolio(
                name="Primary Virtual Portfolio",
                currency="INR",
                cash_balance=1000000.0,
                initial_cash=1000000.0
            )
            self.db.add(portfolio)
            self.db.commit()
            self.db.refresh(portfolio)
        return portfolio

    def execute_transaction(
        self,
        symbol: str,
        transaction_type: str,
        quantity: float,
        price: float = None,
        notes: str = None
    ) -> PortfolioTransaction:
        if quantity <= 0:
            raise HTTPException(status_code=400, detail="Transaction quantity must be greater than zero.")

        portfolio = self.get_or_create_default_portfolio()
        
        # If price not provided, get latest quote
        quote = self.market_service.get_stock_quote(symbol)
        exec_price = price if price and price > 0 else float(quote["price"])
        commission = round(exec_price * quantity * 0.001, 2) # 0.1% virtual commission
        total_amount = round(exec_price * quantity, 2)

        tx_type = transaction_type.upper()

        if tx_type == "BUY":
            required_cash = total_amount + commission
            if portfolio.cash_balance < required_cash:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient virtual cash balance ({portfolio.cash_balance:.2f}). Required: {required_cash:.2f}"
                )
            portfolio.cash_balance -= required_cash

        elif tx_type == "SELL":
            # Verify existing holdings
            holdings = self.get_holdings(portfolio.id)
            user_holding = next((h for h in holdings if h["symbol"] == symbol), None)
            
            if not user_holding or user_holding["shares"] < quantity:
                owned = user_holding["shares"] if user_holding else 0
                raise HTTPException(
                    status_code=400,
                    detail=f"Cannot sell {quantity} shares of {symbol}. You only own {owned} shares."
                )
            
            proceeds = total_amount - commission
            portfolio.cash_balance += proceeds

        else:
            raise HTTPException(status_code=400, detail=f"Unsupported transaction type: {tx_type}")

        tx = PortfolioTransaction(
            portfolio_id=portfolio.id,
            symbol=symbol,
            transaction_type=tx_type,
            quantity=quantity,
            price=exec_price,
            fees=commission,
            total_amount=total_amount,
            notes=notes
        )
        self.db.add(tx)
        self.db.commit()
        self.db.refresh(tx)
        return tx

    def get_holdings(self, portfolio_id: int) -> List[Dict[str, Any]]:
        # Fetch in order
        txs = (
            self.db.query(PortfolioTransaction)
            .filter(PortfolioTransaction.portfolio_id == portfolio_id)
            .order_by(PortfolioTransaction.timestamp.asc())
            .all()
        )

        positions: Dict[str, Dict[str, Any]] = {}
        
        for tx in txs:
            sym = tx.symbol
            if sym not in positions:
                positions[sym] = {"shares": 0.0, "total_cost": 0.0, "realized_pnl": 0.0}
            
            if tx.transaction_type == "BUY":
                positions[sym]["shares"] += tx.quantity
                positions[sym]["total_cost"] += (tx.quantity * tx.price) + tx.fees
            elif tx.transaction_type == "SELL":
                avg_cost = positions[sym]["total_cost"] / positions[sym]["shares"] if positions[sym]["shares"] > 0 else tx.price
                cost_of_sold = avg_cost * tx.quantity
                proceeds = (tx.quantity * tx.price) - tx.fees
                
                positions[sym]["realized_pnl"] += proceeds - cost_of_sold
                positions[sym]["shares"] -= tx.quantity
                positions[sym]["total_cost"] -= cost_of_sold
                if positions[sym]["shares"] <= 1e-6:
                    positions[sym]["shares"] = 0.0
                    positions[sym]["total_cost"] = 0.0

        holdings_list = []
        for sym, pos in positions.items():
            if pos["shares"] > 0:
                quote = self.market_service.get_stock_quote(sym)
                curr_price = float(quote["price"])
                curr_val = round(pos["shares"] * curr_price, 2)
                inv_val = round(pos["total_cost"], 2)
                avg_price = round(inv_val / pos["shares"], 2) if pos["shares"] > 0 else 0.0
                unrealized_pnl = round(curr_val - inv_val, 2)
                unrealized_pnl_pct = round((unrealized_pnl / inv_val) * 100, 2) if inv_val > 0 else 0.0

                holdings_list.append({
                    "symbol": sym,
                    "name": quote.get("name", sym),
                    "exchange": quote.get("exchange", "NSE"),
                    "currency": quote.get("currency", "INR"),
                    "shares": round(pos["shares"], 4),
                    "average_price": avg_price,
                    "current_price": curr_price,
                    "invested_value": inv_val,
                    "current_value": curr_val,
                    "unrealized_pnl": unrealized_pnl,
                    "unrealized_pnl_pct": unrealized_pnl_pct,
                    "portfolio_weight_pct": 0.0,
                    "sector": quote.get("sector", "General")
                })

        return holdings_list

    def get_portfolio_summary(self) -> Dict[str, Any]:
        portfolio = self.get_or_create_default_portfolio()
        holdings = self.get_holdings(portfolio.id)
        
        total_holdings_val = sum(h["current_value"] for h in holdings)
        total_invested = sum(h["invested_value"] for h in holdings)
        total_equity = round(portfolio.cash_balance + total_holdings_val, 2)

        # Compute weights
        for h in holdings:
            h["portfolio_weight_pct"] = round((h["current_value"] / total_equity) * 100, 2) if total_equity > 0 else 0.0

        # Sector allocation
        sector_map: Dict[str, float] = {}
        for h in holdings:
            sec = h.get("sector", "Other")
            sector_map[sec] = sector_map.get(sec, 0.0) + h["current_value"]
        
        sector_allocation = [
            {"sector": sec, "value": round(val, 2), "weight_pct": round((val / total_equity) * 100, 2)}
            for sec, val in sector_map.items()
        ]
        if portfolio.cash_balance > 0:
            sector_allocation.append({
                "sector": "Cash & Liquidity",
                "value": round(portfolio.cash_balance, 2),
                "weight_pct": round((portfolio.cash_balance / total_equity) * 100, 2)
            })

        # Recent transactions
        recent_txs = (
            self.db.query(PortfolioTransaction)
            .filter(PortfolioTransaction.portfolio_id == portfolio.id)
            .order_by(PortfolioTransaction.timestamp.desc())
            .limit(10)
            .all()
        )

        total_unrealized_pnl = round(total_holdings_val - total_invested, 2)
        total_unrealized_pnl_pct = round((total_unrealized_pnl / total_invested) * 100, 2) if total_invested > 0 else 0.0

        return {
            "id": portfolio.id,
            "name": portfolio.name,
            "currency": portfolio.currency,
            "cash_balance": round(portfolio.cash_balance, 2),
            "total_invested": round(total_invested, 2),
            "current_portfolio_value": round(total_holdings_val, 2),
            "total_equity": total_equity,
            "total_unrealized_pnl": total_unrealized_pnl,
            "total_unrealized_pnl_pct": total_unrealized_pnl_pct,
            "total_realized_pnl": 0.0,
            "holdings": holdings,
            "recent_transactions": recent_txs,
            "sector_allocation": sector_allocation
        }
