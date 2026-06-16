# handles pure maths (calculating moving average, standard deviation, and variance ratios)

# this module uses pandas and numpy to isolate a user's normal baseline spending behavior and see if current spending trends represent a statistically significant deviation.

import pandas as pd
import numpy as np
from typing import Dict, Any, Optional

def calculate_category_variance(

    historical_df: pd.DataFrame,
    recent_df: pd.DataFrame
) -> Optional[Dict[str,Any]]:
    if historical_df.empty or recent_df.empty:
          return None
     
    # Filter data frames by the specific target category
    hist_cat = historical_df[historical_df['category'] == category]
    recent_cat = recent_df[recent_df['category']== category]

    # we need a baseline dataset to establish a normal distribution footprint
    if len(hist_cat) < 3:
        return None
    

    # calculate historical baseline metrics
    hist_amounts = hist_cat['amount'].astype(float)
    hist_mean = hist_amounts.mean()
    hist_std = hist_amounts.std()

    # avoid division-by-zero
    if hist_std == 0:
        hist_std = 0.01
    
    # calculate current usage parameters (e.g., trailing 14 or 30 days)
    recent_amounts = recent_cat['amount'].astype(float)
    recent_total = recent_amounts.sum()
    recent_mean = recent_amounts.mean()

    # if spending went down or remained steady, lifestyle creep isn't happening
    if recent_mean <= hist_mean:
        return {
            "is_creeping": False,
            "varianceRatio": 0.0,
            "severityScore":0.0  
        }

    # z-scores measures how many standard deviations current spending is from the mean
    z_score = (recent_mean - hist_mean) / hist_std

    # calculate variance ratio( percentage increase over historical baseline)
    variance_ratio = (recent_mean - hist_mean) / hist_mean

    # Establish an evaluation matrix: Z-scores > 1.5 triggers creep warnings
    is_creeping = z_score > 1.5

    # Scale a severity metric score safely between 0.0 and 1.0
    # A z-score of 3.5 or higher indicates extreme outlier scaling

    severity_score = min(max((z_score-1.5)/2.0,0.0),1.0) if is_creeping else 0.0

    return {
        "is_creeping": bool(is_creeping),
        "varianceRatio": round(float(variance_ratio),4),
        "severityScore": round(float(severity_score),4)
    }


       