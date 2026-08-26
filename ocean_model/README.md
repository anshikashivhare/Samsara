# Ocean drift modelling

The drift module will combine gridded ocean-current and wind fields with the detected spill geometry to estimate probable movement and origin zones.

Suggested implementation:

- xarray for NetCDF/gridded environmental datasets
- NumPy/SciPy for numerical integration
- GeoPandas/Shapely/PyProj for geographic transformations and geometry
- Copernicus Marine or another suitable public oceanographic source for production data

Keep raw datasets outside Git when they are large.
