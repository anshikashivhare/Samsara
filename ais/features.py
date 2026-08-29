"""
AIS Kinematic & Behavioral Feature Engineering Module.
"""

from typing import List, Optional
import numpy as np
import pandas as pd


def haversine_distance_km(lat1, lon1, lat2, lon2) -> np.ndarray:
    """
    Computes geodesic distance in kilometers between pairs of coordinates.
    """
    r = 6371.0  # Earth radius in km
    phi1, phi2 = np.radians(lat1), np.radians(lat2)
    dphi = np.radians(lat2 - lat1)
    dlambda = np.radians(lon2 - lon1)
    
    a = np.sin(dphi / 2.0) ** 2 + np.cos(phi1) * np.cos(phi2) * np.sin(dlambda / 2.0) ** 2
    c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))
    return r * c


def compute_kinematic_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Computes vessel motion, course, rate-of-turn, acceleration, draft deltas,
    and loitering indicators.
    """
    out = df.sort_values(["mmsi", "timestamp"]).copy()
    
    # Ensure timestamp is datetime
    if not pd.api.types.is_datetime64_any_dtype(out["timestamp"]):
        out["timestamp"] = pd.to_datetime(out["timestamp"], utc=True)

    # Time delta in seconds and hours
    dt_sec = out.groupby("mmsi")["timestamp"].diff().dt.total_seconds().fillna(0)
    out["dt_sec"] = dt_sec
    out["dt_hours"] = dt_sec / 3600.0

    # Geodesic step distance
    prev_lat = out.groupby("mmsi")["latitude"].shift(1).fillna(out["latitude"])
    prev_lon = out.groupby("mmsi")["longitude"].shift(1).fillna(out["longitude"])
    out["distance_km"] = haversine_distance_km(prev_lat, prev_lon, out["latitude"], out["longitude"])

    # Computed speed in knots from displacement (1 knot = 1.852 km/h)
    safe_hours = out["dt_hours"].replace(0, np.nan)
    out["speed_computed_knots"] = (out["distance_km"] / safe_hours / 1.852).fillna(0).clip(0, 100)

    # Reported SOG deltas
    sog_col = "sog" if "sog" in out.columns else "speed_knots"
    if sog_col in out.columns:
        out["speed_delta"] = out.groupby("mmsi")[sog_col].diff().fillna(0)
        # Acceleration in knots per minute
        safe_min = (dt_sec / 60.0).replace(0, np.nan)
        out["acceleration_kpm"] = (out["speed_delta"] / safe_min).fillna(0).clip(-30, 30)
    else:
        out["speed_delta"] = 0.0
        out["acceleration_kpm"] = 0.0

    # Heading and COG angular deviations (shortest angle in [-180, 180])
    if "heading" in out.columns:
        head_diff = out.groupby("mmsi")["heading"].diff().fillna(0)
        out["heading_delta"] = ((head_diff + 180) % 360) - 180
    else:
        out["heading_delta"] = 0.0

    if "cog" in out.columns:
        cog_diff = out.groupby("mmsi")["cog"].diff().fillna(0)
        out["cog_delta"] = ((cog_diff + 180) % 360) - 180
    else:
        out["cog_delta"] = 0.0

    # Rate of Turn (degrees per minute)
    safe_min = (dt_sec / 60.0).replace(0, np.nan)
    out["rate_of_turn_deg_min"] = (out["heading_delta"].abs() / safe_min).fillna(0).clip(0, 360)

    # Draft / cargo discharge delta (lightering / weight changes)
    if "draft" in out.columns:
        out["draft_delta"] = out.groupby("mmsi")["draft"].diff().fillna(0)
    else:
        out["draft_delta"] = 0.0

    # Loitering / slow drift indicator (SOG < 3 knots while offshore)
    if sog_col in out.columns:
        out["is_loitering"] = (out[sog_col] < 3.0) & (out["dt_hours"] > 0.5)
    else:
        out["is_loitering"] = False

    return out.replace([np.inf, -np.inf], np.nan).fillna(0)


def behavioural_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Backward-compatible entry point.
    """
    return compute_kinematic_features(df)

