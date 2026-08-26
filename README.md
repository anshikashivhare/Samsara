# Samsara 🌊

Samsara is an AI-assisted maritime oil-spill investigation platform combining satellite computer vision, ocean drift modelling, AIS trajectory analysis, geospatial processing, explainable vessel attribution, and an interactive dashboard.

## End-to-end workflow

```text
Satellite SAR / optical imagery
        ↓
Preprocessing → U-Net segmentation → spill mask → GeoJSON/PostGIS polygon
        ↓
Ocean currents + wind → drift forecast / hindcast → probable origin zones
        ↓
AIS ingestion → cleaning → trajectories → features → DBSCAN anomalies
        ↓
Spatial + temporal + trajectory + behaviour + drift evidence
        ↓
Explainable vessel ranking
        ↓
FastAPI → React + MapLibre + Recharts investigation dashboard
```

## Technology stack

Python, FastAPI, PyTorch, U-Net, OpenCV, Rasterio, NumPy, Pandas, GeoPandas, Shapely, PyProj, Scikit-learn/DBSCAN, XGBoost-ready architecture, Matplotlib, xarray, SciPy, PostgreSQL/PostGIS, React/TypeScript, MapLibre GL JS, Recharts, Docker and Docker Compose.

## Repository structure

```text
Samsara/
├── docs/                   # architecture, methodology, dataset, API, demo
├── data/                   # raw, processed and small sample datasets
├── ml/                     # U-Net, preprocessing, training, inference
├── geospatial/             # satellite and spill geometry utilities
├── drift/                  # ocean drift forecast/hindcast
├── ais/                    # AIS ingestion, trajectories and anomalies
├── attribution/            # candidate generation and evidence scoring
├── backend/                # FastAPI API, services, models and tests
├── frontend/               # React dashboard
├── database/               # PostgreSQL + PostGIS schema and seed
├── scripts/                # setup, sample data and pipeline runner
└── tests/                  # project-level tests
```

## Quick start

```bash
cp .env.example .env
docker compose up --build
```

- Dashboard: `http://localhost:5173`
- API: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`
- PostGIS: `localhost:5432`

Generate the development AIS fixture with `python scripts/download_sample_data.py`, then run `python scripts/run_pipeline.py`.

## Important

This repository is a research/MVP foundation. Production use requires validated satellite and oceanographic datasets, trained and evaluated model weights, time-varying environmental forcing, domain calibration, secure authentication, and complete data provenance. Large datasets and secrets must not be committed.
