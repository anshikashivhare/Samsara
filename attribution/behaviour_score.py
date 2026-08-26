def behaviour_score(anomaly_fraction: float) -> float:
    return max(0.0, min(1.0, float(anomaly_fraction)))
