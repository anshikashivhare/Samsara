import pandas as pd
from attribution.vessel_ranking import rank_vessels


def test_ranking_orders_candidates():
    df = pd.DataFrame([
        {"mmsi": 1, "spatial": .9, "temporal": .9, "trajectory": .9, "behaviour": .9, "drift": .9},
        {"mmsi": 2, "spatial": .2, "temporal": .2, "trajectory": .2, "behaviour": .2, "drift": .2},
    ])
    ranked = rank_vessels(df)
    assert ranked.iloc[0].mmsi == 1
