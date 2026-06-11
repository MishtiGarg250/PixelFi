"""
Pydantic request/response schemas for the ML Service API.
These define the shape of JSON payloads going in and out of each endpoint.
"""

from pydantic import BaseModel
from typing import List


class PredictionRequest(BaseModel):
    userId: str


class PredictionResponse(BaseModel):
    userId: str
    currentNetWorth: float
    predictedNetWorth: float
    forecastHorizonMonths: int
    primaryGrowthDrivers: List[str]
