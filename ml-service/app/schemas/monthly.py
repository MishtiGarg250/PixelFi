from pydantic import BaseModel, Field


class SnapshotMetrics(BaseModel):
    netWorth: float = 0
    totalAssets: float = 0
    totalLiabilities: float = 0
    portfolioValue: float = 0
    cashValue: float = 0
    monthlyIncome: float = 0
    monthlyExpenses: float = 0
    savingsRate: float = 0
    riskScore: int = 0
    diversificationScore: int = 0
    healthScore: int = 0
    activeGoals: int = 0
    goalTargetAmount: float = 0
    goalCurrentAmount: float = 0
    totalInvested: float = 0
    unrealizedPnL: float = 0
    portfolioReturnPercent: float = 0
    emergencyFundMonths: float = 0
    debtToAssetRatio: float = 0
    largestHoldingPercent: float = 0
    holdingCount: int = 0


class GoalInput(BaseModel):
    title: str
    targetAmount: float = Field(default=0, ge=0)
    currentAmount: float = Field(default=0, ge=0)
    targetDate: str | None = None


class MonthlyAnalysisInput(BaseModel):
    latestSnapshot: SnapshotMetrics
    history: list[SnapshotMetrics] = []
    goals: list[GoalInput] = []
    expensesByCategory: dict[str, float] = {}


class HealthResponse(BaseModel):
    health_score: int
    label: str
    components: dict[str, float]


class ExpenseAnomaly(BaseModel):
    category: str
    amount: float
    severity: str
    message: str


class ForecastPoint(BaseModel):
    month: str
    projectedNetWorth: float


class GoalProbability(BaseModel):
    title: str
    probability: int
    message: str


class MonthlyAnalysisResponse(BaseModel):
    modelVersion: str
    risk: dict
    health: HealthResponse
    expenseAnomalies: list[ExpenseAnomaly]
    netWorthForecast: list[ForecastPoint]
    goalProbabilities: list[GoalProbability]
