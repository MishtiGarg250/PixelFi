from datetime import datetime

from app.schemas.monthly import (
    ExpenseAnomaly,
    ForecastPoint,
    GoalProbability,
    HealthResponse,
    MonthlyAnalysisInput,
    MonthlyAnalysisResponse,
)


MODEL_VERSION = "rules-statistics-v1"


def classify_score(score: int) -> str:
    if score >= 80:
        return "STRONG"
    if score >= 60:
        return "STABLE"
    if score >= 40:
        return "WATCH"
    return "AT_RISK"


def calculate_health(data: MonthlyAnalysisInput) -> HealthResponse:
    snapshot = data.latestSnapshot
    debt_score = max(0, 100 - snapshot.debtToAssetRatio * 100)
    cash_score = min(100, snapshot.emergencyFundMonths / 6 * 100)
    return_score = max(0, min(100, 50 + snapshot.portfolioReturnPercent))

    score = round(
        snapshot.diversificationScore * 0.25
        + (100 - snapshot.riskScore) * 0.25
        + debt_score * 0.2
        + cash_score * 0.2
        + return_score * 0.1
    )

    return HealthResponse(
        health_score=score,
        label=classify_score(score),
        components={
            "diversification": snapshot.diversificationScore,
            "risk": snapshot.riskScore,
            "debt": round(debt_score, 2),
            "cash": round(cash_score, 2),
            "return": round(return_score, 2),
        },
    )


def detect_expense_anomalies(data: MonthlyAnalysisInput) -> list[ExpenseAnomaly]:
    snapshot = data.latestSnapshot
    total_expenses = max(snapshot.monthlyExpenses, 1)
    anomalies: list[ExpenseAnomaly] = []

    for category, amount in data.expensesByCategory.items():
        share = amount / total_expenses
        if share >= 0.5 and amount > 0:
            severity = "HIGH"
        elif share >= 0.3 and amount > 0:
            severity = "MEDIUM"
        elif share >= 0.2 and amount > 0:
            severity = "LOW"
        else:
            continue

        anomalies.append(
            ExpenseAnomaly(
                category=category,
                amount=round(amount, 2),
                severity=severity,
                message=f"{category} is {round(share * 100)}% of this month's tracked expenses.",
            )
        )

    return anomalies


def forecast_net_worth(data: MonthlyAnalysisInput) -> list[ForecastPoint]:
    history = data.history[-6:]
    latest = data.latestSnapshot.netWorth

    if len(history) >= 2:
        deltas = [
            history[index].netWorth - history[index - 1].netWorth
            for index in range(1, len(history))
        ]
        monthly_delta = sum(deltas) / len(deltas)
    else:
        monthly_delta = latest * 0.01

    now = datetime.utcnow()
    forecast: list[ForecastPoint] = []

    for index in range(1, 7):
        month_number = now.month + index
        year = now.year + (month_number - 1) // 12
        month = ((month_number - 1) % 12) + 1
        forecast.append(
            ForecastPoint(
                month=f"{year}-{month:02d}",
                projectedNetWorth=round(latest + monthly_delta * index, 2),
            )
        )

    return forecast


def calculate_goal_probabilities(
    data: MonthlyAnalysisInput,
) -> list[GoalProbability]:
    probabilities: list[GoalProbability] = []

    for goal in data.goals:
        if goal.targetAmount <= 0:
            probability = 0
        else:
            progress = goal.currentAmount / goal.targetAmount
            probability = min(95, round(progress * 100))

        probabilities.append(
            GoalProbability(
                title=goal.title,
                probability=probability,
                message=f"{probability}% probability based on current funding progress.",
            )
        )

    return probabilities


def calculate_monthly_analysis(
    data: MonthlyAnalysisInput,
) -> MonthlyAnalysisResponse:
    snapshot = data.latestSnapshot
    risk_category = (
        "HIGH"
        if snapshot.riskScore > 60
        else "MEDIUM"
        if snapshot.riskScore > 30
        else "LOW"
    )

    return MonthlyAnalysisResponse(
        modelVersion=MODEL_VERSION,
        risk={
            "risk_score": snapshot.riskScore,
            "category": risk_category,
        },
        health=calculate_health(data),
        expenseAnomalies=detect_expense_anomalies(data),
        netWorthForecast=forecast_net_worth(data),
        goalProbabilities=calculate_goal_probabilities(data),
    )
