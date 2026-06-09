from fastapi import APIRouter

from app.schemas.risk import (
    RiskInput,
    RiskResponse
)

from app.services.risk_service import (
    calculate_risk_score
)
from app.schemas.monthly import (
    MonthlyAnalysisInput,
    MonthlyAnalysisResponse,
)
from app.services.monthly_service import (
    calculate_monthly_analysis,
)

router = APIRouter(
    prefix="/predict",
    tags=["Prediction"]
)


@router.post(
    "/risk-score",
    response_model=RiskResponse
)
def predict_risk(data: RiskInput):

    score, category = calculate_risk_score(
        stocks=data.stocks,
        mutual_funds=data.mutual_funds,
        crypto=data.crypto,
        cash=data.cash
    )

    return RiskResponse(
        risk_score=score,
        category=category
    )


@router.post(
    "/monthly-analysis",
    response_model=MonthlyAnalysisResponse
)
def predict_monthly_analysis(
    data: MonthlyAnalysisInput
):
    return calculate_monthly_analysis(data)
