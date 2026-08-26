import cv2
import numpy as np
import rasterio


def read_sar(path: str) -> tuple[np.ndarray, dict]:
    with rasterio.open(path) as src:
        image = src.read(1).astype(np.float32)
        profile = src.profile.copy()
    image = np.nan_to_num(image)
    image = cv2.GaussianBlur(image, (3, 3), 0)
    return image, profile
