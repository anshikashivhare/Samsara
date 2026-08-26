import pandas as pd

WEIGHTS = {
    "spatial": 0.20,
    "temporal": 0.20,
    "trajectory": 0.20,
    "behaviour": 0.20,
    "drift": 0.20,
}


def rank_vessels(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    out["score"] = sum(out.get(k, 0.0) * weight for k, weight in WEIGHTS.items())
    out["score_100"] = (out["score"] * 100).round(2)
    return out.sort_values("score", ascending=False).reset_index(drop=True)
