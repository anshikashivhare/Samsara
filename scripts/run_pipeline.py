"""Minimal end-to-end orchestration entrypoint for the MVP."""
from pathlib import Path
import pandas as pd
from ais.cleaning import clean_positions
from ais.features import behavioural_features
from ais.anomaly_detection import dbscan_anomalies
from attribution.vessel_ranking import rank_vessels

ROOT = Path(__file__).resolve().parents[1]


def run():
    path = ROOT / "data/sample/ais/sample_ais.csv"
    if not path.exists():
        print("Run scripts/download_sample_data.py first.")
        return
    ais = dbscan_anomalies(behavioural_features(clean_positions(pd.read_csv(path))))
    print(f"AIS rows processed: {len(ais)}; anomalies: {int(ais.is_anomaly.sum())}")


if __name__ == "__main__":
    run()
