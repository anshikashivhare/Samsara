# API

FastAPI is the application boundary. Planned endpoints:

- `GET /health` — service health.
- `GET/POST /api/v1/incidents` — create and inspect investigations.
- `POST /api/v1/satellite/detect` — submit satellite imagery for detection.
- `GET /api/v1/ais/{mmsi}/trajectory` — retrieve a vessel trajectory.
- `POST /api/v1/drift/forecast` — run a drift forecast.
- `POST /api/v1/drift/hindcast` — estimate probable origins.
- `GET /api/v1/attribution/{incident_id}` — retrieve candidate vessel ranking and evidence.

OpenAPI documentation is served by FastAPI at `/docs` when the service is running.
