import os
import pandas as pd
import xgboost as xgb
from src.database.connection import get_db_engine
from src.features.build_features import create_sliding_windows
from config.settings import settings

def run_training_pipeline():
    engine = get_db_engine()
    
    # Query all historical data for training (ideally aggregated across multiple mock users)
    query = """
        SELECT * FROM "FinancialSnapshot" 
        WHERE "snapshotType" = 'MONTHLY'
        ORDER BY "userId", "snapshotDate" ASC
    """
    df = pd.read_sql(query, engine)
    
    if df.empty:
        print("No snapshot records found in database to train on.")
        return

    # Aggregate sliding windows across all users safely without blending cross-user boundaries
    all_X, all_y = [], []
    for user_id, group in df.groupby("userId"):
        if len(group) >= (settings.WINDOW_SIZE + settings.FORECAST_HORIZON):
            X_g, y_g = create_sliding_windows(group, settings.WINDOW_SIZE, settings.FORECAST_HORIZON)
            all_X.append(X_g)
            all_y.append(y_g)
            
    if not all_X:
        print("Insufficient time-series sequence length across your dataset to frame parameters.")
        return
        
    X = pd.concat(all_X, ignore_index=True)
    y = pd.concat(all_y, ignore_index=True)
    
    # Initialize Core Model
    model = xgb.XGBRegressor(
        objective='reg:squarederror',
        n_estimators=150,
        learning_rate=0.05,
        max_depth=4,
        random_state=42
    )
    
    print(f"Training XGBoost on {X.shape[0]} samples...")
    model.fit(X, y)
    
    # Ensure directories exist and save model weights
    os.makedirs(os.path.dirname(settings.MODEL_ARTIFACT_PATH), exist_ok=True)
    model.save_model(settings.MODEL_ARTIFACT_PATH)
    print(f"Model successfully written to storage: {settings.MODEL_ARTIFACT_PATH}")

if __name__ == "__main__":
    run_training_pipeline()