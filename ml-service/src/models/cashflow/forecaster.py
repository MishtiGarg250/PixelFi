import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, Any, List

def project_net_worth_and_burn(
    snapshot_df: pd.DataFrame, 
    months_horizon: int = 3
) -> Dict[str, Any]:
    """
    Analyzes historical FinancialSnapshots to extract savings rates, income velocities, 
    and expense volatility, projecting forward trajectories for net worth.
    """
    if snapshot_df.empty or len(snapshot_df) < 2:
        # Fallback parameters if the user hasn't accumulated enough snapshots yet
        return {
            "projected_net_worth": [],
            "income_growth_rate": 0.0,
            "expense_growth_rate": 0.0,
            "confidence_score": 0.50
        }

    # Ensure snapshots are sorted by execution date order
    snapshot_df = snapshot_df.sort_values(by="snapshotDate")
    
    # Extract structural monetary trends
    recent_snapshot = snapshot_df.iloc[-1]
    
    # Calculate simple historical month-over-month differentials
    net_worths = snapshot_df["netWorth"].astype(float).values
    nw_deltas = np.diff(net_worths)
    avg_monthly_change = float(np.mean(nw_deltas)) if len(nw_deltas) > 0 else 0.0

    # Build discrete timeline dates for projection mappings
    projections = []
    current_nw = float(recent_snapshot["netWorth"])
    last_date = pd.to_datetime(recent_snapshot["snapshotDate"])

    for i in range(1, months_horizon + 1):
        projected_date = last_date + timedelta(days=i * 30)
        current_nw += avg_monthly_change
        projections.append({
            "date": projected_date.strftime("%Y-%m-%d"),
            "expectedNetWorth": round(max(current_nw, 0.0), 2)
        })

    # Confidence calculation scales down if historical records are volatile
    raw_confidence = 0.95 if len(snapshot_df) >= 6 else 0.75
    if len(nw_deltas) > 1 and np.std(nw_deltas) > 0:
        # Higher standard deviation in historical shifts decreases prediction certainty
        raw_confidence -= min(float(np.std(nw_deltas) / np.abs(np.mean(nw_deltas) + 1)), 0.35)

    return {
        "projected_net_worth": projections,
        "income_growth_rate": round(float(recent_snapshot.get("incomeGrowthRate") or 0.0), 4),
        "expense_growth_rate": round(float(recent_snapshot.get("expenseGrowthRate") or 0.0), 4),
        "confidence_score": round(max(raw_confidence, 0.30), 4)
    }