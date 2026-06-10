import pandas as pd
import numpy as np
from config.settings import settings

def create_sliding_windows(df: pd.DataFrame, window_size: int, forecast_horizon: int, is_inference: bool = False):
    """
    Transforms sequential data into ML features.
    If is_inference=True, it builds features from the absolute latest window to predict the future.
    """
    # Ensure sequential chronological order
    df = df.sort_values("snapshotDate").reset_index(drop=True)
    
    feature_cols = [
        "netWorth", "totalAssets", "totalLiabilities", "portfolioValue", 
        "cashValue", "monthlyExpenses", "monthlyIncome", "savingsRate", 
        "debtToAssetRatio", "riskScore", "diversificationScore", "healthScore"
    ]
    
    # Verify all columns exist in dataframe
    feature_cols = [col for col in feature_cols if col in df.columns]
    
    if is_inference:
        # For real-time dashboard predictions, take the most recent rows matching window_size
        if len(df) < window_size:
            raise ValueError(f"Not enough history. Need at least {window_size} snapshots, user has {len(df)}.")
        latest_window = df.tail(window_size)[feature_cols].values.flatten()
        
        flat_feature_names = [f"{col}_t-{window_size - idx}" for idx in range(window_size) for col in feature_cols]
        return pd.DataFrame([latest_window], columns=flat_feature_names), None

    # Processing Loop for Training Phase
    X, y = [], []
    for i in range(len(df) - window_size - forecast_horizon + 1):
        window_features = df.loc[i : i + window_size - 1, feature_cols].values.flatten()
        X.append(window_features)
        
        target_val = df.loc[i + window_size + forecast_horizon - 1, "netWorth"]
        y.append(target_val)
        
    flat_feature_names = [f"{col}_t-{window_size - idx}" for idx in range(window_size) for col in feature_cols]
    
    return pd.DataFrame(X, columns=flat_feature_names), pd.Series(y, dtype=float)