import numpy as np
import pandas as pd


def behavioural_features(df: pd.DataFrame) -> pd.DataFrame:
    out = df.sort_values(["mmsi", "timestamp"]).copy()
    out["speed_delta"] = out.groupby("mmsi")["speed_knots"].diff().fillna(0) if "speed_knots" in out else 0
    out["heading_delta"] = out.groupby("mmsi")["heading"].diff().fillna(0) if "heading" in out else 0
    out["heading_delta"] = ((out["heading_delta"] + 180) % 360) - 180
    return out.replace([np.inf, -np.inf], np.nan).fillna(0)
