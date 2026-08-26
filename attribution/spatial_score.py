import numpy as np


def distance_score(distance_km: float, scale_km: float = 50.0) -> float:
    return float(np.exp(-max(distance_km, 0.0) / scale_km))
