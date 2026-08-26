from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api import incidents, satellite, ais, drift, attribution

app = FastAPI(title="Samsara API", version="1.0.0", description="Maritime oil-spill investigation platform")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(incidents.router, prefix="/api/v1/incidents", tags=["incidents"])
app.include_router(satellite.router, prefix="/api/v1/satellite", tags=["satellite"])
app.include_router(ais.router, prefix="/api/v1/ais", tags=["ais"])
app.include_router(drift.router, prefix="/api/v1/drift", tags=["drift"])
app.include_router(attribution.router, prefix="/api/v1/attribution", tags=["attribution"])


@app.get("/health")
def health():
    return {"status": "ok", "service": "samsara-api"}
