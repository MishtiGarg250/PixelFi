"""
PixelFi ML Service — FastAPI Application Entry Point

Models (XGBoost, Isolation Forest, etc.) will be wired in during Phase 2.
For now this service starts cleanly and exposes a health check so the
docker-compose stack can fully boot.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
from src.database.connection import get_db_engine
from src.features.build_features import create_sliding_windows
from src.models.predict import predictor_instance
from config.settings import settings
import logging

logger = logging.getLogger(__name__)

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

class NetWorthRequest(BaseModel):
    userId: str

@app.get("/health", tags=["System"])
def health_check():
    return {"status": "ok", "service": "ml-service"}

@app.post("/predict/networth", tags=["Predictions"])
def predict_networth(request: NetWorthRequest):
    try:
        engine = get_db_engine()
        query = f"""
            SELECT * FROM "FinancialSnapshot" 
            WHERE "userId" = '{request.userId}' 
            AND "snapshotType" = 'MONTHLY'
            ORDER BY "snapshotDate" ASC
        """
        df = pd.read_sql(query, engine)
        
        if df.empty or len(df) < settings.WINDOW_SIZE:
            # Not enough data for sliding windows, fallback to simple heuristic
            if not df.empty:
                last_networth = df.iloc[-1]['netWorth']
                return {"userId": request.userId, "forecastedNetWorth": float(last_networth) * 1.02}
            else:
                return {"userId": request.userId, "forecastedNetWorth": 0.0, "message": "No data available."}
        
        # Build features for inference
        features_df, _ = create_sliding_windows(df, settings.WINDOW_SIZE, settings.FORECAST_HORIZON, is_inference=True)
        
        # Predict
        prediction = predictor_instance.predict(features_df)
        
        return {
            "userId": request.userId,
            "forecastedNetWorth": prediction
        }
    except Exception as e:
        logger.error(f"Error predicting net worth: {e}")
        raise HTTPException(status_code=500, detail=str(e))
