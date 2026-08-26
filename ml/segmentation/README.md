# Satellite segmentation

Planned pipeline:

1. Read Sentinel-1/SAR or optical GeoTIFF with Rasterio.
2. Normalize and preprocess imagery with OpenCV/NumPy.
3. Run a PyTorch U-Net model for pixel-wise oil-spill segmentation.
4. Post-process the mask and remove noise.
5. Convert connected regions to geospatial polygons.
6. Persist results as GeoJSON/PostGIS geometry with confidence and area.

Model weights are intentionally excluded from the repository. Add trained weights under `ml/weights/` locally or through a model registry.
