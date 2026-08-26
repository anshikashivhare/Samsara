from dataclasses import dataclass

@dataclass
class Spill:
    id: str
    incident_id: str
    area_km2: float | None = None
    confidence: float | None = None
