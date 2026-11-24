import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, Any, List
from app.ml.features import engineer_features, FEATURE_COLUMNS
from app.ml.trainer import train_and_benchmark_models

HORIZONS = [
    {"label": "1D", "days": 1, "scaling": 1.0, "uncertainty": "LOW"},
    {"label": "5D", "days": 5, "scaling": 1.5, "uncertainty": "MODERATE"},
    {"label": "7D", "days": 7, "scaling": 1.8, "uncertainty": "MODERATE"},
    {"label": "30D", "days": 30, "scaling": 2.6, "uncertainty": "HIGH"},
    {"label": "90D", "days": 90, "scaling": 3.8, "uncertainty": "EXTREME"}
]

def generate_multi_horizon_predictions(df: pd.DataFrame, symbol: str, currency: str = "USD") -> Dict[str, Any]:
    """
    Generates multi-horizon forecasts with empirical uncertainty bands, model evaluations,
    and transparency warnings.
    """
    df = df.copy().sort_values('timestamp').reset_index(drop=True)
    current_price = float(df['close'].iloc[-1])
    data_timestamp = str(df['timestamp'].iloc[-1])

    # Compute features for latest available bar
    featured_df = engineer_features(df)
    latest_features = featured_df[FEATURE_COLUMNS].iloc[[-1]]

    # Train and evaluate models on 5-day horizon for primary benchmarking
    benchmark_results = train_and_benchmark_models(df, symbol=symbol, horizon_days=5)
    best_model = benchmark_results["best_model"]
    best_name = benchmark_results["best_model_name"]
    residual_std = benchmark_results["best_eval"]["residual_std"]

    # Predict base forward return from features
    base_pred_return = float(best_model.predict(latest_features)[0])

    forecasts = []
    now_dt = datetime.now()

    for h in HORIZONS:
        days = h["days"]
        forecast_dt = (now_dt + timedelta(days=days)).strftime("%Y-%m-%d")
        
        # Scale return with diminishing momentum / mean reversion assumption for longer horizons
        scale_time = (days / 5.0) ** 0.5
        horizon_return = float(np.clip(base_pred_return * scale_time, -0.40, 0.40))
        target_price = round(current_price * (1.0 + horizon_return), 2)

        # Statistical 80% prediction interval (z ~ 1.28) scaled with time uncertainty
        margin_pct = float(1.28 * residual_std * h["scaling"])
        lower_bound = round(max(0.01, current_price * (1.0 + horizon_return - margin_pct)), 2)
        upper_bound = round(current_price * (1.0 + horizon_return + margin_pct), 2)

        ret_pct = round(horizon_return * 100, 2)
        if ret_pct > 0.5:
            direction = "UP"
        elif ret_pct < -0.5:
            direction = "DOWN"
        else:
            direction = "FLAT"

        forecasts.append({
            "horizon": h["label"],
            "forecast_date": forecast_dt,
            "target_price": target_price,
            "lower_bound": lower_bound,
            "upper_bound": upper_bound,
            "expected_change_pct": ret_pct,
            "direction": direction,
            "confidence_level": 0.80,
            "model_name": best_name,
            "uncertainty_level": h["uncertainty"],
            "explanation": f"Model expects a {ret_pct}% {direction.lower()} move within a 80% confidence interval of [{lower_bound}, {upper_bound}]."
        })

    limitations = [
        "Uncertainty expands significantly as the forecast horizon extends from 1D to 90D.",
        "Financial markets exhibit regime shifts, unexpected macroeconomic news, and non-stationarity that past models cannot anticipate.",
        "The model is calibrated strictly on chronological historical price/volume series and does not account for future unforeseen external shocks."
    ]

    disclaimer = (
        "IMPORTANT NOTICE: Predictions are generated for educational and analytical exploration by machine learning models. "
        "They do NOT constitute investment advice, trading recommendations, or guaranteed future prices. "
        "Never trade with capital you cannot afford to lose."
    )

    return {
        "symbol": symbol,
        "current_price": current_price,
        "currency": currency,
        "data_timestamp": data_timestamp,
        "last_training_date": datetime.now().strftime("%Y-%m-%d"),
        "best_model_name": best_name,
        "forecasts": forecasts,
        "model_evaluations": benchmark_results["evaluations"],
        "feature_importance": benchmark_results["feature_importance"][:8],
        "limitations": limitations,
        "disclaimer": disclaimer
    }
