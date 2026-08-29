import cv2
import numpy as np
import rasterio
from typing import Tuple, List, Optional


def lee_filter(img: np.ndarray, size: int = 5) -> np.ndarray:
    """
    Enhanced Lee speckle filter for SAR imagery.
    Reduces coherent radar speckle while preserving sharp edges.
    """
    img_mean = cv2.blur(img, (size, size))
    img_sqr_mean = cv2.blur(img ** 2, (size, size))
    img_variance = np.maximum(img_sqr_mean - img_mean ** 2, 0)

    overall_variance = np.var(img)
    if overall_variance == 0:
        return img

    img_weights = img_variance / (img_variance + overall_variance + 1e-8)
    img_output = img_mean + img_weights * (img - img_mean)
    return np.clip(img_output, 0, None)


def linear_to_db(img: np.ndarray) -> np.ndarray:
    """Converts linear intensity backscatter to decibel scale (dB)."""
    img_safe = np.maximum(img, 1e-7)
    return 10.0 * np.log10(img_safe)


def slice_into_patches(
    image: np.ndarray,
    patch_size: int = 256,
    stride: int = 256
) -> List[Tuple[np.ndarray, Tuple[int, int, int, int]]]:
    """
    Slices large satellite SAR scenes into uniform ML input patches.
    Returns list of (patch_array, (y_min, y_max, x_min, x_max)).
    """
    h, w = image.shape[:2]
    patches = []
    
    for y in range(0, h - patch_size + 1, stride):
        for x in range(0, w - patch_size + 1, stride):
            patch = image[y : y + patch_size, x : x + patch_size]
            patches.append((patch, (y, y + patch_size, x, x + patch_size)))
            
    return patches


def read_sar(path: str, apply_lee: bool = True) -> Tuple[np.ndarray, dict]:
    """
    Reads SAR raster, handles NaNs, applies optional Lee speckle filtering,
    and returns image in normalized float32 format.
    """
    with rasterio.open(path) as src:
        image = src.read(1).astype(np.float32)
        profile = src.profile.copy()
        
    image = np.nan_to_num(image, nan=0.0, posinf=0.0, neginf=0.0)
    
    if apply_lee:
        image = lee_filter(image, size=5)
    else:
        image = cv2.GaussianBlur(image, (3, 3), 0)
        
    return image, profile

