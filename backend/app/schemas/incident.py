from pydantic import BaseModel

class IncidentCreate(BaseModel):
    name: str

class IncidentResponse(BaseModel):
    id: str
    name: str
    status: str
