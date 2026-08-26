from datetime import datetime


def temporal_score(observed: datetime, expected: datetime, tolerance_hours: float = 24.0) -> float:
    delta_hours = abs((observed - expected).total_seconds()) / 3600
    return max(0.0, 1.0 - delta_hours / tolerance_hours)
