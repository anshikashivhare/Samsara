def drift_score(origin_probability: float) -> float:
    return max(0.0, min(1.0, float(origin_probability)))
