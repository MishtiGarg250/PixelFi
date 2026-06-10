from fastapi import FastAPI, HTTPException, Depends
import pandas as pd
from sqlalchemy import create_engine
from src.database.connection import get_db_engine
from src.features.build_features import create_sliding_windows
from src.models.predict import predictor_instance
from src.api.schemas import PredictionRequest, PredictionResponse
from config.settings import settings

app = FastAPI(title="Wealth Management ML Service", version="1.0.0")

@app.post("/api/v1/predict-networth", response_model=PredictionResponse)
def predict_net_worth(payload: PredictionRequest, engine=Depends(get_db_engine)):
    user_id = payload.userId
    
    # 1. Fetch historical records for this explicit user
    query = f"""
        SELECT * FROM "FinancialSnapshot"
        WHERE "userId" = '{user_id}' AND "snapshotType" = 'MONTHLY'
        ORDER BY "snapshotDate" ASC
    """
    df = pd.read_sql(query, engine)
    
    if df.empty:
        raise HTTPException(status_code=404, detail=f"No snapshot profiles found for user {user_id}")
        
    current_net_worth = float(df.iloc[-1]["netWorth"])
    current_savings_rate = float(df.iloc[-1]["savingsRate"])
    current_debt_ratio = float(df.iloc[-1]["debtToAssetRatio"])
    
    # 2. Build inference window features
    try:
        X_inference, _ = create_sliding_windows(
            df, 
            window_size=settings.WINDOW_SIZE, 
            forecast_horizon=settings.FORECAST_HORIZON, 
            is_inference=True
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    # 3. Calculate Prediction
    predicted_val = predictor_instance.predict(X_inference)
    
    # 4. Generate data-driven feedback strings to help pass through to the LLM backend stage
    drivers = []
    if current_savings_rate >= 20.0:
        drivers.append(f"Strong current monthly savings rate of {current_savings_rate}% provides investment compounding.")
    else:
        drivers.append(f"Savings rate stands at {current_savings_rate}%; boosting cash allocation reserves could increase upside trajectory.")
        
    if current_debt_ratio > 0.40:
        drivers.append("Elevated debt-to-asset leverage exposure slows acceleration profile down.")
        
    return PredictionResponse(
        userId=user_id,
        currentNetWorth=current_net_worth,
        predictedNetWorth=round(predicted_val, 2),
        forecastHorizonMonths=settings.FORECAST_HORIZON,
        primaryGrowthDrivers=drivers
    )