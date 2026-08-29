"""
AIS Filtering & Subsetting Module.
"""

from typing import List, Optional, Union
import pandas as pd
import geopandas as gpd
from shapely.geometry import Polygon, MultiPolygon, Point


def filter_by_bbox(
    df: pd.DataFrame, 
    min_lon: float, 
    min_lat: float, 
    max_lon: float, 
    max_lat: float
) -> pd.DataFrame:
    """
    Filters AIS points within a bounding box.
    """
    return df[
        df["longitude"].between(min_lon, max_lon) & 
        df["latitude"].between(min_lat, max_lat)
    ].copy()


def filter_by_time_window(
    df: pd.DataFrame,
    start_time: Union[str, pd.Timestamp],
    end_time: Union[str, pd.Timestamp]
) -> pd.DataFrame:
    """
    Filters AIS points within a temporal window.
    """
    start = pd.to_datetime(start_time, utc=True)
    end = pd.to_datetime(end_time, utc=True)
    return df[df["timestamp"].between(start, end)].copy()


def filter_by_polygon(
    df: pd.DataFrame,
    polygon: Union[Polygon, MultiPolygon, gpd.GeoDataFrame]
) -> pd.DataFrame:
    """
    Spatial intersection filtering against a polygon (e.g. EEZ, Marine Protected Area, SAR Swath).
    """
    if df.empty:
        return df.copy()
        
    gdf = gpd.GeoDataFrame(
        df,
        geometry=gpd.points_from_xy(df["longitude"], df["latitude"]),
        crs="EPSG:4326"
    )
    
    if isinstance(polygon, gpd.GeoDataFrame):
        poly_geom = polygon.unary_union
    else:
        poly_geom = polygon
        
    mask = gdf.geometry.intersects(poly_geom)
    return df[mask].copy()


def filter_by_vessel_type(
    df: pd.DataFrame,
    vessel_types: List[Union[int, str]]
) -> pd.DataFrame:
    """
    Filters AIS data for specific target vessels (e.g., Tankers, Cargo, Fishing).
    """
    if "vessel_type" not in df.columns:
        return df.copy()
    return df[df["vessel_type"].isin(vessel_types)].copy()


def within_bbox(df: pd.DataFrame, min_lon, min_lat, max_lon, max_lat):
    return filter_by_bbox(df, min_lon, min_lat, max_lon, max_lat)

