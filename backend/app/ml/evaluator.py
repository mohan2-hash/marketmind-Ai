import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
from sklearn.metrics import mean_absolute_error, root_mean_squared_error

def calculate_mape(y_true: np.ndarray, y_pred: np.ndarray, eps: float = 1e-4) -> float:
    """Calculates Mean Absolute Percentage Error with safeguards against near-zero denominators."""
    denom = np.where(np.abs(y_true) < eps, eps, np.abs(y_true))
    return float(np.mean(np.abs((y_true - y_pred) / denom)) * 100)

def calculate_directional_accuracy(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Calculates percentage of correct sign predictions (up vs down)."""
    if len(y_true) == 0:
        return 50.0
    correct = np.sign(y_true) == np.sign(y_pred)
    return float(np.mean(correct) * 100)

def chronological_train_test_split(
    X: pd.DataFrame,
    y: pd.Series,
    train_ratio: float = 0.8
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series]:
    """
    Splits time-series data chronologically.
    CRITICAL: NEVER randomly shuffle financial observations.
    """
    n = len(X)
    split_idx = int(n * train_ratio)
    
    X_train = X.iloc[:split_idx]
    X_test = X.iloc[split_idx:]
    y_train = y.iloc[:split_idx]
    y_test = y.iloc[split_idx:]
    
    return X_train, X_test, y_train, y_test

def evaluate_model_performance(
    model: Any,
    X_train: pd.DataFrame,
    y_train: pd.Series,
    X_test: pd.DataFrame,
    y_test: pd.Series,
    baseline_mae: float,
    model_name: str
) -> Dict[str, Any]:
    """
    Fits and evaluates a model on out-of-sample chronological test data.
    Computes MAE, RMSE, MAPE, Directional Accuracy, and Residual standard deviation.
    """
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    
    mae = float(mean_absolute_error(y_test, y_pred))
    rmse = float(root_mean_squared_error(y_test, y_pred))
    mape = calculate_mape(y_test.values, y_pred)
    dir_acc = calculate_directional_accuracy(y_test.values, y_pred)
    
    residuals = y_test.values - y_pred
    residual_std = float(np.std(residuals))

    return {
        "model_name": model_name,
        "mae": round(mae, 4),
        "rmse": round(rmse, 4),
        "mape": round(mape, 2),
        "directional_accuracy_pct": round(dir_acc, 1),
        "baseline_mae": round(baseline_mae, 4),
        "beats_baseline": mae < baseline_mae,
        "residual_std": residual_std,
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "validation_method": "Chronological Walk-Forward Split (80/20)"
    }
