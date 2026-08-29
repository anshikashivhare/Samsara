"""
AIS Trajectory Reconstruction & Interpolation Module.
"""

from typing import Dict, List, Optional, Tuple, Union
import numpy as np
import pandas as pd
import geopandas as gpd
from shapely.geometry import LineString, Point


def build_trajectory(group: pd.DataFrame) -> Optional[LineString]:
    """
    Builds a single LineString from chronologically sorted AIS records.
    Returns None if fewer than 2 distinct points exist.
    """
    ordered = group.sort_values("timestamp")
    coords = list(zip(ordered["longitude"], ordered["latitude"]))
    if len(coords) < 2:
        return None
    return LineString(coords)


def segment_trajectories_by_gap(
    df: pd.DataFrame, 
    max_gap_hours: float = 2.0
) -> pd.DataFrame:
    """
    Identifies AIS reception gaps and segments tracks into distinct voyage trajectories.
    Gaps larger than max_gap_hours are flagged as potential dark activity / AIS shutdown events.
    """
    out = df.sort_values(["mmsi", "timestamp"]).copy()
    
    # Calculate time delta in hours
    out["time_diff_hours"] = out.groupby("mmsi")["timestamp"].diff().dt.total_seconds() / 3600.0
    
    # Flag large gaps (dark vessel / signal loss)
    out["is_gap_break"] = (out["time_diff_hours"] > max_gap_hours).fillna(False)
    
    # Generate continuous trajectory segment IDs
    out["segment_id"] = out.groupby("mmsi")["is_gap_break"].cumsum()
    out["trajectory_id"] = out["mmsi"].astype(str) + "_seg" + out["segment_id"].astype(str)
    
    return out


def build_trajectories_gdf(df: pd.DataFrame, max_gap_hours: float = 2.0) -> gpd.GeoDataFrame:
    """
    Reconstructs all vessel trajectories as a GeoDataFrame of LineStrings with metadata.
    """
    segmented = segment_trajectories_by_gap(df, max_gap_hours=max_gap_hours)
    
    records = []
    for traj_id, group in segmented.groupby("trajectory_id"):
        if len(group) < 2:
            continue
        line = build_trajectory(group)
        if line is None:
            continue
            
        mmsi = group["mmsi"].iloc[0]
        start_time = group["timestamp"].min()
        end_time = group["timestamp"].max()
        duration_hours = (end_time - start_time).total_seconds() / 3600.0
        avg_sog = group["sog"].mean() if "sog" in group.columns else 0.0
        max_sog = group["sog"].max() if "sog" in group.columns else 0.0
        vessel_name = group["vessel_name"].iloc[0] if "vessel_name" in group.columns else ""
        vessel_type = group["vessel_type"].iloc[0] if "vessel_type" in group.columns else 0

        records.append({
            "trajectory_id": traj_id,
            "mmsi": mmsi,
            "vessel_name": vessel_name,
            "vessel_type": vessel_type,
            "start_time": start_time,
            "end_time": end_time,
            "duration_hours": duration_hours,
            "avg_sog": avg_sog,
            "max_sog": max_sog,
            "point_count": len(group),
            "geometry": line
        })
        
    return gpd.GeoDataFrame(records, crs="EPSG:4326") if records else gpd.GeoDataFrame()


def interpolate_position_at_time(
    group: pd.DataFrame, 
    target_time: Union[str, pd.Timestamp]
) -> Optional[Dict]:
    """
    Estimates a vessel's coordinates (lat, lon, SOG, COG) at an arbitrary timestamp t
    using linear interpolation between nearest AIS observations.
    """
    target = pd.to_datetime(target_time, utc=True)
    df_sorted = group.sort_values("timestamp")
    
    if df_sorted.empty:
        return None
        
    t_min = df_sorted["timestamp"].min()
    t_max = df_sorted["timestamp"].max()
    
    if target < t_min or target > t_max:
        return None  # Out of observation window
        
    exact = df_sorted[df_sorted["timestamp"] == target]
    if not exact.empty:
        row = exact.iloc[0]
        return {
            "mmsi": row["mmsi"],
            "timestamp": target,
            "latitude": row["latitude"],
            "longitude": row["longitude"],
            "sog": row.get("sog", 0.0),
            "cog": row.get("cog", 0.0)
        }
        
    before = df_sorted[df_sorted["timestamp"] < target].iloc[-1]
    after = df_sorted[df_sorted["timestamp"] > target].iloc[0]
    
    t0 = before["timestamp"].timestamp()
    t1 = after["timestamp"].timestamp()
    target_sec = target.timestamp()
    
    weight = (target_sec - t0) / (t1 - t0) if t1 > t0 else 0.0
    
    lat = before["latitude"] + weight * (after["latitude"] - before["latitude"])
    lon = before["longitude"] + weight * (after["longitude"] - before["longitude"])
    sog = (before.get("sog", 0.0) * (1 - weight)) + (after.get("sog", 0.0) * weight)
    
    return {
        "mmsi": before["mmsi"],
        "timestamp": target,
        "latitude": lat,
        "longitude": lon,
        "sog": sog,
        "interpolated": True
    }

