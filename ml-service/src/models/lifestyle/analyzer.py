import pandas as pd
from datetime import datetime, timedelta
import logging
from sqlalchemy.engine import Engine
from typing import Optional, Dict, Any
from src.models.lifestyle.metrics import calculate_category_variance

logger = logging.getLogger("LifestyleAnalyzer")

class LifestyleCreepAnalyzer:
    def __init__(self):
        pass

    def check_spending_creep(self, user_id: str, db_engine: Engine) -> Optional[Dict[str, Any]]:
        """
        Coordinates database extraction timelines and evaluates lifestyle creep risks.
        """
        try:
            # 1. Define evaluation windows
            now = datetime.utcnow()
            thirty_days_ago = now - timedelta(days=30)
            
            # Historical window: Looking at the previous 6 months to establish a baseline
            six_months_ago = now - timedelta(days=180)

            # 2. Fetch all expenses for this user within our 6-month window
            query = """
                SELECT id, amount, category, "occurredAt"
                FROM "Expense"
                WHERE "userId" = %(user_id)s
                AND "occurredAt" >= %(start_date)s
                AND "occurredAt" <= %(end_date)s
            """
            
            df = pd.read_sql(
                query, 
                db_engine, 
                params={"user_id": user_id, "start_date": six_months_ago, "end_date": now}
            )

            if df.empty:
                return None

            # 3. Explicitly split data frame rows across execution intervals
            # Standardize date strings to pandas datetime values
            df['occurredAt'] = pd.to_datetime(df['occurredAt'])
            
            historical_df = df[df['occurredAt'] < thirty_days_ago]
            recent_df = df[df['occurredAt'] >= thirty_days_ago]

            if historical_df.empty or recent_df.empty:
                return None

            # 4. Evaluate unique discretionary categories present in recent spend records
            recent_categories = recent_df['category'].unique()
            
            # Core categories to track for lifestyle creep (ignoring fixed components like RENT)
            discretionary_monitored_categories = ["FOOD", "TRAVEL", "SHOPPING", "OTHER"]

            for category in recent_categories:
                if category not in discretionary_monitored_categories:
                    continue
                
                # Execute validation math pipelines
                metrics = calculate_category_variance(historical_df, recent_df, category)
                
                # If a significant outlier pattern hits, return immediately to trigger an alert
                if metrics and metrics["is_creeping"]:
                    logger.warning(f"🚨 Lifestyle creep detected for user {user_id} in category {category}")
                    return {
                        "userId": user_id,
                        "is_creeping": True,
                        "category": category,
                        "varianceRatio": metrics["varianceRatio"],
                        "severityScore": metrics["severityScore"]
                    }

            # If no category crossed the statistical alert limits
            return {
                "userId": user_id,
                "is_creeping": False,
                "category": None,
                "varianceRatio": 0.0,
                "severityScore": 0.0
            }

        except Exception as e:
            logger.error(f"Error processing lifestyle analysis matrix variables: {str(e)}")
            return None

# Instantiate a single global instance for our main Kafka worker loop
lifestyle_creep_analyzer = LifestyleCreepAnalyzer()