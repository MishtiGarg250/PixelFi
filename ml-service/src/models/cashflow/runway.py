## given my current monthly burn rate and available cash balance, how many days 
import pandas as pd
import logging
from datetime import datetime, timedelta
from sqlalchemy.engine import Engine
from typing import Optional, Dict, Any
from src.models.cashflow.forecaster import project_net_worth_and_burn

logger = logging.getLogger("CashFlowEngine")

class CashFlowForecaster:
    def __init__(self):
        pass

    def evaluate_runway_and_forecast(self, user_id: str, db_engine: Engine) -> Optional[Dict[str, Any]]:
        """
        Queries financial metadata, executes runway tracking math, 
        and extracts payload packet variations for Kafka streaming endpoints.
        """
        try:
            # 1. Pull historical snapshot timeline blocks for the user
            query = """
                SELECT * FROM "FinancialSnapshot"
                WHERE "userId" = %(user_id)s
                ORDER BY "snapshotDate" DESC
                LIMIT 12
            """
            df = pd.read_sql(query, db_engine, params={"user_id": user_id})

            if df.empty:
                return None

            # Isolate our most immediate data configuration row
            latest_snapshot = df.iloc[0]
            snapshot_id = str(latest_snapshot["id"])

            # 2. Extract operational metrics for Runway Analysis
            cash_value = float(latest_snapshot["cashValue"] or 0.0)
            monthly_expenses = float(latest_snapshot["monthlyExpenses"] or 0.0)
            monthly_income = float(latest_snapshot["monthlyIncome"] or 0.0)

            # Compute Net Monthly Burn Rate (if expenses outpace total incoming cash flows)
            net_monthly_burn = monthly_expenses - monthly_income
            
            liquidity_risk_flag = False
            warning_payload = None
            runway_days = 9999 # Safe baseline for cashflow positive trajectories

            if net_monthly_burn > 0:
                # runway_months = available cash / net monthly deficit
                runway_months = cash_value / net_monthly_burn
                runway_days = int(runway_months * 30.4)

                # Trigger critical warnings if available runway shrinks below a 45-day window
                if runway_days <= 45:
                    liquidity_risk_flag = True
                    # Scale severity: lower days remaining translates to higher structural severity
                    severity_score = round(max(1.0 - (runway_days / 45), 0.4), 4)
                    
                    warning_payload = {
                        "userId": user_id,
                        "runwayDaysRemaining": runway_days,
                        "severityScore": severity_score
                    }

            # 3. Generate 3-Month Outbound Trend Forecasting Configurations
            forecast_metrics = project_net_worth_and_burn(df, months_horizon=3)
            
            # Construct target projection horizon parameters
            horizon_date = (datetime.utcnow() + timedelta(days=90)).strftime("%Y-%m-%d")
            
            forecast_payload = {
                "userId": user_id,
                "snapshotId": snapshot_id,
                "projectionHorizonDate": horizon_date,
                "confidenceScore": forecast_metrics["confidence_score"],
                "resultJson": {
                    "projections": forecast_metrics["projected_net_worth"],
                    "incomeGrowthRate": forecast_metrics["income_growth_rate"],
                    "expenseGrowthRate": forecast_metrics["expense_growth_rate"]
                }
            }

            return {
                "liquidity_risk_flag": liquidity_risk_flag,
                "warning_payload": warning_payload,
                "forecast_payload": forecast_payload
            }

        except Exception as e:
            logger.error(f"Error compiling cash flow forecast processing: {str(e)}")
            return None

# Instantiate a single global execution resource for the main Kafka system loop
cashflow_forecaster = CashFlowForecaster()