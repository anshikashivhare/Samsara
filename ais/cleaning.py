import pandas as pd

REQUIRED = ["mmsi", "timestamp", "latitude", "longitude"]


def clean_positions(df: pd.DataFrame) -> pd.DataFrame:
    missing = [c for c in REQUIRED if c not in df.columns]
    if missing:
        raise ValueError(f"Missing AIS columns: {missing}")
    out = df.copy()
    out["timestamp"] = pd.to_datetime(out["timestamp"], utc=True, errors="coerce")
    out = out.dropna(subset=REQUIRED)
    out = out[out["latitude"].between(-90, 90) & out["longitude"].between(-180, 180)]
    return out.sort_values(["mmsi", "timestamp"]).reset_index(drop=True)
