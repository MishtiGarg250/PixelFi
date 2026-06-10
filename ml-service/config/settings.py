import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/wealth_db")
    MODEL_ARTIFACT_PATH: str = os.getenv("MODEL_ARTIFACT_PATH", "artifacts/net_worth_xgb_v1.json")
    
    # ML Hyperparameters
    WINDOW_SIZE: int = 3          # Look back 3 months
    FORECAST_HORIZON: int = 3     # Predict 3 months ahead

    class Config:
        env_file = ".env"

settings = Settings()