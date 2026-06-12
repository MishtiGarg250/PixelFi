import os
import xgboost as xgb
import pandas as pd
from config.settings import settings

class NetWorthPredictor:
    def __init__(self):
        self.model = None
        self.load_model()

    def load_model(self):
        if os.path.exists(settings.MODEL_ARTIFACT_PATH) and os.path.getsize(settings.MODEL_ARTIFACT_PATH) > 0:
            try:
                self.model = xgb.XGBRegressor()
                self.model.load_model(settings.MODEL_ARTIFACT_PATH)
            except Exception as e:
                print(f"Warning: Failed to load model artifact: {e}")
                self.model = None
        else:
            self.model = None

    def predict(self, feature_df: pd.DataFrame) -> float:
        if self.model is None:
            # Fallback if model hasn't been compiled yet to prevent server failure
            # Returns simple linear asset extrapolation
            current_net_worth = feature_df.filter(like="netWorth").iloc[0, -1]
            return float(current_net_worth * 1.02)
            
        prediction = self.model.predict(feature_df)
        return float(prediction[0])

predictor_instance = NetWorthPredictor()