from fastapi import APIRouter, Depends, Path
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.services.market_service import MarketService
from app.ml.predictor import generate_multi_horizon_predictions
from app.ml.trainer import train_and_benchmark_models
from app.schemas.prediction import (
    PredictionResponse,
    TrainPredictionRequest,
    TrainPredictionResponse
)
from datetime import datetime

router = APIRouter(prefix="/predictions", tags=["Predictions"])

@router.get("/{symbol}", response_model=PredictionResponse)
def get_predictions(
    symbol: str = Path(..., description="Stock symbol for ML multi-horizon forecasting"),
    db: Session = Depends(get_db)
):
    service = MarketService(db)
    provider = service.get_provider()
    df = provider.get_historical_ohlcv(symbol.upper(), timeframe="1Y")
    quote = provider.get_quote(symbol.upper())
    
    return generate_multi_horizon_predictions(
        df=df,
        symbol=symbol.upper(),
        currency=quote.get("currency", "USD")
    )

@router.post("/train", response_model=TrainPredictionResponse)
def train_prediction_models(
    req: TrainPredictionRequest,
    db: Session = Depends(get_db)
):
    service = MarketService(db)
    provider = service.get_provider()
    df = provider.get_historical_ohlcv(req.symbol.upper(), timeframe="1Y")
    
    results = train_and_benchmark_models(df, symbol=req.symbol.upper(), horizon_days=5)
    
    return {
        "symbol": req.symbol.upper(),
        "status": "SUCCESS",
        "best_model": results["best_model_name"],
        "training_summary": results["evaluations"],
        "trained_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC")
    }
