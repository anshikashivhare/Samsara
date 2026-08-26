import geopandas as gpd


def area_km2(geometry, source_crs="EPSG:4326") -> float:
    gdf = gpd.GeoDataFrame(geometry=[geometry], crs=source_crs)
    metric = gdf.to_crs(gdf.estimate_utm_crs())
    return float(metric.geometry.area.iloc[0] / 1_000_000)
