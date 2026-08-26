from shapely.geometry import shape
from shapely.validation import make_valid


def make_geometry_valid(geojson_geometry):
    return make_valid(shape(geojson_geometry))
