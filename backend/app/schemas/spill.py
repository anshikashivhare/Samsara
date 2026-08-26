from pydantic import BaseModel, Field

class SpillResponse(BaseModel):
    id: str
    incident_id: str
    area_km2: float | None = Field(default=None, ge=0)
    confidence: float | None = Field(default=None, ge=0, le=1)
