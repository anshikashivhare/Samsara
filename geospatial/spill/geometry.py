"""
Spill Geometry Processing & Morphological Metrics Module.
"""

from typing import Dict, Tuple, Union
import numpy as np
from shapely.geometry import Polygon, MultiPolygon, shape
from shapely.validation import make_valid


def make_geometry_valid(geojson_or_shape):
    """
    Validates and repairs a geometry.
    """
    if isinstance(geojson_or_shape, dict):
        geom = shape(geojson_or_shape)
    else:
        geom = geojson_or_shape
    return make_valid(geom)


def compute_slick_morphology(polygon: Union[Polygon, MultiPolygon]) -> Dict[str, float]:
    """
    Computes morphological shape descriptors for an oil slick polygon:
    - Minimum rotated bounding box length & width
    - Aspect Ratio (length / width, indicating linear slick vs circular patch)
    - Major axis orientation angle (degrees relative to North)
    - Convexity / compactness ratio (area / convex_hull_area)
    """
    if polygon.is_empty:
        return {"length": 0.0, "width": 0.0, "aspect_ratio": 1.0, "orientation_deg": 0.0, "compactness": 0.0}

    # Minimum rotated rectangle (OBB)
    min_rect = polygon.minimum_rotated_rectangle
    if min_rect.is_empty or len(min_rect.exterior.coords) < 4:
        return {"length": 0.0, "width": 0.0, "aspect_ratio": 1.0, "orientation_deg": 0.0, "compactness": 0.0}

    coords = np.array(min_rect.exterior.coords)[:4]
    
    # Calculate side vectors
    side1 = coords[1] - coords[0]
    side2 = coords[2] - coords[1]
    
    len1 = float(np.hypot(side1[0], side1[1]))
    len2 = float(np.hypot(side2[0], side2[1]))
    
    if len1 >= len2:
        length, width = len1, max(len2, 1e-6)
        angle = np.degrees(np.arctan2(side1[1], side1[0]))
    else:
        length, width = len2, max(len1, 1e-6)
        angle = np.degrees(np.arctan2(side2[1], side2[0]))

    aspect_ratio = float(length / width)
    # Orientation normalized to [0, 180)
    orientation_deg = float((angle + 360) % 180)
    
    convex_area = polygon.convex_hull.area
    compactness = float(polygon.area / convex_area) if convex_area > 0 else 0.0

    return {
        "length": length,
        "width": width,
        "aspect_ratio": np.round(aspect_ratio, 2),
        "orientation_deg": np.round(orientation_deg, 2),
        "compactness": np.round(compactness, 4)
    }

