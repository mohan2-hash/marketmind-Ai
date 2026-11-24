from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON
from datetime import datetime
from app.database.connection import Base

class ModelMetadata(Base):
    __tablename__ = "model_metadata"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(20), nullable=False, index=True)
    model_name = Column(String(50), nullable=False) # e.g. "RandomForest", "RidgeBaseline", "GradientBoosting"
    trained_at = Column(DateTime, default=datetime.utcnow)
    data_start = Column(DateTime, nullable=False)
    data_end = Column(DateTime, nullable=False)
    mae = Column(Float, nullable=True)
    rmse = Column(Float, nullable=True)
    mape = Column(Float, nullable=True)
    directional_accuracy = Column(Float, nullable=True)
    baseline_mae = Column(Float, nullable=True)
    feature_importance = Column(JSON, nullable=True)
    hyperparameters = Column(JSON, nullable=True)

class PredictionRecord(Base):
    __tablename__ = "prediction_records"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(20), nullable=False, index=True)
    horizon = Column(String(10), nullable=False) # 1D, 5D, 7D, 30D, 90D
    model_name = Column(String(50), nullable=False)
    current_price = Column(Float, nullable=False)
    predicted_price = Column(Float, nullable=False)
    lower_bound = Column(Float, nullable=False) # Prediction interval lower
    upper_bound = Column(Float, nullable=False) # Prediction interval upper
    direction = Column(String(10), nullable=False) # UP, DOWN, NEUTRAL
    expected_return_pct = Column(Float, nullable=False)
    uncertainty_level = Column(String(20), default="MODERATE") # LOW, MODERATE, HIGH
    generated_at = Column(DateTime, default=datetime.utcnow)
