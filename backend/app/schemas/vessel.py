from pydantic import BaseModel

class VesselResponse(BaseModel):
    mmsi: int
    name: str | None = None
    vessel_type: str | None = None
