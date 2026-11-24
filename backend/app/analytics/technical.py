import numpy as np
import pandas as pd
from typing import Dict, Any, List

def calculate_rsi(series: pd.Series, period: int = 14) -> pd.Series:
    """Calculates Relative Strength Index using Wilder's exponential moving average."""
    delta = series.diff()
    gain = delta.clip(lower=0)
    loss = -1 * delta.clip(upper=0)
    
    avg_gain = gain.ewm(alpha=1/period, min_periods=period, adjust=False).mean()
    avg_loss = loss.ewm(alpha=1/period, min_periods=period, adjust=False).mean()
    
    rs = avg_gain / (avg_loss + 1e-9)
    rsi = 100 - (100 / (1 + rs))
    return rsi

def calculate_macd(series: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9):
    """Calculates Moving Average Convergence Divergence."""
    ema_fast = series.ewm(span=fast, adjust=False).mean()
    ema_slow = series.ewm(span=slow, adjust=False).mean()
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal, adjust=False).mean()
    histogram = macd_line - signal_line
    return macd_line, signal_line, histogram

def calculate_bollinger_bands(series: pd.Series, period: int = 20, num_std: float = 2.0):
    """Calculates Bollinger Bands (Middle, Upper, Lower)."""
    middle = series.rolling(window=period).mean()
    std = series.rolling(window=period).std()
    upper = middle + (std * num_std)
    lower = middle - (std * num_std)
    return upper, middle, lower

def calculate_atr(df: pd.DataFrame, period: int = 14) -> pd.Series:
    """Calculates Average True Range."""
    high = df['high']
    low = df['low']
    close = df['close']
    prev_close = close.shift(1)
    
    tr1 = high - low
    tr2 = (high - prev_close).abs()
    tr3 = (low - prev_close).abs()
    
    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    atr = tr.ewm(alpha=1/period, min_periods=period, adjust=False).mean()
    return atr

def calculate_stochastic(df: pd.DataFrame, k_period: int = 14, d_period: int = 3):
    """Calculates Stochastic Oscillator %K and %D."""
    low_min = df['low'].rolling(window=k_period).min()
    high_max = df['high'].rolling(window=k_period).max()
    
    k = 100 * ((df['close'] - low_min) / (high_max - low_min + 1e-9))
    d = k.rolling(window=d_period).mean()
    return k, d

