import pandas as pd


def generate_candidates(ais: pd.DataFrame, min_lon, min_lat, max_lon, max_lat) -> pd.DataFrame:
    return ais[
        ais.longitude.between(min_lon, max_lon) & ais.latitude.between(min_lat, max_lat)
    ].copy()
