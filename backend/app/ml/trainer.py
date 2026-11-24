import os
import joblib
import pandas as pd
from typing import Dict, Any, List
from app.ml.features import prepare_training_dataset, engineer_features, FEATURE_COLUMNS
from app.ml.models import (
    NaivePersistenceModel,
    RidgeBaselineModel,
    RandomForestModel,
    GradientBoostingModel
)
from app.ml.evaluator import chronological_train_test_split, evaluate_model_performance

MODEL_DIR = os.path.join(os.path.dirname(__file__), "saved_models")
os.makedirs(MODEL_DIR, exist_ok=True)

def train_and_benchmark_models(df: pd.DataFrame, symbol: str, horizon_days: int = 5) -> Dict[str, Any]:
    """
    Trains all candidate models, compares strictly against Naive Baseline,
    and returns evaluation metrics and the winning model.
    """
    X, y = prepare_training_dataset(df, horizon_days=horizon_days)
    if len(X) < 40:
        raise ValueError(f"Insufficient historical samples for {symbol} (minimum 40 required, got {len(X)}).")

    X_train, X_test, y_train, y_test = chronological_train_test_split(X, y, train_ratio=0.8)

    # 1. Evaluate Naive Baseline
    naive = NaivePersistenceModel()
    naive.fit(X_train, y_train)
    y_naive_pred = naive.predict(X_test)
    from sklearn.metrics import mean_absolute_error
    baseline_mae = float(mean_absolute_error(y_test, y_naive_pred))

    candidates = {
        "NaiveBaseline": naive,
        "RidgeBaseline": RidgeBaselineModel(alpha=1.0),
        "RandomForest": RandomForestModel(n_estimators=80, max_depth=4),
        "GradientBoosting": GradientBoostingModel(n_estimators=60, learning_rate=0.05, max_depth=3)
    }

    evaluations = []
    trained_models = {}

    for name, model_instance in candidates.items():
        eval_result = evaluate_model_performance(
            model=model_instance,
            X_train=X_train,
            y_train=y_train,
            X_test=X_test,
            y_test=y_test,
            baseline_mae=baseline_mae,
            model_name=name
        )
        evaluations.append(eval_result)
        trained_models[name] = model_instance

    # Select best model by lowest MAE on out-of-sample test
    best_eval = min(evaluations, key=lambda e: e["mae"])
    best_name = best_eval["model_name"]
    best_model = trained_models[best_name]

    # Feature Importance for best model if available
    feature_importance = []
    if hasattr(best_model, "feature_importances_") and best_model.feature_importances_ is not None:
        importances = best_model.feature_importances_
        for feat, imp in zip(FEATURE_COLUMNS, importances):
            feature_importance.append({"feature": feat, "importance": round(float(imp), 4)})
        feature_importance.sort(key=lambda x: x["importance"], reverse=True)
    else:
        # Default importance from Random Forest for reference
        rf = trained_models["RandomForest"]
        for feat, imp in zip(FEATURE_COLUMNS, rf.feature_importances_):
            feature_importance.append({"feature": feat, "importance": round(float(imp), 4)})
        feature_importance.sort(key=lambda x: x["importance"], reverse=True)

    # Persist the winning model
    model_path = os.path.join(MODEL_DIR, f"{symbol}_horizon_{horizon_days}d.joblib")
    joblib.dump({
        "model": best_model,
        "model_name": best_name,
        "eval_result": best_eval,
        "feature_importance": feature_importance
    }, model_path)

    return {
        "best_model_name": best_name,
        "best_model": best_model,
        "best_eval": best_eval,
        "evaluations": evaluations,
        "feature_importance": feature_importance
    }
