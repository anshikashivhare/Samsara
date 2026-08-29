"""
Raster Mask to Vector Polygonization Module (with Georeferencing).
"""

from typing import List, Optional, Tuple, Union
import cv2
import numpy as np
import rasterio
from rasterio.features import shapes
from shapely.geometry import Polygon, MultiPolygon, shape
from shapely.validation import make_valid


def mask_to_polygons(
    mask: np.ndarray, 
    min_area_pixels: float = 20,
    transform: Optional[rasterio.Affine] = None
) -> List[Polygon]:
    """
    Converts a binary/classification mask to vector Shapely Polygons.
    If an affine transform is provided, polygons are transformed to geographic coordinates.
    """
    binary = (mask > 0).astype(np.uint8)
    
    if transform is not None:
        # Use rasterio extraction with direct georeferencing
        results = []
        for geom_dict, val in shapes(binary, mask=(binary > 0), transform=transform):
            if val == 1:
                geom = shape(geom_dict)
                if not geom.is_valid:
                    geom = make_valid(geom)
                if isinstance(geom, (Polygon, MultiPolygon)):
                    results.append(geom)
        return results

    # Contour-based fallback in pixel space
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    polygons = []
    for contour in contours:
        if len(contour) < 3:
            continue
        polygon = Polygon(contour[:, 0, :])
        if not polygon.is_valid:
            polygon = make_valid(polygon)
        if polygon.is_valid and polygon.area >= min_area_pixels:
            polygons.append(polygon)
    return polygons


def multiclass_mask_to_polygons(
    mask: np.ndarray,
    target_classes: Optional[List[int]] = None,
    transform: Optional[rasterio.Affine] = None,
    min_area_pixels: float = 20
) -> List[dict]:
    """
    Extracts polygons per class from a multiclass segmentation mask
    (e.g., class 0: Oil, class 4: Look-alike).
    """
    if target_classes is None:
        target_classes = [0, 4]  # Oil, Look-alike

    extracted = []
    for cls in target_classes:
        class_mask = (mask == cls).astype(np.uint8)
        polys = mask_to_polygons(class_mask, min_area_pixels=min_area_pixels, transform=transform)
        for p in polys:
            extracted.append({
                "class_id": cls,
                "geometry": p
            })
    return extracted

