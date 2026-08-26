def trajectory_score(overlap_fraction: float) -> float:
    return max(0.0, min(1.0, float(overlap_fraction)))
