import numpy as np
import pandas as pd
from typing import Tuple, List

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Transforms raw OHLCV time series into financial machine-learning features.
    STRICT RULE: Computed sequentially using only past observations to prevent target leakage.
    """
    df = df.copy().sort_values('timestamp').reset_index(drop=True)
    
    close = df['close']
    high = df['high']
    low = df['low']
    volume = df['volume']

    # 1. Price Returns & Momentum
    df['ret_1'] = close.pct_change(1)
    df['ret_5'] = close.pct_change(5)
    df['ret_10'] = close.pct_change(10)
    df['log_ret'] = np.log(close / close.shift(1))

    # 2. Moving Averages & Ratios
    df['sma_10'] = close.rolling(10).mean()
    df['sma_20'] = close.rolling(20).mean()
    df['sma_50'] = close.rolling(50).mean()
    
    df['ratio_close_sma10'] = close / (df['sma_10'] + 1e-9)
    df['ratio_close_sma20'] = close / (df['sma_20'] + 1e-9)
    df['ratio_close_sma50'] = close / (df['sma_50'] + 1e-9)
    df['ma_cross_10_50'] = (df['sma_10'] - df['sma_50']) / (close + 1e-9)

    # 3. Volatility & Range
    df['volatility_10'] = df['ret_1'].rolling(10).std()
    df['volatility_20'] = df['ret_1'].rolling(20).std()
    
    # Intraday Normalized Range
    df['hl_range'] = (high - low) / (close + 1e-9)
    
    # 4. Volume Features
    vol_sma_10 = volume.rolling(10).mean()
    df['vol_ratio_10'] = volume / (vol_sma_10 + 1e-9)
    df['vol_change_1'] = volume.pct_change(1)

    # 5. Technical Indicators
    # RSI (14)
    delta = close.diff()
    gain = delta.clip(lower=0)
    loss = -1 * delta.clip(upper=0)
    avg_gain = gain.ewm(alpha=1/14, min_periods=14, adjust=False).mean()
    avg_loss = loss.ewm(alpha=1/14, min_periods=14, adjust=False).mean()
    rs = avg_gain / (avg_loss + 1e-9)
    df['rsi_14'] = 100 - (100 / (1 + rs))

    # MACD (12, 26, 9)
    ema_12 = close.ewm(span=12, adjust=False).mean()
    ema_26 = close.ewm(span=26, adjust=False).mean()
    macd_line = ema_12 - ema_26
    signal_line = macd_line.ewm(span=9, adjust=False).mean()
    df['macd_norm'] = (macd_line - signal_line) / (close + 1e-9)

    # Bollinger Band %B
    bb_mid = close.rolling(20).mean()
    bb_std = close.rolling(20).std()
    bb_upper = bb_mid + (bb_std * 2)
    bb_lower = bb_mid - (bb_std * 2)
    df['bb_pct_b'] = (close - bb_lower) / ((bb_upper - bb_lower) + 1e-9)

    return df

FEATURE_COLUMNS = [
    'ret_1', 'ret_5', 'ret_10', 'log_ret',
    'ratio_close_sma10', 'ratio_close_sma20', 'ratio_close_sma50', 'ma_cross_10_50',
    'volatility_10', 'volatility_20', 'hl_range',
    'vol_ratio_10', 'vol_change_1',
    'rsi_14', 'macd_norm', 'bb_pct_b'
]

def prepare_training_dataset(
    df: pd.DataFrame,
    horizon_days: int = 5
) -> Tuple[pd.DataFrame, pd.Series]:
    """
    Constructs feature matrix X and forward return target y for a specific forecast horizon.
    Target: Future percentage return over horizon_days: (Close[t + h] - Close[t]) / Close[t].
    """
    featured_df = engineer_features(df)
    
    # Target: forward return over horizon_days
    featured_df['target_return'] = (featured_df['close'].shift(-horizon_days) - featured_df['close']) / featured_df['close']
    
    # Drop rows with NaN from rolling calculations or forward shift
    valid_data = featured_df.dropna(subset=FEATURE_COLUMNS + ['target_return']).copy()
    
    X = valid_data[FEATURE_COLUMNS]
    y = valid_data['target_return']
    
    return X, y
