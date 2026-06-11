"""
PixelFi ML Service — FastAPI Application Entry Point

Models (XGBoost, Isolation Forest, etc.) will be wired in during Phase 2.
For now this service starts cleanly and exposes a health check so the
docker-compose stack can fully boot.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="PixelFi ML Service",
    description="Machine learning models for wealth management — net worth forecasting, anomaly detection, lifestyle creep, and cash flow analysis.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5005", "http://server:5005", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", tags=["System"])
def health_check():
    return {"status": "ok", "service": "ml-service", "models": "pending — Phase 2"}

