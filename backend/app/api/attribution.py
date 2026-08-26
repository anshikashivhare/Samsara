from fastapi import APIRouter

router = APIRouter()

@router.get("/{incident_id}")
def attribution(incident_id: str):
    return {"incident_id": incident_id, "candidates": [], "status": "ready"}
