def calculate_risk_score(
    stocks: float,
    mutual_funds: float,
    crypto: float,
    cash: float,
) -> tuple[int, str]:
    total = stocks + mutual_funds + crypto + cash

    if total <= 0:
        return 0, "LOW"

    stock_percent = stocks / total
    mutual_fund_percent = mutual_funds / total
    crypto_percent = crypto / total
    cash_percent = cash / total

    score = round(
        stock_percent * 55
        + mutual_fund_percent * 35
        + crypto_percent * 90
        + cash_percent * 10
    )

    if score >= 70:
        category = "HIGH"
    elif score >= 40:
        category = "MEDIUM"
    else:
        category = "LOW"

    return score, category
