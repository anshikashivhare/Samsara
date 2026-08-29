"""
AIS Cleaning & Validation Module.
"""

from typing import List, Optional
import numpy as np
import pandas as pd


CORE_REQUIRED = ["mmsi", "timestamp", "latitude", "longitude"]


def clean_positions(
    df: pd.DataFrame,
    max_realistic_speed_knots: float = 60.0,
    drop_null_coordinates: bool = True
) -> pd.DataFrame:
    """
    Cleans raw AIS positions:
    - Verifies required columns
    - Parses timestamps to UTC datetime
    - Removes out-of-bound coordinates [-90..90, -180..180] and null islands (0.0, 0.0)
    - Deduplicates identical timestamps per vessel
    - Cleans numerical bounds on SOG, COG, Heading, and Draft
    - Sorts chronologically per vessel
    """
    missing = [c for c in CORE_REQUIRED if c not in df.columns]
    if missing:
        raise ValueError(f"Missing core AIS columns: {missing}")

    out = df.copy()

    # Parse and normalize timestamp
    out["timestamp"] = pd.to_datetime(out["timestamp"], utc=True, errors="coerce")
    if drop_null_coordinates:
        out = out.dropna(subset=CORE_REQUIRED)

    # Filter physical coordinate boundaries
    out = out[
        out["latitude"].between(-90.0, 90.0) & 
        out["longitude"].between(-180.0, 180.0)
    ]
    # Remove null island (0, 0) GPS sensor defaults
    out = out[~((out["latitude"].abs() < 1e-4) & (out["longitude"].abs() < 1e-4))]

    # Clean SOG bounds
    if "sog" in out.columns:
        out["sog"] = pd.to_numeric(out["sog"], errors="coerce").fillna(0.0)
        out = out[out["sog"].between(0.0, max_realistic_speed_knots)]

    # Clean COG bounds [0, 360)
    if "cog" in out.columns:
        out["cog"] = pd.to_numeric(out["cog"], errors="coerce")
        out.loc[~out["cog"].between(0.0, 360.0), "cog"] = np.nan

    # Clean Heading bounds [0, 360) - 511 is standard NMEA indicator for "not available"
    if "heading" in out.columns:
        out["heading"] = pd.to_numeric(out["heading"], errors="coerce")
        out.loc[(out["heading"] >= 360.0) | (out["heading"] < 0.0), "heading"] = np.nan

    # Clean Draft bounds
    if "draft" in out.columns:
        out["draft"] = pd.to_numeric(out["draft"], errors="coerce")
        out.loc[~out["draft"].between(0.0, 35.0), "draft"] = np.nan

    # Deduplicate timestamps per vessel (keep first)
    out = out.drop_duplicates(subset=["mmsi", "timestamp"], keep="first")

    # Chronological sort per vessel
    return out.sort_values(["mmsi", "timestamp"]).reset_index(drop=True)

