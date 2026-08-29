"""
Geospatial Coordinate & Projection Utilities.
"""

from typing import Tuple
from pyproj import CRS, Transformer
from shapely.geometry import Point, Polygon
from shapely.ops import transform


def get_transformer(source: str = "EPSG:4326", target: str = "EPSG:3857") -> Transformer:
    """
    Creates a pyproj Transformer between coordinate reference systems.
    """
    return Transformer.from_crs(source, target, always_xy=True)


def get_utm_epsg_for_coordinates(lat: float, lon: float) -> str:
    """
    Determines the appropriate UTM EPSG code for a given latitude and longitude.
    """
    zone = int((lon + 180) / 6) + 1
    hemisphere = "6" if lat >= 0 else "7"  # 326xx for North, 327xx for South
    return f"EPSG:32{hemisphere}{zone:02d}"


def project_geometry(geometry, source_crs: str, target_crs: str):
    """
    Projects a Shapely geometry from source_crs to target_crs.
    """
    trans = get_transformer(source_crs, target_crs)
    return transform(trans.transform, geometry)


def transformer(source="EPSG:4326", target="EPSG:3857"):
    return get_transformer(source, target)

