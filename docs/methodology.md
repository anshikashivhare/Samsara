# Methodology

## 1. Detection
Acquire satellite imagery, preprocess SAR/optical bands, normalize imagery, and infer an oil-spill mask with U-Net.

## 2. Geospatialization
Clean the mask, extract connected regions, convert the result into valid polygons, calculate area in an appropriate projected CRS, and store geometry in PostGIS.

## 3. Drift analysis
Combine spill geometry with time-aligned current and wind fields. Run forward forecasts and backward hindcasts to estimate likely origin zones.

## 4. AIS correlation
Clean AIS observations, build vessel trajectories, derive speed/heading/route features, and detect unusual behaviour with DBSCAN and other statistical features.

## 5. Attribution
Generate candidate vessels and combine spatial, temporal, trajectory, behaviour, and drift evidence into an explainable score. XGBoost may be introduced after labelled evidence is available.

## 6. Investigation UI
Expose incident state, maps, vessel ranking, drift timeline, confidence, and evidence through FastAPI and a React/MapLibre dashboard.
