from pathlib import Path
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
out = ROOT / "data/sample/ais/sample_ais.csv"
out.parent.mkdir(parents=True, exist_ok=True)
if not out.exists():
    pd.DataFrame([
        {"mmsi": 419001234, "timestamp": "2026-01-01T00:00:00Z", "latitude": 18.9, "longitude": 72.8, "speed_knots": 10, "heading": 90},
        {"mmsi": 419001234, "timestamp": "2026-01-01T01:00:00Z", "latitude": 18.95, "longitude": 72.9, "speed_knots": 11, "heading": 95},
        {"mmsi": 419005678, "timestamp": "2026-01-01T00:00:00Z", "latitude": 19.1, "longitude": 73.0, "speed_knots": 9, "heading": 180},
    ]).to_csv(out, index=False)
print(out)
