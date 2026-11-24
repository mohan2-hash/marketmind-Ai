import numpy as np
from sklearn.linear_model import Ridge
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from typing import Dict, Any, Optional

class NaivePersistenceModel:
    """
    Baseline model that forecasts zero excess forward return (or long-run historical drift).
    Serves as the primary benchmark to test whether complex models add genuine predictive power.
    """
    def __init__(self):
        self.mean_return_ = 0.0

    def fit(self, X, y):
        self.mean_return_ = float(np.mean(y))
        return self

    def predict(self, X):
        return np.full(shape=(len(X),), fill_value=self.mean_return_)

class RidgeBaselineModel:
    """L2-regularized linear baseline model."""
    def __init__(self, alpha: float = 1.0):
        self.model = Ridge(alpha=alpha, random_state=42)

    def fit(self, X, y):
        self.model.fit(X, y)
        return self

    def predict(self, X):
        return self.model.predict(X)

    @property
    def feature_importances_(self):
        return np.abs(self.model.coef_)

class RandomForestModel:
    """Random Forest regressor with constrained depth to mitigate financial overfitting."""
    def __init__(self, n_estimators: int = 100, max_depth: int = 5):
        self.model = RandomForestRegressor(
            n_estimators=n_estimators,
            max_depth=max_depth,
            min_samples_split=10,
            min_samples_leaf=5,
            random_state=42,
            n_jobs=1
        )

    def fit(self, X, y):
        self.model.fit(X, y)
        return self

    def predict(self, X):
        return self.model.predict(X)

    @property
    def feature_importances_(self):
        return self.model.feature_importances_

class GradientBoostingModel:
    """Gradient Boosting Regressor for non-linear momentum & volatility interactions."""
    def __init__(self, n_estimators: int = 80, learning_rate: float = 0.05, max_depth: int = 3):
        self.model = GradientBoostingRegressor(
            n_estimators=n_estimators,
            learning_rate=learning_rate,
            max_depth=max_depth,
            subsample=0.8,
            random_state=42
        )

    def fit(self, X, y):
        self.model.fit(X, y)
        return self

    def predict(self, X):
        return self.model.predict(X)

    @property
    def feature_importances_(self):
        return self.model.feature_importances_
