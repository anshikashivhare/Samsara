import pandas as pd
import numpy as np
from typing import Dict, Any, List

DEFAULT_WEIGHTS = {
    "spatial_proximity": 0.25,     # Distance to backtracked spill origin
    "trajectory_alignment": 0.25, # Alignment between vessel track and slick orientation
    "temporal_fit": 0.20,         # AIS timestamp alignment with estimated discharge window
    "speed_profile": 0.15,        # Likelihood of operational discharge at speed (e.g. 8-16 knots)
    "drift_consistency": 0.15,    # Drift hindcast trajectory intersection score
}


def compute_trajectory_alignment_score(vessel_heading: float, slick_orientation: float) -> float:
    """
    Computes directional alignment score [0, 1] using cosine of angle difference.
    Oil slicks from moving vessels elongate along the vessel's travel direction.
    """
    angle_diff = np.radians(abs(vessel_heading - slick_orientation) % 180)
    # Cosine will be 1.0 for parallel, 0.0 for perpendicular
    return float(np.clip(np.cos(angle_diff), 0.0, 1.0))


def compute_speed_likelihood_score(speed_knots: float) -> float:
    """
    Operational bilge/sludge discharges typically occur when cruising between 8 and 18 knots.
    Vessels at anchor (0-1 kn) or slow maneuvering (1-5 kn) rarely produce linear slicks.
    """
    if speed_knots < 3.0:
        return 0.1
    elif 8.0 <= speed_knots <= 18.0:
        return 1.0
    elif 3.0 < speed_knots < 8.0:
        return float(speed_knots / 8.0)
    else:  # High speed > 18 knots
        return 0.7


def rank_vessels(
    df: pd.DataFrame,
    weights: Dict[str, float] = None,
    slick_orientation: float = None
) -> pd.DataFrame:
    """
    Ranks candidate vessels using multi-factor spatiotemporal & hydrodynamic evidence.
    Returns sorted DataFrame with overall confidence score and detailed factor breakdown.
    """
    if df.empty:
        return df

    w = weights or DEFAULT_WEIGHTS
    out = df.copy()

    # Calculate individual factor scores if missing
    if "trajectory_alignment" not in out.columns and slick_orientation is not None and "heading" in out.columns:
        out["trajectory_alignment"] = out["heading"].apply(
            lambda h: compute_trajectory_alignment_score(h, slick_orientation)
        )
    elif "trajectory" in out.columns and "trajectory_alignment" not in out.columns:
        out["trajectory_alignment"] = out["trajectory"]

    if "speed_profile" not in out.columns and "speed_knots" in out.columns:
        out["speed_profile"] = out["speed_knots"].apply(compute_speed_likelihood_score)
    elif "behaviour" in out.columns and "speed_profile" not in out.columns:
        out["speed_profile"] = out["behaviour"]

    if "spatial_proximity" not in out.columns and "spatial" in out.columns:
        out["spatial_proximity"] = out["spatial"]

    if "temporal_fit" not in out.columns and "temporal" in out.columns:
        out["temporal_fit"] = out["temporal"]

    if "drift_consistency" not in out.columns and "drift" in out.columns:
        out["drift_consistency"] = out["drift"]

    # Compute weighted composite score
    total_score = 0.0
    for factor, weight in w.items():
        val = out.get(factor, 0.0)
        total_score = total_score + val * weight

    out["score"] = total_score
    out["score_100"] = (out["score"] * 100).round(2)

    # Flag suspected dark vessels (radar detection with no valid MMSI / turned-off AIS)
    if "is_dark_vessel" not in out.columns:
        out["is_dark_vessel"] = out.get("mmsi", 0).isna() | (out.get("mmsi", 0) == 0)

    # Classify confidence level
    conditions = [
        out["score"] >= 0.75,
        (out["score"] >= 0.45) & (out["score"] < 0.75),
        out["score"] < 0.45
    ]
    choices = ["HIGH", "MEDIUM", "LOW"]
    out["confidence_tier"] = np.select(conditions, choices, default="LOW")

    return out.sort_values("score", ascending=False).reset_index(drop=True)

