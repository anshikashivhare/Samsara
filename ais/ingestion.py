"""
AIS Data Ingestion & Standardization Module.

Handles loading, schema normalization, and parsing of raw AIS datasets from
standard maritime providers (NOAA, MarineCadastre, Spire, exactEarth, AISHub, raw NMEA/CSV).
"""

from typing import Dict, List, Optional, Union
import pandas as pd
import numpy as np


COLUMN_MAPPINGS = {
    # Standard internal schema
    "mmsi": "mmsi",
    "timestamp": "timestamp",
    "latitude": "latitude",
    "longitude": "longitude",
    "sog": "sog",
    "cog": "cog",
    "heading": "heading",
    "draft": "draft",
    "draught": "draft",
    "vessel_name": "vessel_name",
    "vessel_type": "vessel_type",
    "imo": "imo",
    "call_sign": "call_sign",
    "nav_status": "nav_status",
    "status": "nav_status",
    
    # NOAA / MarineCadastre format
    "basedatetime": "timestamp",
    "basedate_time": "timestamp",
    "lat": "latitude",
    "lon": "longitude",
    "vesselname": "vessel_name",
    "vesseltype": "vessel_type",
    "callsign": "call_sign",
    "length": "length",
    "width": "width",
    "cargo": "cargo",
    "transceiverclass": "transceiver_class",
    
    # Alternative naming conventions
    "speed": "sog",
    "speed_knots": "sog",
    "course": "cog",
    "course_over_ground": "cog",
    "speed_over_ground": "sog",
    "ship_name": "vessel_name",
    "ship_type": "vessel_type",
    "time": "timestamp",
    "datetime": "timestamp",
    "date_time": "timestamp",
    "geom_lat": "latitude",
    "geom_lon": "longitude",
}


def standardize_columns(df: pd.DataFrame) -> pd.DataFrame:
    """
    Standardizes dataframe columns to unified Samsara AIS schema.
    """
    renamed = {}
    for col in df.columns:
        clean_col = str(col).strip().lower().replace(" ", "_").replace("-", "_")
        if clean_col in COLUMN_MAPPINGS:
            renamed[col] = COLUMN_MAPPINGS[clean_col]
        else:
            renamed[col] = clean_col
    return df.rename(columns=renamed)


def load_ais_dataset(
    source: Union[str, pd.DataFrame, List[Dict]],
    format_hint: Optional[str] = None
) -> pd.DataFrame:
    """
    Loads AIS records from a file path (CSV, Parquet, JSON, GeoJSON), 
    an existing DataFrame, or a list of dictionaries (streaming messages).
    
    Returns a standardized DataFrame.
    """
    if isinstance(source, pd.DataFrame):
        df = source.copy()
    elif isinstance(source, list):
        df = pd.DataFrame(source)
    elif isinstance(source, str):
        path_lower = source.lower()
        if format_hint == "parquet" or path_lower.endswith(".parquet"):
            df = pd.read_parquet(source)
        elif format_hint == "json" or path_lower.endswith(".json") or path_lower.endswith(".geojson"):
            df = pd.read_json(source)
        else:
            df = pd.read_csv(source)
    else:
        raise TypeError(f"Unsupported source type: {type(source)}")

    df = standardize_columns(df)
    
    if "mmsi" in df.columns:
        df["mmsi"] = pd.to_numeric(df["mmsi"], errors="coerce").fillna(0).astype(np.int64)
        
    return df


def load_csv(path: str) -> pd.DataFrame:
    return load_ais_dataset(path)

