from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text
from datetime import datetime
from app.database.connection import Base

class Stock(Base):
    __tablename__ = "stocks"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(20), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    exchange = Column(String(20), nullable=False) # e.g. NSE, BSE, NASDAQ, NYSE
    market = Column(String(10), nullable=False, index=True) # IN or US
    sector = Column(String(50), nullable=True)
    industry = Column(String(100), nullable=True)
    currency = Column(String(10), default="INR") # INR or USD
    description = Column(Text, nullable=True)
    market_cap = Column(Float, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
