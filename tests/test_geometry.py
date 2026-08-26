from shapely.geometry import Polygon
from geospatial.spill.geometry import make_geometry_valid


def test_valid_polygon():
    polygon = make_geometry_valid(Polygon([(0, 0), (1, 0), (1, 1), (0, 0)]).__geo_interface__)
    assert polygon.is_valid
