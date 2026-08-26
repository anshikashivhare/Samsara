import rasterio


def inspect_crs(path: str):
    with rasterio.open(path) as src:
        return {"crs": str(src.crs), "transform": tuple(src.transform), "bounds": tuple(src.bounds)}
