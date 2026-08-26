from fastapi import APIRouter
from pydantic import BaseModel
from uuid import uuid4

router = APIRouter()
_incidents = {}

class IncidentCreate(BaseModel):
    name: str

@router.post("")
def create_incident(payload: IncidentCreate):
    incident_id = str(uuid4())
    item = {"id": incident_id, "name": payload.name, "status": "active"}
    _incidents[incident_id] = item
    return item

@router.get("")
def list_incidents():
    return {"items": list(_incidents.values())}
