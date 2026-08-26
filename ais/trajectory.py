import pandas as pd
from shapely.geometry import LineString


def build_trajectory(group: pd.DataFrame) -> LineString:
    ordered = group.sort_values("timestamp")
    return LineString(zip(ordered["longitude"], ordered["latitude"]))
