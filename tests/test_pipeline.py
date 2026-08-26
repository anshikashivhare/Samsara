import pandas as pd
from ais.cleaning import clean_positions
from ais.features import behavioural_features


def test_ais_pipeline_basics():
    df = pd.DataFrame([{
        "mmsi": 1, "timestamp": "2026-01-01T00:00:00Z",
        "latitude": 10, "longitude": 20, "speed_knots": 8, "heading": 90
    }])
    result = behavioural_features(clean_positions(df))
    assert len(result) == 1
    assert "heading_delta" in result.columns
