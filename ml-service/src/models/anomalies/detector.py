import pandas as pd
from sklearn.ensemble import IsolationForest
import logging

logger = logging.getLogger("ExpenseAnomalyDetector")

class ExpenseAnomalyDetector:
    def __init__(self, contamination=0.02):
        self.contamination = contamination

    def detect_anomalies(self, user_id: str, engine) -> pd.DataFrame:
        query = f"""
            SELECT id, amount, category, "occurredAt"
            FROM "Expense"
            WHERE "userId" = '{user_id}'
            ORDER BY "occurredAt" ASC
        """
        try:
            df = pd.read_sql(query, engine)
        except Exception as e:
            logger.error(f"Error reading from DB: {e}")
            return pd.DataFrame()

        if df.empty or len(df) < 5:
            # Not enough data to find anomalies reliably
            return pd.DataFrame()

        # Feature engineering
        X = df[['amount']].astype(float)

        # Initialize model
        model = IsolationForest(contamination=self.contamination, random_state=42)
        model.fit(X)

        # Predict (-1 is anomaly, 1 is normal)
        preds = model.predict(X)
        scores = model.decision_function(X)

        df['is_anomaly'] = preds == -1
        df['anomaly_score'] = scores

        return df

from config.settings import settings
expense_anomaly_detector = ExpenseAnomalyDetector(contamination=settings.ANOMALY_CONTAMINATION)
