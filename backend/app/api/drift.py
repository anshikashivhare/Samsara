from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class DriftRequest(BaseModel):
    longitude: float
    latitude: float
    hours: int = 48

@router.post("/forecast")
def forecast(payload: DriftRequest):
    return {"start": {"longitude": payload.longitude, "latitude": payload.latitude}, "hours": payload.hours, "status": "queued"}

@router.post("/hindcast")
def hindcast(payload: DriftRequest):
    return {"start": {"longitude": payload.longitude, "latitude": payload.latitude}, "hours": payload.hours, "origin_zones": []}
