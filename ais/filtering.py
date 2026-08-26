import pandas as pd


def within_bbox(df: pd.DataFrame, min_lon, min_lat, max_lon, max_lat):
    return df[df.longitude.between(min_lon, max_lon) & df.latitude.between(min_lat, max_lat)].copy()
