import pandas as pd
from ais.cleaning import clean_positions


def test_cleaning_rejects_invalid_coordinates():
    df = pd.DataFrame([{"mmsi": 1, "timestamp": "2026-01-01", "latitude": 200, "longitude": 20}])
    assert clean_positions(df).empty
