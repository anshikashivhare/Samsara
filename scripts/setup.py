from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
for path in [
    "data/raw/satellite", "data/raw/ais", "data/raw/ocean",
    "data/processed/satellite", "data/processed/ais", "data/processed/ocean",
    "data/sample/satellite", "data/sample/ais", "data/sample/ocean",
]:
    (ROOT / path).mkdir(parents=True, exist_ok=True)
print(f"Samsara data directories initialized at {ROOT / 'data'}")
