from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Samsara API",
    version="0.1.0",
    description="AI-assisted maritime oil-spill investigation API",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "samsara-api"}


@app.get("/api/v1/investigations")
def list_investigations() -> dict[str, list]:
    return {"items": []}
