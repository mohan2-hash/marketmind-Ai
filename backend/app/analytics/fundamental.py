from typing import Dict, Any, List

def compute_health_score(metrics: Dict[str, Any]) -> Dict[str, Any]:
    """
    Computes transparent MarketMind Financial Health Score.
    Weighting:
    - Profitability (25%)
    - Solvency & Capital Structure (25%)
    - Valuation & Quality (25%)
    - Growth & Efficiency (25%)
    """
    components = []
    total_score = 0.0

    # 1. Profitability (Weight: 25%)
    roe = metrics.get("roe") or 0.0
    op_margin = metrics.get("operating_margin") or 0.0
    
    prof_score = 0.0
    if roe > 25: prof_score += 50
    elif roe > 15: prof_score += 40
    elif roe > 8: prof_score += 25
    else: prof_score += 10

    if op_margin > 20: prof_score += 50
    elif op_margin > 12: prof_score += 35
    elif op_margin > 5: prof_score += 20
    else: prof_score += 10

    components.append({
        "name": "Profitability & Returns",
        "score": round(prof_score, 1),
        "weight": 0.25,
        "description": f"ROE of {roe}% and Operating Margin of {op_margin}%. High capital return efficiency.",
        "status": "EXCELLENT" if prof_score >= 80 else "GOOD" if prof_score >= 60 else "AVERAGE"
    })
    total_score += prof_score * 0.25

    # 2. Solvency & Debt (Weight: 25%)
    debt_eq = metrics.get("debt_to_equity")
    current_ratio = metrics.get("current_ratio") or 1.0
    
    solv_score = 0.0
    if debt_eq is not None:
        if debt_eq < 0.3: solv_score += 50
        elif debt_eq < 0.8: solv_score += 40
        elif debt_eq < 1.5: solv_score += 25
        elif debt_eq < 3.0: solv_score += 15
        else: solv_score += 5 # Financial institutions or leveraged utilities
    else:
        solv_score += 25

    if current_ratio >= 1.8: solv_score += 50
    elif current_ratio >= 1.2: solv_score += 40
    elif current_ratio >= 1.0: solv_score += 30
    else: solv_score += 15

    components.append({
        "name": "Solvency & Balance Sheet",
        "score": round(solv_score, 1),
        "weight": 0.25,
        "description": f"Debt-to-Equity of {debt_eq} and Current Ratio of {current_ratio}. Evaluates liquidity and debt burden.",
        "status": "EXCELLENT" if solv_score >= 80 else "GOOD" if solv_score >= 60 else "AVERAGE" if solv_score >= 40 else "WEAK"
    })
    total_score += solv_score * 0.25

    # 3. Valuation & Market Quality (Weight: 25%)
    pe = metrics.get("pe_ratio") or 25.0
    div_yield = metrics.get("dividend_yield") or 0.0
    
    val_score = 0.0
    if pe < 15: val_score += 50
    elif pe < 28: val_score += 40
    elif pe < 45: val_score += 25
    else: val_score += 15

    if div_yield > 2.0: val_score += 50
    elif div_yield > 0.5: val_score += 35
    else: val_score += 20

    components.append({
        "name": "Valuation & Dividends",
        "score": round(val_score, 1),
        "weight": 0.25,
        "description": f"P/E ratio of {pe}x and Dividend Yield of {div_yield}%. Compares valuation multiples against earnings power.",
        "status": "EXCELLENT" if val_score >= 80 else "GOOD" if val_score >= 60 else "AVERAGE"
    })
    total_score += val_score * 0.25

    # 4. Growth & Expansion (Weight: 25%)
    rev_growth = metrics.get("revenue_growth_yoy") or 10.0
    growth_score = 0.0
    if rev_growth > 20: growth_score += 100
    elif rev_growth > 12: growth_score += 80
    elif rev_growth > 5: growth_score += 60
    elif rev_growth >= 0: growth_score += 40
    else: growth_score += 10

    components.append({
        "name": "Growth & Expansion",
        "score": round(growth_score, 1),
        "weight": 0.25,
        "description": f"Year-over-Year Revenue Growth of {rev_growth}%. Measures market expansion and business traction.",
        "status": "EXCELLENT" if growth_score >= 80 else "GOOD" if growth_score >= 60 else "AVERAGE"
    })
    total_score += growth_score * 0.25

    final_score = round(total_score, 1)
    if final_score >= 80:
        rating = "EXCELLENT"
    elif final_score >= 65:
        rating = "HEALTHY"
    elif final_score >= 50:
        rating = "MODERATE"
    else:
        rating = "VULNERABLE"

    # Business Strengths and Risks
    strengths = []
    risks = []

    if roe > 18:
        strengths.append(f"Strong Return on Equity ({roe}%) indicates competitive advantage and disciplined capital allocation.")
    if op_margin > 18:
        strengths.append(f"High operating margin ({op_margin}%) affords pricing power against inflationary headwinds.")
    if debt_eq is not None and debt_eq < 0.5:
        strengths.append("Conservative debt structure provides resilient downside protection during downturns.")

    if pe > 45:
        risks.append(f"Elevated P/E ratio ({pe}x) leaves minimal margin of safety if future growth decelerates.")
    if debt_eq is not None and debt_eq > 2.0:
        risks.append(f"Higher balance sheet leverage (Debt/Equity: {debt_eq}) increases sensitivity to borrowing costs.")
    if rev_growth < 6:
        risks.append("Subdued top-line growth could compress valuation multiples if not reaccelerated.")

    if not strengths:
        strengths.append("Stable operating profile with established market distribution channels.")
    if not risks:
        risks.append("Subject to broader macroeconomic shifts, currency volatility, and sector cycles.")

    return {
        "health_score": final_score,
        "health_rating": rating,
        "score_breakdown": components,
        "strengths": strengths,
        "risks": risks
    }
