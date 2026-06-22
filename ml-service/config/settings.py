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
    KAFKA_SASL_USERNAME: str | None = os.getenv("KAFKA_SASL_USERNAME", None)
    KAFKA_SASL_PASSWORD: str | None = os.getenv("KAFKA_SASL_PASSWORD", None)
    KAFKA_CONSUMER_GROUP_ANOMALY: str = "pixel-fi-anomaly-group"
    
    # 🛠️ FIXED: Added missing Pydantic variable to resolve the container crash
    KAFKA_CONSUMER_GROUP_ML_ENGINES: str = os.getenv("KAFKA_CONSUMER_GROUP_ML_ENGINES", "pixel-fi-engines-group")

    class Config:
        env_file = ".env"
        # Allows extra environment strings to safely pass through without crashing Pydantic
        extra = "ignore" 

settings = Settings()