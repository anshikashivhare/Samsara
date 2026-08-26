from pyproj import Transformer


def transformer(source="EPSG:4326", target="EPSG:3857"):
    return Transformer.from_crs(source, target, always_xy=True)
