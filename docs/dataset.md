# Dataset Guide

Samsara expects three primary data families:

- `data/raw/satellite/`: GeoTIFF/SAR or other supported remote-sensing imagery.
- `data/raw/ais/`: timestamped AIS observations such as MMSI, latitude, longitude, speed, and heading.
- `data/raw/ocean/`: gridded currents, wind, and weather data, preferably in NetCDF/Zarr-compatible formats.

Processed outputs belong in `data/processed/`. Small, redistributable fixtures for development belong in `data/sample/`.

Large datasets and model weights are intentionally ignored by Git. Record source, acquisition date, CRS, temporal coverage, licensing, and preprocessing assumptions in dataset metadata.