def detect_candlestick_patterns(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """Detects notable candlestick patterns in the recent sessions."""
    patterns = []
    if len(df) < 5:
        return patterns

    # Examine recent bars
    for idx in range(len(df) - 3, len(df)):
        curr = df.iloc[idx]
        prev = df.iloc[idx - 1]
        
        c_open, c_high, c_low, c_close = curr['open'], curr['high'], curr['low'], curr['close']
        p_open, p_high, p_low, p_close = prev['open'], prev['high'], prev['low'], prev['close']
        
        body = abs(c_close - c_open)
        candle_range = c_high - c_low if (c_high - c_low) > 0 else 0.01
        
        # Bullish Engulfing
        if p_close < p_open and c_close > c_open and c_open <= p_close and c_close >= p_open:
            patterns.append({
                "name": "Bullish Engulfing",
                "type": "BULLISH",
                "detected_at": str(curr['timestamp']),
                "description": "Green candle completely envelopes preceding red candle body, indicating potential buyers stepping in."
            })
            
        # Bearish Engulfing
        elif p_close > p_open and c_close < c_open and c_open >= p_close and c_close <= p_open:
            patterns.append({
                "name": "Bearish Engulfing",
                "type": "BEARISH",
                "detected_at": str(curr['timestamp']),
                "description": "Red candle completely envelopes preceding green candle body, signaling potential selling pressure."
            })
            
        # Hammer (Bullish at bottom)
        lower_shadow = min(c_open, c_close) - c_low
        upper_shadow = c_high - max(c_open, c_close)
        if lower_shadow > 2 * body and upper_shadow < 0.2 * body:
            patterns.append({
                "name": "Hammer",
                "type": "BULLISH",
                "detected_at": str(curr['timestamp']),
                "description": "Long lower shadow with small upper body indicates strong intraday rejection of lower prices."
            })
            
        # Shooting Star (Bearish)
        if upper_shadow > 2 * body and lower_shadow < 0.2 * body:
            patterns.append({
                "name": "Shooting Star",
                "type": "BEARISH",
                "detected_at": str(curr['timestamp']),
                "description": "Long upper shadow with small lower body shows rejection of higher prices by sellers."
            })
            
        # Doji
        if body / candle_range < 0.1:
            patterns.append({
                "name": "Doji",
                "type": "NEUTRAL",
                "detected_at": str(curr['timestamp']),
                "description": "Open and close virtually equal, reflecting market indecision between buyers and sellers."
            })

    return patterns

def detect_support_resistance(df: pd.DataFrame, window: int = 20) -> List[Dict[str, Any]]:
    """Calculates dynamic support and resistance pivot levels."""
    levels = []
    if len(df) < window * 2:
        return levels

    recent = df.tail(120)
    highs = recent['high'].values
    lows = recent['low'].values
    current_price = recent['close'].iloc[-1]

    # Find swing highs and swing lows
    resistance_candidates = []
    support_candidates = []

    for i in range(5, len(recent) - 5):
        if highs[i] == max(highs[i-5:i+6]):
            resistance_candidates.append(highs[i])
        if lows[i] == min(lows[i-5:i+6]):
            support_candidates.append(lows[i])

    # Cluster support & resistance levels within 1.5%
    def cluster_levels(candidates, current, is_res=True):
        clustered = []
        candidates = sorted(candidates, reverse=is_res)
        for c in candidates:
            if is_res and c <= current * 1.002:
                continue
            if not is_res and c >= current * 0.998:
                continue
            
            # Check if close to existing cluster
            merged = False
            for entry in clustered:
                if abs(entry['price'] - c) / entry['price'] < 0.02:
                    entry['tested_count'] += 1
                    entry['price'] = round((entry['price'] + c) / 2, 2)
                    merged = True
                    break
            if not merged and len(clustered) < 3:
                clustered.append({
                    "price": round(c, 2),
                    "type": "RESISTANCE" if is_res else "SUPPORT",
                    "strength": "STRONG" if len(candidates) > 3 else "MODERATE",
                    "tested_count": 1
                })
        return clustered

    res_levels = cluster_levels(resistance_candidates, current_price, is_res=True)
    sup_levels = cluster_levels(support_candidates, current_price, is_res=False)
    
    levels.extend(res_levels)
    levels.extend(sup_levels)
    return levels

def compute_all_technical_indicators(df: pd.DataFrame, symbol: str) -> Dict[str, Any]:
    """
    Computes full technical analysis suite from historical OHLCV data.
    """
    df = df.copy()
    close = df['close']
    latest_price = float(close.iloc[-1])

    # Indicators
    rsi = calculate_rsi(close, 14)
    macd_line, signal_line, histogram = calculate_macd(close, 12, 26, 9)
    bb_upper, bb_middle, bb_lower = calculate_bollinger_bands(close, 20, 2.0)
    sma_20 = close.rolling(20).mean()
    sma_50 = close.rolling(50).mean()
    sma_200 = close.rolling(min(200, len(close))).mean()
    ema_20 = close.ewm(span=20, adjust=False).mean()
    atr = calculate_atr(df, 14)
    stoch_k, stoch_d = calculate_stochastic(df, 14, 3)

    latest_rsi = round(float(rsi.dropna().iloc[-1]), 2) if not rsi.dropna().empty else 50.0
    latest_macd = round(float(macd_line.dropna().iloc[-1]), 2) if not macd_line.dropna().empty else 0.0
    latest_sig = round(float(signal_line.dropna().iloc[-1]), 2) if not signal_line.dropna().empty else 0.0
    latest_hist = round(float(histogram.dropna().iloc[-1]), 2) if not histogram.dropna().empty else 0.0

    # Classifications
    if latest_rsi > 70:
        rsi_signal = "OVERBOUGHT"
    elif latest_rsi < 30:
        rsi_signal = "OVERSOLD"
    else:
        rsi_signal = "NEUTRAL"

    if latest_macd > latest_sig and latest_hist > 0:
        macd_trend = "BULLISH_CROSSOVER"
    elif latest_macd < latest_sig and latest_hist < 0:
        macd_trend = "BEARISH_CROSSOVER"
    else:
        macd_trend = "NEUTRAL"

    # Overall sentiment score based on technical consensus
    bullish_votes = 0
    bearish_votes = 0

    if latest_rsi < 45: bullish_votes += 1
    elif latest_rsi > 65: bearish_votes += 1

    if latest_price > float(sma_50.dropna().iloc[-1] if not sma_50.dropna().empty else latest_price):
        bullish_votes += 1
    else:
        bearish_votes += 1

    if latest_macd > latest_sig: bullish_votes += 1
    else: bearish_votes += 1

    if bullish_votes >= 3:
        overall_sentiment = "STRONG_BUY" if bullish_votes == 3 and latest_rsi < 55 else "BUY"
    elif bearish_votes >= 3:
        overall_sentiment = "STRONG_SELL" if bearish_votes == 3 and latest_rsi > 65 else "SELL"
    else:
        overall_sentiment = "NEUTRAL"

    # Candlestick patterns & Support/Resistance
    patterns = detect_candlestick_patterns(df)
    support_resistance = detect_support_resistance(df)

    # Series for charts (last 60 candles)
    recent_df = df.tail(60).copy()
    rsi_recent = rsi.tail(60)
    macd_recent = macd_line.tail(60)
    sig_recent = signal_line.tail(60)
    hist_recent = histogram.tail(60)
    bbu_recent = bb_upper.tail(60)
    bbm_recent = bb_middle.tail(60)
    bbl_recent = bb_lower.tail(60)

    rsi_series = []
    macd_series = []
    bb_series = []

    for i in range(len(recent_df)):
        dt = str(recent_df['timestamp'].iloc[i])
        rsi_val = rsi_recent.iloc[i]
        rsi_series.append({
            "time": dt,
            "value": round(float(rsi_val), 2) if pd.notna(rsi_val) else None
        })
        macd_series.append({
            "time": dt,
            "macd": round(float(macd_recent.iloc[i]), 2) if pd.notna(macd_recent.iloc[i]) else None,
            "signal": round(float(sig_recent.iloc[i]), 2) if pd.notna(sig_recent.iloc[i]) else None,
            "histogram": round(float(hist_recent.iloc[i]), 2) if pd.notna(hist_recent.iloc[i]) else None,
        })
        bb_series.append({
            "time": dt,
            "upper": round(float(bbu_recent.iloc[i]), 2) if pd.notna(bbu_recent.iloc[i]) else None,
            "middle": round(float(bbm_recent.iloc[i]), 2) if pd.notna(bbm_recent.iloc[i]) else None,
            "lower": round(float(bbl_recent.iloc[i]), 2) if pd.notna(bbl_recent.iloc[i]) else None,
        })

    educational_summary = {
        "rsi_explanation": f"RSI is currently {latest_rsi}. An RSI above 70 indicates the asset may be overbought or extended, while below 30 reflects oversold momentum where selling pressure may be waning.",
        "macd_explanation": f"MACD is at {latest_macd} vs signal {latest_sig}. The histogram is {latest_hist}, indicating {macd_trend.replace('_', ' ').lower()} momentum relative to short-term moving averages.",
        "moving_averages_explanation": f"Price is trading {'above' if latest_price > float(sma_50.dropna().iloc[-1]) else 'below'} its 50-day SMA, which marks the prevailing intermediate trend direction.",
        "disclaimer": "Technical indicators measure past mathematical price characteristics and do not guarantee future market behavior."
    }

    return {
        "symbol": symbol,
        "latest_price": latest_price,
        "rsi_14": latest_rsi,
        "rsi_signal": rsi_signal,
        "macd": latest_macd,
        "macd_signal": latest_sig,
        "macd_histogram": latest_hist,
        "macd_trend": macd_trend,
        "sma_20": round(float(sma_20.dropna().iloc[-1]), 2) if not sma_20.dropna().empty else latest_price,
        "sma_50": round(float(sma_50.dropna().iloc[-1]), 2) if not sma_50.dropna().empty else latest_price,
        "sma_200": round(float(sma_200.dropna().iloc[-1]), 2) if not sma_200.dropna().empty else latest_price,
        "ema_20": round(float(ema_20.dropna().iloc[-1]), 2) if not ema_20.dropna().empty else latest_price,
        "bollinger_upper": round(float(bb_upper.dropna().iloc[-1]), 2) if not bb_upper.dropna().empty else latest_price,
        "bollinger_middle": round(float(bb_middle.dropna().iloc[-1]), 2) if not bb_middle.dropna().empty else latest_price,
        "bollinger_lower": round(float(bb_lower.dropna().iloc[-1]), 2) if not bb_lower.dropna().empty else latest_price,
        "atr_14": round(float(atr.dropna().iloc[-1]), 2) if not atr.dropna().empty else 0.0,
        "stochastic_k": round(float(stoch_k.dropna().iloc[-1]), 2) if not stoch_k.dropna().empty else 50.0,
        "stochastic_d": round(float(stoch_d.dropna().iloc[-1]), 2) if not stoch_d.dropna().empty else 50.0,
        "overall_sentiment": overall_sentiment,
        "support_resistance": support_resistance,
        "detected_patterns": patterns,
        "indicator_series": {
            "rsi": rsi_series,
            "macd": macd_series,
            "bollinger": bb_series
        },
        "educational_summary": educational_summary
    }
