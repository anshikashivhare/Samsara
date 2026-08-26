import cv2
import numpy as np
from shapely.geometry import Polygon


def mask_to_polygons(mask: np.ndarray, min_area_pixels: float = 20) -> list[Polygon]:
    binary = (mask > 0).astype(np.uint8)
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    polygons = []
    for contour in contours:
        if len(contour) < 3:
            continue
        polygon = Polygon(contour[:, 0, :])
        if polygon.is_valid and polygon.area >= min_area_pixels:
            polygons.append(polygon)
    return polygons
