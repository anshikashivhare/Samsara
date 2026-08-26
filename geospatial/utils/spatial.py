from shapely.geometry import Point


def point(longitude: float, latitude: float) -> Point:
    return Point(longitude, latitude)
