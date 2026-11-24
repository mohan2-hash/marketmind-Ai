from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class ForecastItem(BaseModel):
    horizon: str # "1D", "5D", "7D", "30D", "90D"
    forecast_date: str
    target_price: float
    lower_bound: float
    upper_bound: float
    expected_change_pct: float
    direction: str # "UP", "DOWN", "FLAT"
    confidence_level: float # e.g. 0.80 or 0.95
    model_name: str
    uncertainty_level: str # "LOW", "MODERATE", "HIGH", "EXTREME"
    explanation: str

class ModelEvaluationMetrics(BaseModel):
    model_name: str
    mae: float
    rmse: float
    mape: float
    directional_accuracy_pct: float
    baseline_mae: float
    beats_baseline: bool
    train_samples: int
    test_samples: int
    validation_method: str

class FeatureImportanceItem(BaseModel):
    feature: str
    importance: float

class PredictionResponse(BaseModel):
    symbol: str
    current_price: float
    currency: str
    data_timestamp: str
    last_training_date: str
    best_model_name: str
    forecasts: List[ForecastItem]
    model_evaluations: List[ModelEvaluationMetrics]
    feature_importance: List[FeatureImportanceItem]
    limitations: List[str]
    disclaimer: str

class TrainPredictionRequest(BaseModel):
    symbol: str
    models_to_train: Optional[List[str]] = ["RandomForest", "RidgeBaseline", "GradientBoosting"]
    retrain: bool = False

class TrainPredictionResponse(BaseModel):
    symbol: str
    status: str
    best_model: str
    training_summary: List[ModelEvaluationMetrics]
    trained_at: str
