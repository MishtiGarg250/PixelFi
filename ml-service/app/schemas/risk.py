from pydantic import BaseModel, Field


class RiskInput(BaseModel):
    stocks: float = Field(default=0, ge=0)
    mutual_funds: float = Field(default=0, ge=0)
    crypto: float = Field(default=0, ge=0)
    cash: float = Field(default=0, ge=0)


class RiskResponse(BaseModel):
    risk_score: int
    category: str
