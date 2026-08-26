# Samsara 🌊

Samsara is an AI-assisted maritime oil-spill investigation platform that combines satellite imagery, computer vision, ocean drift simulation, AIS trajectory analysis, geospatial processing, and an interactive investigation dashboard.

## Core workflow

```text
Satellite SAR / optical imagery
          │
          ▼
   Image preprocessing
          │
          ▼
   U-Net spill segmentation ──────► Oil-spill polygons
          │                                  │
          │                                  ▼
          │                         PostGIS investigation DB
          │                                  ▲
          ▼                                  │
 Ocean / wind data ──► Drift simulation ─────┤
                                             │
 AIS positions ──► trajectories ──► anomaly detection
                                             │
                                             ▼
                                  suspect vessel ranking
                                             │
                                             ▼
                              React + MapLibre dashboard
```

## Technology stack

### AI / satellite processing
- Python
- PyTorch
- U-Net
- OpenCV
- Rasterio
- NumPy

### Data & ML
- Pandas
- GeoPandas
- Shapely
- Scikit-learn / DBSCAN
- XGBoost (optional ranking model)
- Matplotlib

### Geospatial
- PostGIS
- PyProj
- GeoJSON
- MapLibre GL JS

### Ocean modelling
- xarray
- NumPy / SciPy
- Public ocean-current and wind/weather datasets
- Copernicus Marine can be integrated as a production data source

### Application
- FastAPI + Python
- React + TypeScript
- Recharts
- PostgreSQL + PostGIS

### DevOps
- Git + GitHub
- Docker
- Docker Compose

## Repository structure

```text
Samsara/
├── backend/                 # FastAPI service
│   ├── app/
│   │   ├── api/             # API routes
│   │   ├── core/            # configuration
│   │   ├── models/          # domain models
│   │   ├── schemas/         # request/response schemas
│   │   ├── services/        # business logic
│   │   └── main.py
│   └── requirements.txt
├── frontend/                # React + TypeScript dashboard
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   └── App.tsx
│   └── package.json
├── ml/                      # satellite CV and vessel ML
│   ├── segmentation/
│   ├── preprocessing/
│   └── anomaly_detection/
├── ocean_model/             # drift simulation and environmental data
│   ├── simulation/
│   └── data/
├── geospatial/              # reusable GIS utilities
├── data/                    # local sample data only; large data is gitignored
├── database/
│   └── init.sql
├── docker-compose.yml
├── .env.example
└── .gitignore
```

## MVP capabilities

1. Upload or register a satellite raster.
2. Preprocess the raster with OpenCV/Rasterio.
3. Run a U-Net inference pipeline to produce an oil-spill mask.
4. Convert the mask to GeoJSON polygons.
5. Store spill geometry and investigation metadata in PostGIS.
6. Load AIS positions and build vessel trajectories.
7. Detect unusual vessel behaviour with DBSCAN-based features.
8. Run a drift simulation using currents and wind fields.
9. Rank candidate vessels using an explainable weighted score, with XGBoost available as an optional future model.
10. Visualize the spill, predicted origin zones, vessel tracks, scores, and investigation timeline in the React dashboard.

## Quick start

### Prerequisites

- Docker Desktop
- Docker Compose
- Git

### Run

```bash
git clone https://github.com/anshikashivhare/Samsara.git
cd Samsara
cp .env.example .env
docker compose up --build
```

Frontend: `http://localhost:5173`  
Backend API: `http://localhost:8000`  
API docs: `http://localhost:8000/docs`  
PostgreSQL/PostGIS: `localhost:5432`

## Data sources

The application is designed to accept public satellite, AIS, ocean-current, and weather datasets. Keep downloaded datasets outside Git history when they are large or restricted. Put credentials and service URLs in `.env` and never commit secrets.

## Status

This repository is an MVP foundation. Model weights, large satellite rasters, AIS archives, and production credentials are intentionally excluded from Git.
