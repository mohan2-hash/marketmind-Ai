from fastapi import APIRouter, Depends
from typing import List, Dict, Any
from pydantic import BaseModel

router = APIRouter(prefix="/learning", tags=["Learning Centre"])

MODULES = [
    {
        "id": "module-1",
        "title": "Stock Market Fundamentals",
        "category": "Foundations",
        "level": "Beginner",
        "duration": "20 mins",
        "description": "Understand what stocks are, how public exchanges (NSE, BSE, NASDAQ, NYSE) function, and the mechanics of primary vs secondary markets.",
        "lessons": [
            {
                "id": "lesson-1-1",
                "title": "What is an Equity Share?",
                "content": "An equity share represents fractional ownership of a corporation. Shareholders are entitled to a residual claim on corporate assets and earnings via dividends, as well as voting power."
            },
            {
                "id": "lesson-1-2",
                "title": "How Stock Exchanges Work",
                "content": "Exchanges operate as centralized order-matching engines. Buyers and sellers submit bid and ask orders. When a match occurs, trade clearing and settlement are processed."
            }
        ],
        "quiz": [
            {
                "question": "What does owning a stock represent?",
                "options": ["A loan to the company", "Fractional ownership in the corporation", "A guaranteed interest payment", "Government insurance"],
                "answer_index": 1,
                "explanation": "Equity shares confer fractional ownership of a business and residual claim on future cash flows."
            }
        ]
    },
    {
        "id": "module-2",
        "title": "Fundamental Analysis & Health Scoring",
        "category": "Analysis",
        "level": "Beginner",
        "duration": "30 mins",
        "description": "Master key financial ratios: P/E, P/B, ROE, ROCE, Debt-to-Equity, and Free Cash Flow to evaluate corporate viability.",
        "lessons": [
            {
                "id": "lesson-2-1",
                "title": "Understanding the Price-to-Earnings (P/E) Ratio",
                "content": "P/E compares a company's market price to its annual earnings per share. High P/E implies expectations of high future growth, while low P/E may reflect value or structural challenges."
            },
            {
                "id": "lesson-2-2",
                "title": "Return on Equity (ROE) & Return on Capital Employed (ROCE)",
                "content": "ROE measures profitability relative to shareholder equity, while ROCE evaluates operating return on all deployed capital, including debt."
            }
        ],
        "quiz": [
            {
                "question": "Which ratio measures a firm's total debt relative to its net worth?",
                "options": ["Current Ratio", "Debt-to-Equity Ratio", "Operating Margin", "Quick Ratio"],
                "answer_index": 1,
                "explanation": "The Debt-to-Equity ratio evaluates leverage and solvency."
            }
        ]
    },
    {
        "id": "module-3",
        "title": "Technical Indicators & Chart Reading",
        "category": "Technical Analysis",
        "level": "Intermediate",
        "duration": "35 mins",
        "description": "Decode RSI momentum, MACD crossovers, Bollinger Band standard deviation envelopes, and support/resistance pivots.",
        "lessons": [
            {
                "id": "lesson-3-1",
                "title": "RSI: Relative Strength Index",
                "content": "RSI measures price change velocity on a scale of 0 to 100. Values above 70 typically signal overbought conditions; values below 30 signal oversold conditions."
            },
            {
                "id": "lesson-3-2",
                "title": "Bollinger Bands & Volatility Squeezes",
                "content": "Bollinger Bands plot 2 standard deviations around a 20-day moving average. Contracted bands indicate low volatility that frequently precedes explosive breakouts."
            }
        ],
        "quiz": [
            {
                "question": "What is indicated when the RSI crosses above 70?",
                "options": ["The stock is guaranteed to crash", "Buying momentum is extended / overbought", "The company reported higher earnings", "Trading is halted"],
                "answer_index": 1,
                "explanation": "RSI > 70 reflects aggressive buying momentum that has reached historically extended levels."
            }
        ]
    },
    {
        "id": "module-4",
        "title": "Machine Learning in Financial Forecasting",
        "category": "Quantitative Finance",
        "level": "Intermediate",
        "duration": "25 mins",
        "description": "Understand walk-forward validation, target leakage prevention, prediction intervals, and why baseline comparison is mandatory.",
        "lessons": [
            {
                "id": "lesson-4-1",
                "title": "Why Financial Time Series Require Chronological Splits",
                "content": "Randomly shuffling market data leaks future information into past predictions. Realistic evaluation requires strictly walk-forward or chronological testing."
            },
            {
                "id": "lesson-4-2",
                "title": "Uncertainty Bands & Residual Error",
                "content": "Predictions are estimates subject to variance. Prediction intervals communicate empirical error distributions rather than false certainty."
            }
        ],
        "quiz": [
            {
                "question": "Why must financial training data never be randomly shuffled?",
                "options": ["It slows down training", "It causes future information leakage and false accuracy", "Python does not support shuffling", "It deletes historical volume"],
                "answer_index": 1,
                "explanation": "Randomly shuffling time series causes future data to leak into past bars, fabricating artificially high accuracy."
            }
        ]
    }
]

@router.get("/modules")
def get_learning_modules():
    return MODULES
