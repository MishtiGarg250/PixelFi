import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/wealth_db")
    MODEL_ARTIFACT_PATH: str = os.getenv("MODEL_ARTIFACT_PATH", "artifacts/net_worth_xgb_v1.json")
    
    # ML Hyperparameters
    WINDOW_SIZE: int = 3          # Look back 3 months
    FORECAST_HORIZON: int = 3     # Predict 3 months ahead
    ANOMALY_CONTAMINATION: float = 0.02

    # Kafka Properties
    KAFKA_BOOTSTRAP_SERVERS: str = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "kafka:29092")
    KAFKA_CONSUMER_GROUP_ANOMALY: str = "pixel-fi-anomaly-group"

    class Config:
        env_file = ".env"

settings = Settings()